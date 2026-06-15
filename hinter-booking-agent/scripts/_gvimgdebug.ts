// ─────────────────────────────────────────────────────────────────────────────
// Comprehensive MMS-image ground-truth probe for the Google Voice web DOM.
//
// Run AFTER texting a photo (ideally: one image-only, plus one 2-photo MMS) to the
// booking number, then:   npx tsx scripts/_gvimgdebug.ts
//
// It opens the most-recent threads and, for the first that contains in-bubble
// images, answers every question the implementation depends on:
//   • the real attachment WRAPPER element + ancestry (so we don't grab avatars)
//   • whether each image is an avatar/header/thread-list element (false positives)
//   • CANVAS-TAINT test: can we drawImage->toDataURL('image/jpeg')?  (the load-bearing Q)
//   • AUTH-FETCH test: fetch(src,{credentials:'include'}) status / content-type / bytes
//   • MAGIC-BYTE sniff of the real format (jpeg/png/webp/gif/heic)
//   • lazy-load: it scrolls + awaits decode first, so naturalWidth is real
//   • multi-image: how many <img> render inside one gv-message-item
//
// NOTE: opening a thread marks it READ in Google Voice. Use a throwaway test thread.
// Honors GV_AUTH_DIR + GV_HEADLESS from .env (same launch the agent uses). Override
// headless for this run with: GV_HEADLESS=false npx tsx scripts/_gvimgdebug.ts
// ─────────────────────────────────────────────────────────────────────────────
import 'dotenv/config';
import { launchGVContext } from '../src/lib/browser.js';

const authDir = process.env.GV_AUTH_DIR || './.gv-chrome';
const headless = (process.env.GV_HEADLESS ?? 'true') !== 'false';
const GV_URL = 'https://voice.google.com/u/0/messages';

console.log(`launch: authDir=${authDir} headless=${headless}`);
const ctx = await launchGVContext(authDir, headless);
const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto(GV_URL, { waitUntil: 'domcontentloaded' });
// tsx/esbuild wraps named fns with a __name() helper that doesn't exist inside
// page.evaluate. Define it in the page (string form dodges transpilation), then
// reload so the init script runs in the fresh document.
await page.addInitScript('globalThis.__name = globalThis.__name || function (n) { return n; };');
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);

if (/accounts\.google\.com|\/signin|workspace\.google\.com/.test(page.url())) {
  console.log(`\n!! NOT LOGGED IN — landed on ${page.url()}\n   This launch config can't see the authenticated DOM. Re-run with GV_HEADLESS=false,\n   or run \`npm run login-gv\` to refresh the session.`);
  await ctx.close();
  process.exit(1);
}

await page.waitForSelector('gv-thread-list-item', { timeout: 15000 }).catch(() => console.log('no thread items appeared'));
const nThreads = await page.$$eval('gv-thread-list-item', (e) => e.length).catch(() => 0);
console.log(`logged in. threads visible: ${nThreads}`);

const MAX = Math.min(nThreads, 8);
let done = false;

