import 'dotenv/config';
import { checkAvailability } from '../src/tools/calendar.js';

const slots = await checkAvailability({ durationHours: 4, maxSuggestions: 6 });
console.log('Next open days on Ray’s real calendar (4h session):');
if (!slots.length) console.log('  (none found in window)');
for (const s of slots) console.log('  - ' + s.human + '   [' + s.startISO + ']');
process.exit(0);
