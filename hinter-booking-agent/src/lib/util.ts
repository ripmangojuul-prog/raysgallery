// Small shared utilities. (Source is intentionally ASCII-only: special code
// points are constructed via escapes / String.fromCharCode so nothing can be
// corrupted by copy/paste.)

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Zero-width joiner (U+200D), combining enclosing keycap (U+20E3), and the
// variation selectors (U+FE00..U+FE0F) — the connective tissue of emoji.
const EMOJI_JOINERS = new RegExp('[\\u200D\\u20E3\\uFE00-\\uFE0F]', 'gu');

/**
 * Strip emojis/emoticons from outbound text. Belt-and-suspenders for the prompt's
 * hard zero-emoji rule. Removes pictographs, variation selectors, skin-tone
 * modifiers, ZWJ sequences, and regional indicators, then tidies spacing.
 */
export function stripEmoji(input: string): string {
  return input
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '') // regional indicators (flags)
    .replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '') // skin-tone modifiers
    .replace(EMOJI_JOINERS, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +\n/g, '\n')
    .trim();
}

/**
 * The model often replies in several short "bubbles" separated by blank lines.
 * Split into separate sends so it reads like real texting. Capped.
 */
export function splitIntoBubbles(text: string, max: number): string[] {
  const parts = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length <= max) return parts;
  // Merge overflow into the last allowed bubble.
  const head = parts.slice(0, max - 1);
  const tail = parts.slice(max - 1).join('\n\n');
  return [...head, tail];
}

/** U+2028 / U+2029 are valid JSON but break JS string literals — sanitize tool results. */
export function sanitizeToolResult(content: string): string {
  const LINE_SEP = String.fromCharCode(0x2028);
  const PARA_SEP = String.fromCharCode(0x2029);
  return content.split(LINE_SEP).join('\n').split(PARA_SEP).join('\n');
}

/** Retry on 429/5xx with exponential backoff, respecting retry-after. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  { maxRetries = 4, baseDelayMs = 1000, label = 'request' } = {}
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const status = err?.status ?? err?.response?.status;
      const retryable = status === 429 || (status >= 500 && status < 600);
      if (!retryable || attempt === maxRetries) throw err;
      // Header shape differs across SDKs: Anthropic err.response.headers[...],
      // OpenAI v4 err.headers[...], OpenAI v6 err.headers.get(...).
      const hdrs = err?.response?.headers ?? err?.headers;
      const retryAfterRaw = typeof hdrs?.get === 'function' ? hdrs.get('retry-after') : hdrs?.['retry-after'];
      const retryAfter = Number(retryAfterRaw);
      const delay =
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : baseDelayMs * 2 ** attempt;
      console.warn(
        `[retry] ${label} failed (${status}); retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`
      );
      await sleep(delay);
    }
  }
  throw lastErr;
}

export function log(level: 'info' | 'warn' | 'error', msg: string, extra?: unknown) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${level.toUpperCase()} ${msg}`;
  if (level === 'error') console.error(line, extra ?? '');
  else if (level === 'warn') console.warn(line, extra ?? '');
  else console.log(line, extra ?? '');
}
