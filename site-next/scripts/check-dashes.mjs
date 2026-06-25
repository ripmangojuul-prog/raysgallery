// Anti-slop guard: the design skill bans em-dash (U+2014) and en-dash (U+2013)
// in any user-visible copy. This walks the source that renders text and fails
// the build if either character reappears, so the #1 tell cannot silently
// return. The Gemini prompt library (lib/gemini) is excluded: those strings are
// model instructions, never shown to a visitor.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = process.cwd();
const SCAN_DIRS = ['app', 'components', 'lib'];
const SCAN_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.md']);
const SKIP = new Set(['gemini']); // model-facing prompt text, not user-visible
const BANNED = /[—–]/;

const offenders = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
    } else if (SCAN_EXT.has(extname(entry))) {
      const lines = readFileSync(full, 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (BANNED.test(line)) {
          offenders.push(`${relative(ROOT, full)}:${i + 1}  ${line.trim().slice(0, 100)}`);
        }
      });
    }
  }
}

for (const d of SCAN_DIRS) {
  try {
    walk(join(ROOT, d));
  } catch {
    // directory may not exist yet
  }
}

if (offenders.length) {
  console.error(`\nFAIL: found ${offenders.length} em-dash / en-dash occurrence(s):\n`);
  offenders.forEach((o) => console.error('  ' + o));
  console.error('\nReplace every one with a period, comma, colon, parentheses, or spaced hyphen.\n');
  process.exit(1);
}

console.log('OK: zero em-dash / en-dash in user-visible source.');
