// ─────────────────────────────────────────────────────────────────────────────
// Orchestrator. Polls Google Voice, routes each inbound text to either the
// owner-command handler (Ray) or the client agent, and sends replies back.
//
//   Owner commands (text these from Ray's cell to the booking line):
//     CONFIRM <phone>   deposit received → auto-book + email invite + confirm client
//     PENDING <phone>   deposit not in yet → (just an ack; nothing sent to client)
//     RESUME  <phone>   hand a thread back to the bot after a handoff
//     TRAVEL <address> | <dates>   set a temporary studio location for bookings
//     TRAVEL OFF        clear the travel location
//     HELP              list commands
// ─────────────────────────────────────────────────────────────────────────────

import 'dotenv/config';
import { GoogleVoiceAdapter } from './messaging/googleVoice.js';
import { normalizePhone, type MessagingAdapter, type InboundMessage } from './messaging/adapter.js';
import { getConversation, saveConversation, appendMessage, setStage, setAppointment, recordAppointment } from './tools/db.js';
import { runAgentTurn } from './brain/agent.js';
import { createBooking } from './tools/calendar.js';
import type { ToolContext } from './tools/types.js';
import { BUSINESS } from '../config/business.js';
import { sleep, log } from './lib/util.js';

const DRY_RUN = process.env.DRY_RUN === 'true';
const OWNER_PHONE = normalizePhone(process.env.OWNER_PHONE || '');
const POLL_INTERVAL = Number(process.env.GV_POLL_INTERVAL_MS || 15000);

let locationOverride: { address: string; dateRange: string } | null = null;

let adapter: MessagingAdapter;

async function sendBubbles(to: string, bubbles: string[]) {
  for (const [i, b] of bubbles.entries()) {
    if (!b.trim()) continue;
    if (DRY_RUN) {
      log('info', `[DRY_RUN] → ${to}: ${b}`);
    } else {
      await adapter.send(to, b);
    }
    if (i < bubbles.length - 1) await sleep(BUSINESS.reply.interBubbleDelayMs);
  }
}

function makeContext(state: Awaited<ReturnType<typeof getConversation>>): ToolContext {
  return {
    state,
    locationOverride,
    notifyOwner: async (msg: string) => {
      if (!OWNER_PHONE) return log('warn', 'OWNER_PHONE not set; cannot notify owner.');
      if (DRY_RUN) return log('info', `[DRY_RUN] → OWNER ${OWNER_PHONE}: ${msg}`);
      await adapter.send(OWNER_PHONE, msg);
    },
  };
}

