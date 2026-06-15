// ─────────────────────────────────────────────────────────────────────────────
// Deposit flow — Zelle only, owner-confirmed.
//
// Zelle has no API, so a deposit cannot be auto-verified. When a client says
// they paid, we log the claim and ping Ray to confirm receipt with one tap.
// The booking is NOT created until Ray confirms (see index.ts owner-command flow).
// ─────────────────────────────────────────────────────────────────────────────

import { BUSINESS } from '../../config/business.js';
import type { ToolContext } from './types.js';
import { recordDeposit, setStage, setAppointment, mergeProfile } from './db.js';

/** Canonical Zelle instructions (the agent usually phrases this itself). */
export function depositInstructions(): string {
  const d = BUSINESS.deposit;
  return (
    `$${d.amount} deposit via ${d.method} to ${d.zelleNumber} ` +
    `(the name "${d.zelleName}" will pop up). It goes toward the cost of the tattoo and ` +
    `is non-refundable. Once it's in I'll confirm and send the Google invite.`
  );
}

/**
 * Client says they sent the deposit. Log it and ping Ray to verify in Zelle.
 * Returns guidance text for the agent (so it tells the client the right thing).
 */
export async function recordDepositClaim(
  ctx: ToolContext,
  input: {
    clientSaysAmount?: number;
    note?: string;
    clientName?: string;
    clientEmail?: string;
    startISO?: string;
    endISO?: string;
    designShort?: string;
    instagram?: string;
    quoteOrNotes?: string;
  }
): Promise<string> {
  const { state } = ctx;

  // Persist any booking details gathered so Ray's "CONFIRM" can auto-book.
  await mergeProfile(state, {
    name: input.clientName,
    email: input.clientEmail,
    instagram: input.instagram,
  });
  await setAppointment(state, {
    start: input.startISO,
    end: input.endISO,
    design: input.designShort,
  });

  const p = state.profile;

  await recordDeposit(state.phone, {
    claimedAmount: input.clientSaysAmount ?? BUSINESS.deposit.amount,
    expectedAmount: BUSINESS.deposit.amount,
    note: input.note,
    name: p.name,
    status: 'claimed',
  });
  await setStage(state, 'deposit_claimed');
  if (state.appointment) state.appointment.depositClaimedAt = Date.now();

  // Ping Ray to verify the Zelle actually landed.
  await ctx.notifyOwner(
    `DEPOSIT CLAIM — ${p.name || 'client'} (${state.phone}) says they sent the $${BUSINESS.deposit.amount} Zelle deposit` +
      `${p.idea ? ` for "${p.idea}"` : ''}.\n` +
      `Check Zelle (${BUSINESS.deposit.zelleNumber}). If it's there, reply: CONFIRM ${state.phone}\n` +
      `If not yet, reply: PENDING ${state.phone}`
  );

  return (
    'Deposit claim logged and Ray has been pinged to verify it in Zelle. ' +
    "Tell the client warmly that you're confirming the deposit now and will send the Google invite as soon as it's confirmed — " +
    'do NOT tell them they are fully booked yet, and do NOT create the calendar event until the deposit is confirmed.'
  );
}
