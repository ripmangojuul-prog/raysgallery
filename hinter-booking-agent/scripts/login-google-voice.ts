// One-time: log in to Google Voice and persist the browser session to GV_AUTH_DIR.
// Run: npm run login-gv
//
// A real browser window opens. Sign in to the Google account that owns the
// booking number (480) 420-4319. Once you're looking at your Messages list, the
// script detects it and saves the session automatically — no key press needed.
import 'dotenv/config';
import { existsSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { launchGVContext } from '../src/lib/browser.js';

const authDir = process.env.GV_AUTH_DIR || './.gv-auth';
const TIMEOUT_MS = 8 * 60 * 1000; // 8 minutes to finish signing in

async function main() {
  if (!existsSync(authDir)) mkdirSync(authDir, { recursive: true });
  const ctx = await launchGVContext(authDir, false);
  const page = ctx.pages()[0] ?? (await ctx.newPage());
  await page.goto('https://voice.google.com/u/0/messages');

  console.log('\n=== Google Voice login ===');
  console.log('A browser window opened. Sign in to the account that owns (480) 420-4319.');
  console.log('When you can SEE your Messages list, just leave it — this saves automatically.\n');

  // "Logged in" = we're sitting on voice.google.com (not an accounts/sign-in page)
  // and staying there. Require it stable across several checks to avoid false hits.
  const deadline = Date.now() + TIMEOUT_MS;
  let stable = 0;
  while (Date.now() < deadline) {
    await sleep(3000);
    let url = '';
    try {
      url = page.url();
    } catch {
      continue;
    }
    const onVoice =
      url.includes('voice.google.com') &&
      !url.includes('accounts.google.com') &&
      !url.includes('/signin');
    if (onVoice) {
      stable++;
      if (stable === 1) console.log('Detected Google Voice — confirming you stay signed in...');
      if (stable >= 4) break; // ~12s stable on the app
    } else {
      stable = 0;
    }
  }

  if (stable >= 4) {
    await sleep(1500);
    await ctx.close(); // flush cookies to authDir
    console.log(`\nLogged in. Session saved to ${authDir}. You can now run: npm start`);
    process.exit(0);
  }
  await ctx.close();
  console.log('\nTimed out waiting for sign-in. Re-run `npm run login-gv` and finish logging in.');
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
