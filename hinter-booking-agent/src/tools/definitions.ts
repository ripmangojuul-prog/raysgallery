import type Anthropic from '@anthropic-ai/sdk';

// Tool schemas exposed to Claude (Anthropic tool-use format). The client's
// phone is always known from the thread, so tools never ask for it.
export const TOOLS: Anthropic.Tool[] = [
  {
    name: 'check_availability',
    description:
      "Find Ray's real open appointment slots before offering any date or time. ALWAYS call this before naming a date. " +
      'Returns specific open days with a proposed start time (sessions start at 11am). ' +
      'Pass duration_hours based on the piece: small ~2, medium ~4, large ~6, full day ~7.',
    input_schema: {
      type: 'object',
      properties: {
        from_date: { type: 'string', description: 'YYYY-MM-DD, earliest date to consider. Defaults to today.' },
        to_date: { type: 'string', description: 'YYYY-MM-DD, latest date to consider. Defaults to ~4 weeks out.' },
        duration_hours: { type: 'number', description: 'Estimated session length in hours.' },
        max_suggestions: { type: 'number', description: 'How many open slots to return (default 4).' },
      },
    },
  },
  {
    name: 'save_client_note',
    description:
      'Quietly persist details gathered about the client so nothing is lost between texts. ' +
      'Call this whenever you learn something new (their idea, size, placement, name, email, IG, references).',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        instagram: { type: 'string' },
        idea: { type: 'string', description: 'The tattoo concept/description.' },
        placement: { type: 'string' },
        size: { type: 'string' },
        experience: { type: 'string', description: 'Prior tattoo experience, if mentioned.' },
        local: { type: 'boolean', description: 'True if local, false if traveling in.' },
        reference_note: { type: 'string', description: 'Note about a reference image they sent (what it shows).' },
        notes: { type: 'string', description: 'Anything else worth remembering.' },
      },
    },
  },
  {
    name: 'record_deposit_claim',
    description:
      'Call this the moment a client says they have sent / paid the deposit. It logs the claim and pings Ray to ' +
      'verify it in Zelle. Do NOT create the booking from this — wait for Ray to confirm receipt. After calling, tell ' +
      'the client warmly you are confirming the deposit and will send the invite shortly. ' +
      'IMPORTANT: include all the booking details you have gathered (name, email, agreed slot from check_availability, ' +
      'design) so that the instant Ray confirms the deposit, the booking + invite go out automatically.',
    input_schema: {
      type: 'object',
      properties: {
        client_says_amount: { type: 'number', description: 'Amount the client says they sent, if stated.' },
        note: { type: 'string', description: 'Any detail (e.g. "sent from a different name").' },
        client_name: { type: 'string', description: 'Full name for the booking.' },
        client_email: { type: 'string', description: 'Email for the Google invite.' },
        start_iso: { type: 'string', description: 'Agreed slot start_iso (exactly as returned by check_availability).' },
        end_iso: { type: 'string', description: 'Agreed slot end_iso.' },
        design_short: { type: 'string', description: 'Short design description for the event title.' },
        instagram: { type: 'string' },
        quote_or_notes: { type: 'string' },
      },
    },
  },
  {
    name: 'create_booking',
    description:
      'Create the Google Calendar event and email the client the invite (this IS the confirmation). ' +
      'ONLY allowed after Ray has confirmed the deposit was received AND you have the client name + email + an agreed slot ' +
      '(use start_iso/end_iso exactly as returned by check_availability).',
    input_schema: {
      type: 'object',
      properties: {
        client_name: { type: 'string' },
        client_email: { type: 'string' },
        design_short: { type: 'string', description: 'Short design description for the event title, e.g. "chrome script" or "skulls w chains".' },
        start_iso: { type: 'string', description: 'Exact start_iso from check_availability.' },
        end_iso: { type: 'string', description: 'Exact end_iso from check_availability.' },
        instagram: { type: 'string' },
        quote_or_notes: { type: 'string', description: 'e.g. "$650-750 quote".' },
      },
      required: ['client_name', 'client_email', 'design_short', 'start_iso', 'end_iso'],
    },
  },
  {
    name: 'handoff_to_ray',
    description:
      'Escalate to the real human Ray for anything you should not decide alone: refunds/money disputes, complaints, ' +
      'healing/medical concerns, abusive or spam contacts, genuinely off-style requests the client insists on, ' +
      'tricky custom pricing, or any time you are unsure. After calling, tell the client warmly you will follow up shortly, then stop.',
    input_schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Short category, e.g. "refund request", "complaint", "off-style insist".' },
        summary: { type: 'string', description: 'One or two sentences Ray needs to pick this up cold.' },
      },
      required: ['reason', 'summary'],
    },
  },
];
