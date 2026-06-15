// ─────────────────────────────────────────────────────────────────────────────
// Google Voice adapter (Playwright).
//
// ⚠️ THE ONE FRAGILE PIECE. Google Voice has no API, so we drive the logged-in
// web app. Selectors below are derived from the REAL DOM (June 2026). If Google
// changes their markup, the SELECTORS block is the only thing to re-tune (run a
// quick DOM dump like scripts/_gvdebug.ts to see the new structure).
//
// Setup: `npm run login-gv` once to persist the session into GV_AUTH_DIR.
// Validate the whole brain without GV anytime via `npm run chat`.
// ─────────────────────────────────────────────────────────────────────────────

import { type BrowserContext, type Page } from 'playwright';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { type MessagingAdapter, type InboundMessage, normalizePhone } from './adapter.js';
import { launchGVContext } from '../lib/browser.js';
import { log } from '../lib/util.js';

const GV_URL = 'https://voice.google.com/u/0/messages';

// ── Real selectors (verified against the live GV DOM) ───────────────────────
const SELECTORS = {
  threadItem: 'gv-thread-list-item', // a conversation row in the left list
  messageItem: 'gv-message-item', // a single message bubble in an open thread
  messageInput: 'textarea[placeholder="Type a message"]',
  sendButton: 'button[aria-label="Send message"]',
  newMessageButton: 'a[aria-label="Send new message"], button[aria-label="Send new message"]',
  recipientInput: 'input[placeholder="Enter a name or number"]',
};

interface SeenStore {
  ids: string[];
}

// Normalize message text so a sent reply matches its DOM read-back (used to tell
// our own outbound bubbles apart from new inbound ones, without DOM direction).
function normalizeMsg(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.!?,]+$/g, '')
    .trim();
}

export class GoogleVoiceAdapter implements MessagingAdapter {
  private ctx!: BrowserContext;
  private page!: Page;
  private authDir: string;
  private seen = new Set<string>();
  private seenFile: string;

  constructor() {
    this.authDir = process.env.GV_AUTH_DIR || './.gv-chrome';
    this.seenFile = join(this.authDir, 'seen.json');
  }

  async init(): Promise<void> {
    if (!existsSync(this.authDir)) mkdirSync(this.authDir, { recursive: true });
    if (existsSync(this.seenFile)) {
      try {
        const data = JSON.parse(readFileSync(this.seenFile, 'utf8')) as SeenStore;
        this.seen = new Set(data.ids ?? []);
      } catch {
        /* ignore corrupt seen file */
      }
    }
    this.ctx = await launchGVContext(this.authDir, (process.env.GV_HEADLESS ?? 'true') !== 'false');
    this.page = this.ctx.pages()[0] ?? (await this.ctx.newPage());
    await this.page.goto(GV_URL, { waitUntil: 'domcontentloaded' });

    if (/accounts\.google\.com/.test(this.page.url())) {
      throw new Error('Not logged in to Google Voice. Run `npm run login-gv` first.');
    }
    log('info', 'Google Voice adapter ready.');
  }

  private persistSeen() {
    const ids = [...this.seen].slice(-2000);
    this.seen = new Set(ids);
    writeFileSync(this.seenFile, JSON.stringify({ ids } satisfies SeenStore));
  }

  private threadUrl(e164: string) {
    return `${GV_URL}?itemId=${encodeURIComponent('t.' + e164)}`;
  }

