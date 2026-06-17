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
import { type MessagingAdapter, type InboundMessage, type InboundImage, normalizePhone } from './adapter.js';
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
  // Set when the window/context closes or crashes so the next poll relaunches
  // instead of hanging or looping forever against a dead browser.
  private browserDead = false;

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
    await this.launchBrowser();
  }

  /** (Re)launch the persistent browser + page and confirm we're logged in. */
  private async launchBrowser(): Promise<void> {
    // Best-effort tear down any prior (possibly half-dead) context first.
    try {
      await Promise.race([this.ctx?.close(), new Promise((r) => setTimeout(r, 4000))]);
    } catch {
      /* ignore */
    }
    this.ctx = await launchGVContext(this.authDir, (process.env.GV_HEADLESS ?? 'true') !== 'false');
    this.page = this.ctx.pages()[0] ?? (await this.ctx.newPage());
    // Bound every navigation/action so a wedged browser can't hang the loop.
    this.page.setDefaultNavigationTimeout(30000);
    this.page.setDefaultTimeout(15000);
    // tsx/esbuild wraps named functions with a __name() helper that doesn't exist
    // inside page.evaluate. Define it in every document (string form dodges
    // transpilation) so evaluate bodies below can use named local helpers.
    await this.page.addInitScript('globalThis.__name = globalThis.__name || function (n) { return n; };');
    // If the user closes the window or Chrome crashes, flag it so ensureAlive()
    // relaunches on the next cycle.
    this.browserDead = false;
    this.ctx.on('close', () => {
      this.browserDead = true;
    });
    this.page.on('close', () => {
      this.browserDead = true;
    });
    await this.page.goto(GV_URL, { waitUntil: 'domcontentloaded' });

    if (/accounts\.google\.com/.test(this.page.url())) {
      throw new Error('Not logged in to Google Voice. Run `npm run login-gv` first.');
    }
    log('info', 'Google Voice adapter ready.');
  }

  /** Relaunch the browser if it has closed/crashed since the last cycle. */
  private async ensureAlive(): Promise<void> {
    if (!this.browserDead && this.page && !this.page.isClosed()) return;
    log('warn', 'Google Voice browser was closed/crashed — relaunching…');
    await this.launchBrowser();
  }

  /** True if an error means the browser/page/context is gone (vs. a transient DOM hiccup). */
  private isDeadError(err: unknown): boolean {
    const m = String((err as { message?: string })?.message ?? err);
    return /Target (page, context or browser|closed)|browser has been closed|context or browser has been closed|has been closed|crashed|disconnected|Browser closed/i.test(
      m
    );
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
      await this.ensureAlive();
      await this.page.goto(GV_URL, { waitUntil: 'domcontentloaded' });
      await this.page.waitForSelector(SELECTORS.threadItem, { timeout: 10000 }).catch(() => {});

      // 1) Collect phones of UNREAD threads. GV marks an unread thread with the
      // word "Unread" — but that signal now lives in the row's aria-label, not
      // always in its visible textContent. Check BOTH (the row's own aria-label
      // only says "unread" when the thread genuinely is), or a GV DOM shift
      // silently hides every inbound text and the agent goes mute.
      const unreadPhones: string[] = await this.page.$$eval(SELECTORS.threadItem, (items) => {
        const out: string[] = [];
        for (const it of items) {
          const text = (it.textContent || '').replace(/\s+/g, ' ');
          const aria = (it.getAttribute('aria-label') || '').replace(/\s+/g, ' ');
          const hay = `${text} ${aria}`;
          if (!/unread/i.test(hay)) continue;
          const m = hay.match(/\(?\d{3}\)?[\s.\-]*\d{3}[\s.\-]*\d{4}/);
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

        // Nudge any lazy-loaded attachment into view, then wait for in-bubble
        // images to finish decoding so naturalWidth is real before we read them.
        await this.page.evaluate(() => {
          const items = document.querySelectorAll('gv-message-item');
          (items[items.length - 1] as HTMLElement | undefined)?.scrollIntoView({ block: 'end' });
        });
        await this.page
          .waitForFunction(
            () => {
              const imgs = Array.from(
                document.querySelectorAll('gv-message-item gv-image-attachment img, gv-message-item img.image')
              ) as HTMLImageElement[];
              return imgs.every((im) => im.complete && im.naturalWidth > 0);
            },
            { timeout: 4000 }
          )
          .catch(() => {}); // slow decode just means we may miss it this poll, not crash

        // Recent bubbles in chronological order: caption text + any image
        // attachments. GV serves MMS images from a same-origin /a/i/<id> proxy
        // (verified: type=basic, content-type image/jpeg), so we capture the
        // stable <id> for dedup and the src for byte extraction below.
        const bubbles = (await this.page.evaluate((sel) => {
          const clean = (s: string) =>
            (s || '')
              .replace(/\s+/g, ' ')
              .trim()
              .replace(/\s*\d{1,2}:\d{2}\s*(AM|PM)\b.*$/i, '') // strip trailing timestamp
              .trim();
          const items = Array.from(document.querySelectorAll(sel));
          return items.slice(-14).map((it) => {
            const imgEls = (
              Array.from(it.querySelectorAll('gv-image-attachment img, img.image')) as HTMLImageElement[]
            ).filter((im) => {
              const src = im.currentSrc || im.src || '';
              return (im.naturalWidth || im.width) >= 40 && /\/a\/i\//.test(src);
            });
            const images = imgEls.map((im) => {
              const src = im.currentSrc || im.src || '';
              const m = src.match(/\/a\/i\/([A-Za-z0-9]+)/);
              return { id: m ? m[1] : src.slice(-32), src };
            });
            const ann = it.querySelector('gv-annotation');
            // For image bubbles, trust only the annotation as caption (the bubble's
            // own textContent can pick up attachment chrome); else keep prior logic.
            const text = clean(ann?.textContent || (images.length ? '' : it.textContent) || '');
            return { text, images };
          });
        }, SELECTORS.messageItem)) as { text: string; images: { id: string; src: string }[] }[];

        // Walk newest->oldest, collecting bubbles we haven't seen. Our own sent
        // replies are in `seen`, so we stop at them — leaving the client's new
        // inbound burst. Image bubbles get an image-fingerprinted key so empty-
        // caption photos don't all collapse onto one key, and so they never
        // collide with send()'s text-only boundary markers.
        const keyOf = (b: { text: string; images: { id: string }[] }) => {
          const t = normalizeMsg(b.text);
          return b.images.length ? `${from}|${t}|${b.images.map((im) => im.id).join('+')}` : `${from}|${t}`;
        };
        const fresh: { text: string; images: { id: string; src: string }[] }[] = [];
        for (let i = bubbles.length - 1; i >= 0 && fresh.length < 6; i--) {
          const b = bubbles[i];
          if (!b.text && !b.images.length) continue; // skip empty spacer/system bubbles
          if (this.seen.has(keyOf(b))) break;
          fresh.unshift(b);
        }
        if (!fresh.length) continue;
        for (const b of fresh) this.seen.add(keyOf(b));

        // Pull image bytes for the fresh burst — a same-origin fetch inside the
        // authenticated page (FileReader avoids the base64 call-stack trap; any
        // non-jpeg/png is normalized to jpeg via an untainted same-origin canvas).
        // Isolated + best-effort: a capture failure must never drop the text.
        const freshSrcs = fresh.flatMap((b) => b.images.map((im) => im.src)).slice(0, 4);
        let images: InboundImage[] = [];
        if (freshSrcs.length) {
          try {
            const raw = (await this.page.evaluate(async (srcs: string[]) => {
              const readAsDataUrl = (blob: Blob) =>
                new Promise<string>((resolve, reject) => {
                  const fr = new FileReader();
                  fr.onload = () => resolve(String(fr.result));
                  fr.onerror = () => reject(fr.error);
                  fr.readAsDataURL(blob);
                });
              const toJpeg = async (blob: Blob) => {
                const bmp = await createImageBitmap(blob);
                const MAX = 1600; // bound the long edge -> bounds payload bytes
                const scale = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
                const c = document.createElement('canvas');
                c.width = Math.max(1, Math.round(bmp.width * scale));
                c.height = Math.max(1, Math.round(bmp.height * scale));
                c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
                bmp.close?.();
                return await new Promise<Blob>((r) => c.toBlob((bb) => r(bb!), 'image/jpeg', 0.85));
              };
              const out: ({ mimeType: string; dataBase64: string } | null)[] = [];
              for (const src of srcs) {
                try {
                  const res = await fetch(src, { credentials: 'include' });
                  if (!res.ok) {
                    out.push(null);
                    continue;
                  }
                  let blob = await res.blob();
                  if (blob.type !== 'image/jpeg' && blob.type !== 'image/png') blob = await toJpeg(blob);
                  const dataUrl = await readAsDataUrl(blob);
                  const mt = (dataUrl.match(/^data:([^;]+);base64,/) || [])[1];
                  const b64 = dataUrl.split(',')[1];
                  out.push(mt && b64 ? { mimeType: mt, dataBase64: b64 } : null);
                } catch {
                  out.push(null);
                }
              }
              return out;
            }, freshSrcs)) as ({ mimeType: string; dataBase64: string } | null)[];
            // Hard guard: only emit types xAI actually accepts (jpeg/png).
            images = raw.filter(
              (x): x is InboundImage => !!x && (x.mimeType === 'image/jpeg' || x.mimeType === 'image/png')
            );
          } catch (err) {
            log('warn', 'GV image extraction failed (text still delivered)', err);
          }
        }

        // Combine the burst into one turn. If photos were present but none could
        // be captured, say so explicitly so the agent can ask the client to
        // resend rather than silently ignoring the reference image.
        const captions = fresh.map((b) => b.text).filter(Boolean);
        let combined = captions.join('\n');
        if (freshSrcs.length && !images.length) {
          combined = (combined ? combined + '\n' : '') + '(the client sent a photo that could not be loaded)';
        }
        const idFp = images.length ? '|' + fresh.flatMap((b) => b.images.map((im) => im.id)).join('+') : '';
        messages.push({
          id: `${from}|${normalizeMsg(combined)}${idFp}`.slice(0, 240),
          from,
          text: combined,
          images: images.length ? images : undefined,
          ts: Date.now(),
        });
      }

      if (messages.length) this.persistSeen();
      return messages;
    } catch (err) {
      if (this.isDeadError(err)) {
        this.browserDead = true;
        log('warn', 'GV poll: browser is gone — will relaunch next cycle', String(err).slice(0, 120));
      } else {
        log('error', 'GV poll failed', err);
      }
      return [];
    }
  }

  async send(to: string, text: string, retrying = false): Promise<void> {
    const e164 = normalizePhone(to);
    try {
      await this.ensureAlive();
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
      // If the browser died mid-send, relaunch and retry the send once so the
      // reply isn't silently lost.
      if (this.isDeadError(err) && !retrying) {
        this.browserDead = true;
        log('warn', `GV send to ${e164}: browser gone — relaunching and retrying once`);
        await this.ensureAlive();
        return this.send(to, text, true);
      }
      log('error', `GV send to ${e164} failed`, err);
      throw err;
    }
  }

  async close(): Promise<void> {
    this.persistSeen();
    await this.ctx?.close();
  }
}
