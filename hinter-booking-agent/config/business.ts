// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS CONFIG — the single source of truth for the booking agent.
// Everything (system prompt, calendar tool, deposit tool, DB) reads from here.
// Edit a value here and the whole agent updates. No magic numbers elsewhere.
//
// Sourced from: Ray's real booking texts (./hinter voice), the live raysgallery
// FAQ, and the real Google Calendar (rscatchings@gmail.com).
// ─────────────────────────────────────────────────────────────────────────────

export const BUSINESS = {
  // ── Identity ──────────────────────────────────────────────────────────────
  artist: {
    goesBy: 'Ray',
    // Legal name that appears on the Zelle account — clients must see this so
    // they know they sent to the right person.
    legalName: 'Rachel Catchings',
    brand: 'HINTER MASKEN',
    instagram: '@hintertattoo',
  },

  // ── Where ─────────────────────────────────────────────────────────────────
  studio: {
    // Default / home studio (from real bookings on the calendar).
    name: 'The studio',
    address: '1720 E McDowell Rd, Phoenix, AZ 85006',
    timezone: 'America/Phoenix', // Arizona — no DST. Stays fixed even on west-coast trips.
  },

  // The Google Voice line clients text. Booking is TEXT ONLY.
  bookingLine: '(480) 420-4319',

  // ── Money ─────────────────────────────────────────────────────────────────
  deposit: {
    amount: 150, // Ray's real texts all quote $150 (site FAQ still says $100 — update the site).
    currency: 'USD',
    // ONLY rail offered for the deposit. Clients must pay via Zelle.
    method: 'Zelle',
    zelleNumber: '925-605-8272',
    zelleName: 'Rachel Catchings',
    nonRefundable: true,
    appliesToTotal: true, // deposit is credited toward the tattoo cost
    // Zelle has no API → Ray confirms receipt with one tap. No invite goes out
    // until the deposit is confirmed (see deposit.ts / handoff flow).
    requiresOwnerConfirmation: true,
  },

  pricing: {
    hourlyRate: 250,
    dayRate: 1500, // ~7 hrs of work, billed for 6
    dayRateHours: 7,
    typicalPieceHoursLow: 2,
    typicalPieceHoursHigh: 5,
    // Same-day appointments only if the schedule is open AND the piece is >$300.
    sameDayMinimum: 300,
    // Final (in-person) payment methods. Deposit itself is Zelle only.
    acceptedInPerson: ['Cash', 'Zelle', 'Cash App', 'Venmo', 'Bitcoin', 'Ethereum'],
  },

  // ── Scheduling ────────────────────────────────────────────────────────────
  scheduling: {
    // Sessions in the real calendar start 11:00–12:00 and wrap by ~18:00.
    dayStartHour: 11, // earliest a session is offered (local, 24h)
    dayEndHour: 18, // latest a session should END
    bufferMinutes: 30, // gap required between clients
    // Usually one tattoo/day; occasionally two small ones (calendar confirms).
    maxBookingsPerDay: 1,
    // Default block length to reserve when size is unknown, in hours.
    defaultSessionHours: 4,
    // Duration heuristics by client-described size (hours). Tunable.
    durationBySize: {
      small: 2, // palm-sized / simple
      medium: 4,
      large: 6, // knee-to-shin, heavily detailed, etc.
      full_day: 7,
    } as Record<string, number>,
  },

  // ── Policies (verbatim-aligned with the live FAQ) ────────────────────────
  policies: {
    walkIns: true,
    minAge: 18, // 18+ with valid government ID
    requireId: true,
    cancellation:
      'All deposits are non-refundable — your space is reserved once the deposit is down. ' +
      'Rescheduling is allowed with at least 48 hours notice and is handled case by case. ' +
      'One complimentary reschedule; beyond that an additional deposit (credited toward the tattoo) is required.',
    designChangeNoticeHours: 24,
    touchUps:
      'Free touch-ups within one month; half price after that. Reach out with the subject "Touch up."',
    prep:
      'Bring cash and a valid government-issued ID. Eat beforehand and be fully hydrated, and ' +
      "don't drink alcohol the night before or day of. Wear comfortable clothing with access to " +
      'the area being tattooed. You can bring one guest. Please don’t arrive more than 10 ' +
      'minutes early or 20 minutes late.',
    timeAdvice:
      'Book on a day you have nothing else going on — palm-sized pieces have run anywhere from 1 to 10 hours depending on detail and placement.',
  },

  // ── Google Calendar event conventions (matched to real bookings) ─────────
  calendarEvent: {
    // Real titles look like "Jose Chavez-skulls w chains from flash".
    // {name} = client name, {design} = short design description.
    titleTemplate: '{name}- {design}',
    // Description holds phone + IG + any quote/notes, like Ray does by hand.
    // e.g. "480-223-7839 ig: bkaydubs | $650-750 quote"
    // Popup reminders (minutes before): 1 week + 1 day, matching her pattern.
    reminderMinutes: [10080, 1440],
  },

  // ── Reply behavior ───────────────────────────────────────────────────────
  reply: {
    // Ray texts in several short bubbles. Split the model's reply on blank
    // lines into separate sends (capped) with a small human-like delay.
    splitOnBlankLines: true,
    maxBubbles: 4,
    interBubbleDelayMs: 1200,
    // HARD RULE: zero emojis, ever. Enforced in the prompt AND stripped in code.
    stripEmoji: true,
  },
} as const;

export type Business = typeof BUSINESS;
