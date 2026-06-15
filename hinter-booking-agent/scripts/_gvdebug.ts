import 'dotenv/config';
import { launchGVContext } from '../src/lib/browser.js';

const authDir = process.env.GV_AUTH_DIR || './.gv-chrome';
const ctx = await launchGVContext(authDir, true);
const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto('https://voice.google.com/u/0/messages', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);
console.log('URL: ' + page.url());

const dump = await page.evaluate(() => {
  const lines: string[] = [];
  const tagCounts: Record<string, number> = {};
  document.querySelectorAll('*').forEach((e) => {
    const t = e.tagName.toLowerCase();
    if (t.startsWith('gv-') || t.startsWith('mat-')) tagCounts[t] = (tagCounts[t] || 0) + 1;
  });
  lines.push('gv-/mat- tags: ' + JSON.stringify(tagCounts));
  lines.push('anchors /messages/: ' + document.querySelectorAll('a[href*="/messages/"]').length);
  lines.push('role=listitem: ' + document.querySelectorAll('[role="listitem"]').length);
  lines.push('role=row: ' + document.querySelectorAll('[role="row"]').length);

  const rowSelectors = ['gv-text-thread-item', 'gv-thread-item', '[role="listitem"]', 'a[href*="/messages/"]', '[role="row"]'];
  for (const sel of rowSelectors) {
    const els = Array.from(document.querySelectorAll(sel)) as HTMLElement[];
    if (!els.length) continue;
    lines.push(`--- rows via "${sel}" (${els.length}) ---`);
    els.slice(0, 5).forEach((el, i) => {
      lines.push(`[${i}] tag=${el.tagName.toLowerCase()} aria="${el.getAttribute('aria-label')}" text="${(el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160)}"`);
    });
  }

  const NEEDLE = 'skull';
  const all = Array.from(document.querySelectorAll('*')) as HTMLElement[];
  const hit = all.find((e) => e.children.length === 0 && (e.textContent || '').toLowerCase().includes(NEEDLE));
  if (hit) {
    lines.push(`--- ancestry of element containing "${NEEDLE}" ---`);
    let n: HTMLElement | null = hit;
    let depth = 0;
    while (n && depth < 9) {
      const cls = n.getAttribute('class') || '';
      lines.push(`${depth}: <${n.tagName.toLowerCase()}> aria="${n.getAttribute('aria-label')}" cls="${cls.slice(0, 70)}" txt="${(n.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90)}"`);
      n = n.parentElement;
      depth++;
    }
  } else {
    lines.push(`NEEDLE "${NEEDLE}" NOT found in DOM (thread may be unopened/preview truncated).`);
  }
  return lines;
});
console.log(dump.join('\n'));
await ctx.close();
process.exit(0);
