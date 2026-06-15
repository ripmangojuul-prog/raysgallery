import 'dotenv/config';
import { launchGVContext } from '../src/lib/browser.js';

const authDir = process.env.GV_AUTH_DIR || './.gv-chrome';
const ctx = await launchGVContext(authDir, true);
const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto('https://voice.google.com/u/0/messages', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('gv-thread-list-item', { timeout: 12000 }).catch(() => console.log('no thread items appeared'));
await page.waitForTimeout(2000);

const nThreads = await page.$$eval('gv-thread-list-item', (els) => els.length);
console.log('threads:', nThreads);

// open first thread by clicking its inner button
await page.locator('gv-thread-list-item [role="button"]').first().click({ timeout: 8000 }).catch((e) => console.log('click err: ' + String(e).slice(0, 100)));
await page.waitForSelector('gv-message-item', { timeout: 10000 }).catch(() => console.log('no message items appeared'));
await page.waitForTimeout(2500);
console.log('URL:', page.url());

const dump = await page.evaluate(() => {
  const items = Array.from(document.querySelectorAll('gv-message-item'));
  if (!items.length) return 'NO gv-message-item found';
  return items
    .slice(-10)
    .map((it, i) => {
      const cls = it.getAttribute('class') || '';
      const attrs = it.getAttributeNames().map((n) => `${n}="${it.getAttribute(n)}"`).join(' ').slice(0, 200);
      const text = (it.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 70);
      const dirCls = Array.from(it.querySelectorAll('[class]'))
        .map((e) => e.getAttribute('class') || '')
        .filter((c) => /incom|outgo|sent|receiv|self|other|sender|mine|reply|right|left/i.test(c))
        .slice(0, 4)
        .join(' | ');
      return `[${i}] item.cls="${cls}"\n     attrs=${attrs}\n     dirCls="${dirCls}"\n     text="${text}"`;
    })
    .join('\n');
});
console.log(dump);
await ctx.close();
process.exit(0);