for (let i = 0; i < MAX && !done; i++) {
  await page.locator('gv-thread-list-item [role="button"]').nth(i).click({ timeout: 8000 }).catch((e) => console.log(`thread[${i}] click err: ${String(e).slice(0, 70)}`));
  await page.waitForSelector('gv-message-item', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1200);

  // Force lazy images to render: scroll the message area to the bottom, then wait
  // for any in-bubble <img> to finish decoding (img.complete && naturalWidth>0).
  await page.evaluate(() => {
    const items = document.querySelectorAll('gv-message-item');
    items[items.length - 1]?.scrollIntoView({ block: 'end' });
  });
  await page.waitForTimeout(800);
  await page
    .waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll('gv-message-item img')) as HTMLImageElement[];
      const big = imgs.filter((im) => (im.naturalWidth || 0) >= 40);
      return big.length === 0 || big.every((im) => im.complete && im.naturalWidth > 0);
    }, { timeout: 6000 })
    .catch(() => console.log(`thread[${i}]: decode wait timed out (lazy-load may be slow)`));

  const report = await page.evaluate(async () => {
    const lines: string[] = [];
    const ancestry = (el: Element, depth = 8) => {
      const chain: string[] = [];
      let n: Element | null = el;
      let d = 0;
      while (n && d < depth) {
        const cls = (n.getAttribute('class') || '').slice(0, 48);
        chain.push(`<${n.tagName.toLowerCase()}${cls ? ' .' + cls.replace(/\s+/g, '.') : ''}>`);
        n = n.parentElement;
        d++;
      }
      return chain.join(' < ');
    };
    const sniff = (b: Uint8Array) => {
      if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
      if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
      if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'image/gif';
      if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
      if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return 'image/heic/heif';
      return 'unknown';
    };

    const allImgs = Array.from(document.querySelectorAll('gv-message-item img')) as HTMLImageElement[];
    const candidates = allImgs.filter((im) => (im.naturalWidth || im.width) >= 40);
    if (!candidates.length) return { hasImg: false, lines };

    lines.push(`gv-message-item img total=${allImgs.length} candidates(>=40px)=${candidates.length}`);
    // how many candidate imgs per bubble (multi-image MMS detection)
    const perBubble = Array.from(document.querySelectorAll('gv-message-item')).map(
      (it) => (Array.from(it.querySelectorAll('img')) as HTMLImageElement[]).filter((im) => (im.naturalWidth || 0) >= 40).length
    );
    lines.push(`candidate imgs per bubble: [${perBubble.join(',')}]`);

    for (let k = 0; k < candidates.length; k++) {
      const img = candidates[k];
      const src = img.currentSrc || img.src || '';
      const attrSrc = img.getAttribute('src') || '';
      const avatarCtx = img.closest('gv-avatar, [class*="avatar" i], [class*="sender" i], [class*="thread-list" i], gv-thread-list-item, [class*="header" i]');
      lines.push(`\n── IMG[${k}] nat=${img.naturalWidth}x${img.naturalHeight} disp=${img.width}x${img.height} complete=${img.complete}`);
      lines.push(`   src=${src.slice(0, 170)}${src.length > 170 ? `…(${src.length})` : ''}`);
      lines.push(`   currentSrc===attrSrc? ${src === attrSrc}  srcset=${(img.getAttribute('srcset') || '').slice(0, 90)}`);
      lines.push(`   alt="${img.alt}" aria="${img.getAttribute('aria-label') || ''}"`);
      lines.push(`   AVATAR/HEADER ctx match: ${avatarCtx ? '<' + avatarCtx.tagName.toLowerCase() + ' .' + (avatarCtx.getAttribute('class') || '').slice(0, 40) + '>' : 'none (looks like a real attachment)'}`);
      lines.push(`   ancestry: ${ancestry(img)}`);

      // CANVAS-TAINT TEST (the load-bearing question)
      let canvasResult = '';
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth || img.width;
        c.height = img.naturalHeight || img.height;
        c.getContext('2d')!.drawImage(img, 0, 0);
        const url = c.toDataURL('image/jpeg', 0.85);
        canvasResult = `OK jpegDataUrlLen=${url.length} (canvas NOT tainted → canvas-primary viable)`;
      } catch (e) {
        canvasResult = `TAINTED/FAILED: ${String(e).slice(0, 90)} (must use fetch path)`;
      }
      lines.push(`   CANVAS: ${canvasResult}`);

      // AUTH-FETCH TEST
      let fetchResult = '';
      try {
        const res = await fetch(src, { credentials: 'include' });
        const ct = res.headers.get('content-type') || '';
        const buf = new Uint8Array(await res.arrayBuffer());
        fetchResult = `status=${res.status} type=${res.type} content-type=${ct} bytes=${buf.length} magic=${sniff(buf)}`;
      } catch (e) {
        fetchResult = `FAILED: ${String(e).slice(0, 90)}`;
      }
      lines.push(`   FETCH: ${fetchResult}`);
    }
    return { hasImg: true, lines };
  });

  if (report.hasImg) {
    console.log(`\n===== THREAD[${i}] — ${page.url()} =====`);
    console.log(report.lines.join('\n'));
    done = true;
  } else {
    console.log(`thread[${i}]: no in-bubble image candidates`);
  }
}

if (!done) console.log('\nNo in-bubble images found in recent threads. Text a photo to the GV number, then re-run.');
await ctx.close();
process.exit(0);
