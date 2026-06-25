// Replays poll()'s exact decision pipeline against the live GV state + on-disk
// seen.json, with verbose output, to find why it isn't replying. Read-only-ish
// (it opens threads, which marks them read — same as a real poll).
//   npx tsx scripts/_gvdiag.ts
import 'dotenv/config';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { launchGVContext } from '../src/lib/browser.js';

const authDir = process.env.GV_AUTH_DIR || './.gv-chrome';
const headless = (process.env.GV_HEADLESS ?? 'true') !== 'false';
const GV_URL = 'https://voice.google.com/u/0/messages';

function normalizeMsg(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').replace(/[.!?,]+$/g, '').trim();
}
function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  const d = digits.replace(/\D/g, '');
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith('1')) return `+${d}`;
  return raw.trim();
}

// load seen.json exactly as the adapter does
const seenFile = join(authDir, 'seen.json');
let seen = new Set<string>();
if (existsSync(seenFile)) {
  try {
    seen = new Set((JSON.parse(readFileSync(seenFile, 'utf8')).ids as string[]) ?? []);
  } catch {}
}
console.log(`seen.json: ${seen.size} keys (file: ${seenFile})`);

const ctx = await launchGVContext(authDir, headless);
const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.addInitScript('globalThis.__name = globalThis.__name || function (n) { return n; };');
await page.goto(GV_URL, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('gv-thread-list-item', { timeout: 12000 }).catch(() => console.log('no thread items'));
await page.waitForTimeout(2000);

// ── STEP 1: thread rows + unread detection (poll() step 1) ──
const rows = await page.$$eval('gv-thread-list-item', (items) =>
  items.map((it) => ({
    aria: it.getAttribute('aria-label') || '',
    text: (it.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160),
  }))
);
console.log(`\n=== THREAD ROWS (${rows.length}) ===`);
rows.forEach((r, i) => {
  const unread = /unread/i.test(r.text) || /unread/i.test(r.aria);
  const m = (r.text + ' ' + r.aria).match(/\(?\d{3}\)?[\s.\-]*\d{3}[\s.\-]*\d{4}/);
  console.log(`[${i}] unread(text)=${/unread/i.test(r.text)} unread(aria)=${/unread/i.test(r.aria)} phoneMatch=${m ? m[0] : 'NONE'}`);
  console.log(`     aria="${r.aria}"`);
  console.log(`     text="${r.text}"`);
});

// poll() ONLY looks at text (not aria) for unread + phone:
const unreadPhones = rows
  .filter((r) => /unread/i.test(r.text))
  .map((r) => (r.text.match(/\(?\d{3}\)?[\s.\-]*\d{3}[\s.\-]*\d{4}/) || [])[0])
  .filter(Boolean) as string[];
console.log(`\npoll() would see unreadPhones = ${JSON.stringify(unreadPhones)}`);

// ── STEP 2: open first thread, replay burst/seen walk ──
const target = rows[0];
const phoneM = (target.text + ' ' + target.aria).match(/\(?\d{3}\)?[\s.\-]*\d{3}[\s.\-]*\d{4}/);
const from = phoneM ? normalizePhone(phoneM[0]) : '+14809790110';
console.log(`\n=== OPENING THREAD for ${from} ===`);
await page.goto(`${GV_URL}?itemId=${encodeURIComponent('t.' + from)}`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('gv-message-item', { timeout: 8000 }).catch(() => {});
await page.waitForTimeout(1500);

const bubbles = await page.evaluate((sel) => {
  const clean = (s: string) =>
    (s || '').replace(/\s+/g, ' ').trim().replace(/\s*\d{1,2}:\d{2}\s*(AM|PM)\b.*$/i, '').trim();
  const items = Array.from(document.querySelectorAll(sel));
  return items.slice(-14).map((it) => {
    const imgEls = (Array.from(it.querySelectorAll('gv-image-attachment img, img.image')) as HTMLImageElement[]).filter((im) => {
      const src = im.currentSrc || im.src || '';
      return (im.naturalWidth || im.width) >= 40 && /\/a\/i\//.test(src);
    });
    const images = imgEls.map((im) => {
      const src = im.currentSrc || im.src || '';
      const m = src.match(/\/a\/i\/([A-Za-z0-9]+)/);
      return { id: m ? m[1] : src.slice(-32) };
    });
    const ann = it.querySelector('gv-annotation');
    const text = clean(ann?.textContent || (images.length ? '' : it.textContent) || '');
    return { text, images };
  });
}, 'gv-message-item');

const keyOf = (b: { text: string; images: { id: string }[] }) => {
  const t = normalizeMsg(b.text);
  return b.images.length ? `${from}|${t}|${b.images.map((im) => im.id).join('+')}` : `${from}|${t}`;
};

console.log(`\n=== RECENT BUBBLES (${bubbles.length}) — newest last ===`);
bubbles.forEach((b, i) => {
  const k = keyOf(b);
  console.log(`[${i}] seen=${seen.has(k)} imgs=${b.images.length} key="${k.slice(0, 80)}" text="${(b.text || '[photo]').slice(0, 60)}"`);
});

// replay the walk
const fresh: typeof bubbles = [];
for (let i = bubbles.length - 1; i >= 0 && fresh.length < 6; i--) {
  const b = bubbles[i];
  if (!b.text && !b.images.length) continue;
  if (seen.has(keyOf(b))) break;
  fresh.unshift(b);
}
console.log(`\n=== RESULT: poll() would treat ${fresh.length} bubble(s) as FRESH ===`);
fresh.forEach((b) => console.log(`  FRESH: "${(b.text || '[photo]').slice(0, 70)}" imgs=${b.images.length}`));
if (!fresh.length) console.log('  -> nothing fresh -> agent stays silent. (See why above: newest bubble already in seen, or empty.)');

await ctx.close();
process.exit(0);