function humanDate(iso?: string): string {
  if (!iso) return 'your appointment';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS.studio.timezone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

// ── Client path ─────────────────────────────────────────────────────────────
async function handleClient(msg: InboundMessage) {
  const phone = msg.from;
  const state = await getConversation(phone);

  // If Ray is personally handling this thread, stay quiet — just record + ping.
  if (state.handoff?.active) {
    await appendMessage(state, 'user', msg.text || '(sent an image)');
    await saveConversation(state);
    const ctx = makeContext(state);
    await ctx.notifyOwner(`(handoff) New message from ${state.profile.name || phone}: ${msg.text}`);
    return;
  }

  const ctx = makeContext(state);
  const turn = await runAgentTurn({ state, inboundText: msg.text, images: msg.images, ctx });
  await saveConversation(state);
  await sendBubbles(phone, turn.replyBubbles);
}

// ── Owner path ──────────────────────────────────────────────────────────────
async function handleOwner(msg: InboundMessage) {
  const parts = msg.text.trim().split(/\s+/);
  const cmd = (parts[0] || '').toUpperCase();
  const ackOwner = (m: string) => sendBubbles(OWNER_PHONE, [m]);

  switch (cmd) {
    case 'CONFIRM':
      return handleConfirm(normalizePhone(parts[1] || ''), ackOwner);
    case 'PENDING':
      return ackOwner(`Noted — marked pending for ${parts[1]}. Nothing sent to the client.`);
    case 'RESUME': {
      const phone = normalizePhone(parts[1] || '');
      const state = await getConversation(phone);
      state.handoff = { active: false };
      await setStage(state, 'discussing');
      await saveConversation(state);
      return ackOwner(`Resumed. The bot is handling ${parts[1]} again.`);
    }
    case 'TRAVEL': {
      if ((parts[1] || '').toUpperCase() === 'OFF') {
        locationOverride = null;
        return ackOwner('Travel location cleared. Bookings use the Phoenix studio.');
      }
      const rest = msg.text.slice(msg.text.indexOf(' ') + 1);
      const [address, dateRange] = rest.split('|').map((s) => s.trim());
      locationOverride = { address: address || rest, dateRange: dateRange || '' };
      return ackOwner(`Travel location set: ${locationOverride.address}${locationOverride.dateRange ? ` (${locationOverride.dateRange})` : ''}.`);
    }
    case 'HELP':
    default:
      return ackOwner(
        'Commands: CONFIRM <phone> | PENDING <phone> | RESUME <phone> | TRAVEL <address> | <dates> | TRAVEL OFF'
      );
  }
}

async function handleConfirm(phone: string, ackOwner: (m: string) => Promise<void>) {
  const state = await getConversation(phone);
  if (state.appointment?.eventId) {
    return ackOwner(`${phone} is already booked (event ${state.appointment.eventId}).`);
  }
  const { profile, appointment } = state;
  if (!appointment?.start || !appointment?.end || !profile.email || !profile.name) {
    return ackOwner(
      `Can't auto-book ${phone}: missing ${[
        !appointment?.start && 'date',
        !profile.email && 'email',
        !profile.name && 'name',
      ]
        .filter(Boolean)
        .join(', ')}. Handle in Google Voice directly.`
    );
  }

  appointment.depositConfirmedAt = Date.now();
  try {
    const res = await createBooking({
      clientName: profile.name,
      clientEmail: profile.email,
      clientPhone: phone,
      designShort: appointment.design || profile.idea || 'tattoo',
      startISO: appointment.start,
      endISO: appointment.end,
      instagram: profile.instagram,
      locationOverride: locationOverride?.address,
    });
    await setAppointment(state, { eventId: res.eventId, location: locationOverride?.address || BUSINESS.studio.address });
    await setStage(state, 'booked');
    await recordAppointment(res.eventId, {
      phone,
      name: profile.name,
      email: profile.email,
      design: appointment.design,
      start: appointment.start,
      end: appointment.end,
      summary: res.summary,
    });
    await saveConversation(state);

    // Compose the confirmation in Ray's voice.
    const address = locationOverride?.address || BUSINESS.studio.address;
    const ctx = makeContext(state);
    const turn = await runAgentTurn({
      state,
      inboundText:
        `(Internal note — NOT from the client. Ray just confirmed the $${BUSINESS.deposit.amount} deposit was received and the ` +
        `Google invite was emailed to ${profile.email}. The appointment is ${humanDate(appointment.start)} at ${address}. ` +
        `Send the client a warm "you're all set" confirmation that includes the date/time and the address, and that the ` +
        `Google invite just went to their email. Do not mention this note.)`,
      ctx,
    });
    await saveConversation(state);
    await sendBubbles(phone, turn.replyBubbles);
    return ackOwner(`Confirmed + booked ${profile.name} for ${humanDate(appointment.start)}. Invite emailed; client notified.`);
  } catch (err) {
    log('error', 'confirm/book failed', err);
    return ackOwner(`Booking failed for ${phone}: ${String(err)}. Please book manually in Calendar.`);
  }
}

// ── Main loop ────────────────────────────────────────────────────────────────
async function main() {
  log('info', `HINTER booking agent starting. DRY_RUN=${DRY_RUN} model=${process.env.XAI_MODEL || 'grok-4.20-0309-reasoning'}`);
  if (!OWNER_PHONE) log('warn', 'OWNER_PHONE not set — handoffs and deposit confirmations will not reach you.');

  adapter = new GoogleVoiceAdapter();
  await adapter.init();

  let stopping = false;
  const shutdown = async () => {
    if (stopping) return;
    stopping = true;
    log('info', 'Shutting down...');
    await adapter.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  while (!stopping) {
    try {
      const inbound = await adapter.poll();
      for (const msg of inbound) {
        const from = normalizePhone(msg.from);
        try {
          if (OWNER_PHONE && from === OWNER_PHONE) await handleOwner(msg);
          else await handleClient(msg);
        } catch (err) {
          log('error', `failed handling message from ${from}`, err);
        }
      }
    } catch (err) {
      log('error', 'poll loop error', err);
    }
    await sleep(POLL_INTERVAL);
  }
}

main().catch((err) => {
  log('error', 'fatal', err);
  process.exit(1);
});
