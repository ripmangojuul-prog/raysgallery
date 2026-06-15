import { chromium, type BrowserContext } from 'playwright';

// Google refuses sign-in in obviously-automated browsers ("this browser or app
// may not be secure"). Stripping the automation flags + using the REAL Google
// Chrome build (which you already have) gets past that block.
const ANTI_AUTOMATION_ARGS = ['--disable-blink-features=AutomationControlled'];

/**
 * Launch a persistent (logged-in-session) browser for Google Voice.
 * Prefers real Google Chrome; falls back to the bundled Chromium if Chrome
 * isn't installed. Set GV_BROWSER_CHANNEL='' in .env to force bundled Chromium.
 */
export async function launchGVContext(authDir: string, headless: boolean): Promise<BrowserContext> {
  const base = {
    headless,
    args: ANTI_AUTOMATION_ARGS,
    ignoreDefaultArgs: ['--enable-automation'],
    viewport: { width: 1280, height: 900 },
  };
  const channel = process.env.GV_BROWSER_CHANNEL ?? 'chrome';
  if (channel) {
    try {
      return await chromium.launchPersistentContext(authDir, { ...base, channel });
    } catch {
      // Chrome not installed / channel unavailable — fall back to bundled Chromium.
    }
  }
  return await chromium.launchPersistentContext(authDir, base);
}
