// ─────────────────────────────────────────────────────────────────────────────
// Tool dispatcher. Maps a Grok tool call to a real action, mutates the live
// conversation state, and returns a string result the model reads back.
// ─────────────────────────────────────────────────────────────────────────────

import type { ToolContext } from './types.js';
import { checkAvailability, createBooking } from './calendar.js';
import { recordDepositClaim } from './deposit.js';
import { handoffToRay } from './handoff.js';
import { mergeProfile, setStage, setAppointment, recordAppointment } from './db.js';
import { BUSINESS } from '../../config/business.js';
import { log } from '../lib/util.js';

export async function executeTool(
  name: string,
  input: any,
  ctx: ToolContext
): Promise<string> {
  const { state } = ctx;
  log('info', `tool:${name}`, input);

  switch (name) {
    case 'check_availability': {
      const slots = await checkAvailability({
        fromISO: input.from_date,
        toISO: input.to_date,
        durationHours: input.duration_hours,
        maxSuggestions: input.max_suggestions,
      });
      if (state.stage === 'new' || state.stage === 'intake') await setStage(state, 'scheduling');
      if (slots.length === 0) {
        return 'No open days in that window. Suggest the client try a later range, or offer to check further out.';
      }
      return JSON.stringify(
        slots.map((s) => ({ human: s.human, start_iso: s.startISO, end_iso: s.endISO })),
        null,
        2
      );
    }

    case 'save_client_note': {
      await mergeProfile(state, {
        name: input.name,
        email: input.email,
        instagram: input.instagram,
        idea: input.idea,
        placement: input.placement,
        size: input.size,
        experience: input.experience,
        local: input.local,
        notes: input.notes,
      });
      if (input.reference_note) {
        state.profile.references = [...(state.profile.references ?? []), input.reference_note];
      }
      if (state.stage === 'new') await setStage(state, 'intake');
      return 'Saved.';
    }

    case 'record_deposit_claim': {
      return recordDepositClaim(ctx, {
        clientSaysAmount: input.client_says_amount,
        note: input.note,
        clientName: input.client_name,
        clientEmail: input.client_email,
        startISO: input.start_iso,
        endISO: input.end_iso,
        designShort: input.design_short,
        instagram: input.instagram,
        quoteOrNotes: input.quote_or_notes,
      });
    }

    case 'create_booking': {
      // Idempotency: never create a second event for the same client.
      if (state.appointment?.eventId) {
        return `Already booked (event ${state.appointment.eventId}). Just confirm warmly — do not create another event.`;
      }
      // Hard server-side guard: never book without a CONFIRMED deposit.
      if (!state.appointment?.depositConfirmedAt) {
        return (
          'BLOCKED: the deposit has not been confirmed by Ray yet, so the booking cannot be created. ' +
          'Do not tell the client they are booked. If they say they just paid, call record_deposit_claim instead and wait.'
        );
      }
      if (!input.client_email || !input.client_name) {
        return 'Need the client name and a good email before booking — ask for the missing one.';
      }
      try {
        const res = await createBooking({
          clientName: input.client_name,
          clientEmail: input.client_email,
          clientPhone: state.phone,
          designShort: input.design_short,
          startISO: input.start_iso,
          endISO: input.end_iso,
          instagram: input.instagram ?? state.profile.instagram,
          quoteOrNotes: input.quote_or_notes,
          locationOverride: ctx.locationOverride?.address,
        });
        await mergeProfile(state, { name: input.client_name, email: input.client_email });
        await setAppointment(state, {
          eventId: res.eventId,
          start: input.start_iso,
          end: input.end_iso,
          design: input.design_short,
          location: ctx.locationOverride?.address || BUSINESS.studio.address,
        });
        await setStage(state, 'booked');
        await recordAppointment(res.eventId, {
          phone: state.phone,
          name: input.client_name,
          email: input.client_email,
          design: input.design_short,
          start: input.start_iso,
          end: input.end_iso,
          summary: res.summary,
        });
        return (
          `Booking created and invite emailed to ${input.client_email}. ` +
          `Event: "${res.summary}". Now send the client a warm confirmation in your own voice that includes the date/time, ` +
          `the studio address (${ctx.locationOverride?.address || BUSINESS.studio.address}), and let them know the Google ` +
          `invite just went to their email. Keep it natural — like "You're all set! ...".`
        );
      } catch (err) {
        log('error', 'create_booking failed', err);
        return `Booking failed to create (${String(err)}). Do NOT tell the client they are booked. Apologize briefly and say you'll sort it out, then it will be handed to Ray.`;
      }
    }

    case 'handoff_to_ray': {
      return handoffToRay(ctx, { reason: input.reason, summary: input.summary });
    }

    default:
      return `Unknown tool: ${name}`;
  }
}
