// Local console tester — exercise the WHOLE brain (voice, tools, vision, deposit
// flow) without Google Voice. Run: npm run chat
//
// You play the client. Special commands:
//   /img <path>   attach a local image (tests vision against the Style Bible)
//   /confirm      simulate Ray confirming the deposit (sets depositConfirmed + books)
//   /state        dump the current conversation state
//   /quit         exit
//
// Needs XAI_API_KEY always; check_availability/create_booking also need the
// Google Calendar token; record/booking writes need Firestore creds.
import 'dotenv/config';
import readline from 'node:readline';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { runAgentTurn } from '../src/brain/agent.js';
import { createBooking } from '../src/tools/calendar.js';
import { emptyConversation } from '../src/state/conversation.js';
import type { ToolContext } from '../src/tools/types.js';
import type { InboundImage } from '../src/messaging/adapter.js';
import { BUSINESS } from '../config/business.js';

const TEST_PHONE = '+15555550123';
const state = emptyConversation(TEST_PHONE);

const ctx: ToolContext = {
  state,
  locationOverride: null,
  notifyOwner: async (m) => console.log(`\n  [→ OWNER]: ${m}\n`),
};

const MIME: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };

function loadImage(path: string): InboundImage | null {
  const mt = MIME[extname(path).toLowerCase()];
  if (!mt) { console.log('Unsupported image type.'); return null; }
  return { mimeType: mt, dataBase64: readFileSync(path).toString('base64') };
}

async function simulateConfirm() {
  if (!state.appointment?.start) { console.log('No agreed slot yet — book a date first.'); return; }
  state.appointment.depositConfirmedAt = Date.now();
  try {
    const res = await createBooking({
      clientName: state.profile.name || 'Test Client',
      clientEmail: state.profile.email || 'test@example.com',
      clientPhone: TEST_PHONE,
      designShort: state.appointment.design || state.profile.idea || 'tattoo',
      startISO: state.appointment.start!,
      endISO: state.appointment.end!,
    });
    state.appointment.eventId = res.eventId;
    console.log(`\n  [BOOKED]: "${res.summary}" → ${res.htmlLink}\n`);
    const turn = await runAgentTurn({
      state,
      inboundText: `(Internal note — Ray confirmed the $${BUSINESS.deposit.amount} deposit. The invite was emailed. Send a warm confirmation with date/time and address.)`,
      ctx,
    });
    turn.replyBubbles.forEach((b) => console.log(`Ray: ${b}`));
  } catch (e) {
    console.log(`Booking failed (need Calendar creds?): ${String(e)}`);
  }
}

async function main() {
  console.log('=== HINTER booking agent — console tester ===');
  console.log('You are the client. Type a message. /img <path>, /confirm, /state, /quit\n');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q: string): Promise<string> => new Promise((r) => rl.question(q, r));

  let pendingImage: InboundImage | undefined;
  while (true) {
    const line = (await ask('You: ')).trim();
    if (line === '/quit') break;
    if (line === '/state') { console.log(JSON.stringify(state, null, 2)); continue; }
    if (line === '/confirm') { await simulateConfirm(); continue; }
    if (line.startsWith('/img ')) {
      const img = loadImage(line.slice(5).trim());
      if (img) { pendingImage = img; console.log('(image attached to your next message)'); }
      continue;
    }
    const turn = await runAgentTurn({
      state,
      inboundText: line,
      images: pendingImage ? [pendingImage] : undefined,
      ctx,
    });
    pendingImage = undefined;
    turn.replyBubbles.forEach((b) => console.log(`Ray: ${b}`));
    if (turn.handoff) console.log('  [handoff flagged]');
  }
  rl.close();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