  async poll(): Promise<InboundMessage[]> {
    try {
      await this.page.goto(GV_URL, { waitUntil: 'domcontentloaded' });
      await this.page.waitForSelector(SELECTORS.threadItem, { timeout: 10000 }).catch(() => {});

      // 1) Collect phones of UNREAD threads (their row text contains "Unread").
      const unreadPhones: string[] = await this.page.$$eval(SELECTORS.threadItem, (items) => {
        const out: string[] = [];
        for (const it of items) {
          const text = (it.textContent || '').replace(/\s+/g, ' ');
          if (!/unread/i.test(text)) continue;
          const m = text.match(/\(?\d{3}\)?[\s.\-]*\d{3}[\s.\-]*\d{4}/);
          if (m) out.push(m[0]);
        }
        return out;
      });

      // 2) Open each unread thread (marks it read) and read the NEW inbound run.
      const messages: InboundMessage[] = [];
      for (const raw of unreadPhones) {
        const from = normalizePhone(raw);
        await this.page.goto(this.threadUrl(from), { waitUntil: 'domcontentloaded' });
        await this.page.waitForSelector(SELECTORS.messageItem, { timeout: 8000 }).catch(() => {});
        await this.page.waitForTimeout(1200);

        // Recent bubble texts in chronological order.
        const texts: string[] = await this.page.evaluate((sel) => {
          const items = Array.from(document.querySelectorAll(sel)).slice(-14);
          return items
            .map((it) => {
              const ann = it.querySelector('gv-annotation');
              let t = (ann?.textContent || it.textContent || '').replace(/\s+/g, ' ').trim();
              t = t.replace(/\s*\d{1,2}:\d{2}\s*(AM|PM)\b.*$/i, '').trim(); // strip trailing timestamp
              return t;
            })
            .filter(Boolean);
        }, SELECTORS.messageItem);

        // Walk back from the newest, collecting bubbles we haven't seen. Our own
        // sent replies are in `seen`, so we stop at them — leaving exactly the
        // client's new inbound burst (handles several fast texts in a row).
        const fresh: string[] = [];
        for (let i = texts.length - 1; i >= 0 && fresh.length < 6; i--) {
          const key = `${from}|${normalizeMsg(texts[i])}`;
          if (this.seen.has(key)) break;
          fresh.unshift(texts[i]);
        }
        if (!fresh.length) continue;
        for (const t of fresh) this.seen.add(`${from}|${normalizeMsg(t)}`);

        // Combine the burst into one turn so the agent sees all of it at once.
        const combined = fresh.join('\n');
        messages.push({ id: `${from}|${normalizeMsg(combined)}`.slice(0, 240), from, text: combined, ts: Date.now() });
      }

      if (messages.length) this.persistSeen();
      return messages;
    } catch (err) {
      log('error', 'GV poll failed', err);
      return [];
    }
  }

  async send(to: string, text: string): Promise<void> {
    const e164 = normalizePhone(to);
    try {
      // Open (or create) the thread for this number, then type + send.
      await this.page.goto(this.threadUrl(e164), { waitUntil: 'domcontentloaded' });
      await this.page.waitForTimeout(1500);

      let input = this.page.locator(SELECTORS.messageInput).first();
      if (!(await input.isVisible().catch(() => false))) {
        // No existing thread — use the "Send new message" compose flow.
        await this.page.goto(GV_URL, { waitUntil: 'domcontentloaded' });
        await this.page.click(SELECTORS.newMessageButton, { timeout: 8000 }).catch(() => {});
        const recip = this.page.locator(SELECTORS.recipientInput).first();
        await recip.fill(e164.replace('+1', ''));
        await this.page.waitForTimeout(1200);
        await recip.press('Enter');
        await this.page.waitForTimeout(900);
        input = this.page.locator(SELECTORS.messageInput).first();
      }

      await input.click();
      await input.fill(text);
      await this.page.waitForTimeout(300);

      const sendBtn = this.page.locator(SELECTORS.sendButton).first();
      if (await sendBtn.isEnabled().catch(() => false)) await sendBtn.click();
      else await input.press('Enter');
      await this.page.waitForTimeout(900);
      // Record our own outbound so poll() treats it as a "seen" boundary, not new inbound.
      this.seen.add(`${e164}|${normalizeMsg(text)}`);
      this.persistSeen();
      log('info', `Sent to ${e164}: ${text.slice(0, 60)}...`);
    } catch (err) {
      log('error', `GV send to ${e164} failed`, err);
      throw err;
    }
  }

  async close(): Promise<void> {
    this.persistSeen();
    await this.ctx?.close();
  }
}
