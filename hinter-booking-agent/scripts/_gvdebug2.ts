import 'dotenv/config';
import { launchGVContext } from '../src/lib/browser.js';

const authDir = process.env.GV_AUTH_DIR || './.gv-chrome';
const ctx = await launchGVContext(authDir, true);
const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto('https://voice.google.com/u/0/messages', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);

// 1) thread list item structure
const listInfo = await page.evaluate(() => {
  const item = document.querySelector('gv-thread-list-item') as HTMLElement | null;
  if (!item) return 'no gv-thread-list-item';
  return [
    'aria-label: ' + item.getAttribute('aria-label'),
    'text: ' + (item.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200),
    'outerHTML(0..1400): ' + item.outerHTML.replace(/\s+/g, ' ').slice(0, 1400),
  ].join('\n');
});
console.log('===== THREAD LIST ITEM =====\n' + listInfo);

// 2) open the thread
try {
  await page.click('gv-thread-list-item', { timeout: 5000 });
  await page.waitForTimeout(4000);
} catch (e) {
  console.log('click failed: ' + String(e));
}

// 3) opened-thread structure: bubbles, needle, input, send
const open = await page.evaluate(() => {
  const lines: string[] = [];
  const tagCounts: Record<string, number> = {};
  document.querySelectorAll('*').forEach((e) => {
    const t = e.tagName.toLowerCase();
    if (t.startsWith('gv-')) tagCounts[t] = (tagCounts[t] || 0) + 1;
  });
  lines.push('gv-* after open: ' + JSON.stringify(tagCounts));

  // message bubble candidates
  for (const sel of ['gv-text-message-item', 'gv-message', 'gv-annotation', '[data-e2e-message-text]']) {
    const els = Array.from(document.querySelectorAll(sel)) as HTMLElement[];
    if (els.length) {
      lines.push(`--- ${sel} (${els.length}) ---`);
      els.slice(-4).forEach((el, i) => lines.push(`  [${i}] aria="${el.getAttribute('aria-label')}" txt="${(el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120)}"`));
    }
  }

  // needle ancestry
  const NEEDLE = 'skull';
  const hit = (Array.from(document.querySelectorAll('*')) as HTMLElement[]).find((e) => e.children.length === 0 && (e.textContent || '').toLowerCase().includes(NEEDLE));
  if (hit) {
    lines.push('--- ancestry of "' + NEEDLE + '" ---');
    let n: HTMLElement | null = hit;
    let d = 0;
    while (n && d < 7) {
      lines.push(`  ${d}: <${n.tagName.toLowerCase()}> aria="${n.getAttribute('aria-label')}" cls="${(n.getAttribute('class') || '').slice(0, 60)}"`);
      n = n.parentElement;
      d++;
    }
  } else lines.push('needle not found after open');

  // input + send candidates
  const inputs = Array.from(document.querySelectorAll('textarea, [contenteditable="true"], input[type="text"]')) as HTMLElement[];
  lines.push('--- inputs (' + inputs.length + ') ---');
  inputs.forEach((el, i) => lines.push(`  [${i}] <${el.tagName.toLowerCase()}> aria="${el.getAttribute('aria-label')}" ph="${el.getAttribute('placeholder')}"`));
  const sendBtns = (Array.from(document.querySelectorAll('button')) as HTMLElement[]).filter((b) => /send/i.test(b.getAttribute('aria-label') || ''));
  lines.push('--- send buttons (' + sendBtns.length + ') ---');
  sendBtns.forEach((b, i) => lines.push(`  [${i}] aria="${b.getAttribute('aria-label')}"`));
  return lines.join('\n');
});
console.log('\n===== OPENED THREAD =====\n' + open);
console.log('\nURL: ' + page.url());
await ctx.close();
process.exit(0);
