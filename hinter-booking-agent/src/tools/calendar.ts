// ─────────────────────────────────────────────────────────────────────────────
// Google Calendar tool — real availability + booking on rscatchings@gmail.com.
//
// Availability rule (v0.1, matches how Ray really books):
//   • One tattoo per day. A day with an existing timed appointment is taken.
//   • Sessions start at the configured day-start (11:00) and must end by day-end.
//   • All-day / transparent events (travel markers, holidays) do NOT block — Ray
//     still works on the road; she reviews every booking at deposit-confirm time.
// ─────────────────────────────────────────────────────────────────────────────

import { calendarClient, CALENDAR_ID } from '../lib/googleAuth.js';
import { BUSINESS } from '../../config/business.js';

const TZ = BUSINESS.studio.timezone; // America/Phoenix
const OFFSET = '-07:00'; // Arizona never observes DST → fixed offset, even on west-coast trips.

export interface Slot {
  date: string; // YYYY-MM-DD
  startISO: string;
  endISO: string;
  human: string; // "Saturday, June 20 at 11:00 AM"
}

function ymd(d: Date): string {
  // Format a Date as YYYY-MM-DD in Phoenix time.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function humanSlot(startISO: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(startISO));
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T12:00:00${OFFSET}`);
  d.setDate(d.getDate() + n);
  return ymd(d);
}

export async function checkAvailability(opts: {
  fromISO?: string; // YYYY-MM-DD (defaults: today)
  toISO?: string; // YYYY-MM-DD (defaults: 28 days out)
  durationHours?: number;
  maxSuggestions?: number;
}): Promise<Slot[]> {
  const cal = calendarClient();
  const today = ymd(new Date());
  const from = opts.fromISO || today;
  const to = opts.toISO || addDays(from, 28);
  const duration = Math.min(
    opts.durationHours || BUSINESS.scheduling.defaultSessionHours,
    BUSINESS.scheduling.dayEndHour - BUSINESS.scheduling.dayStartHour
  );
  const maxSuggestions = opts.maxSuggestions ?? 4;

  const { data } = await cal.events.list({
    calendarId: CALENDAR_ID,
    timeMin: `${from}T00:00:00${OFFSET}`,
    timeMax: `${to}T23:59:59${OFFSET}`,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  });

  // Which days already have a timed (booked) event?
  const bookedDays = new Set<string>();
  for (const ev of data.items ?? []) {
    if (ev.status === 'cancelled') continue;
    if (!ev.start?.dateTime) continue; // skip all-day / travel / holidays
    if (ev.transparency === 'transparent') continue; // "free" markers don't block
    bookedDays.add(ymd(new Date(ev.start.dateTime)));
  }

  const slots: Slot[] = [];
  let day = from;
  while (day <= to && slots.length < maxSuggestions) {
    if (day >= today && !bookedDays.has(day)) {
      const sh = String(BUSINESS.scheduling.dayStartHour).padStart(2, '0');
      const startISO = `${day}T${sh}:00:00${OFFSET}`;
      // Never offer a start time that has already passed (e.g. 11am later today).
      if (new Date(startISO).getTime() > Date.now()) {
        const end = new Date(startISO);
        end.setHours(end.getHours() + duration);
        slots.push({ date: day, startISO, endISO: end.toISOString(), human: humanSlot(startISO) });
      }
    }
    day = addDays(day, 1);
  }
  return slots;
}

/**
 * Pull a client's real appointments off the calendar (past 6 months + next 6),
 * matched by attendee email or phone-in-description. This is the "calendar memory"
 * that lets the agent recognize returning clients.
 */
export async function getClientCalendarHistory(opts: {
  email?: string;
  phone?: string;
}): Promise<{ summary: string; human: string; when: 'past' | 'upcoming' }[]> {
  if (!opts.email && !opts.phone) return [];
  const cal = calendarClient();
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 180);
  const to = new Date(now);
  to.setDate(to.getDate() + 180);

  const { data } = await cal.events.list({
    calendarId: CALENDAR_ID,
    timeMin: from.toISOString(),
    timeMax: to.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  });

  const digits = (opts.phone || '').replace(/\D/g, '').slice(-10);
  const email = opts.email?.toLowerCase();
  const out: { summary: string; human: string; when: 'past' | 'upcoming' }[] = [];
  for (const ev of data.items ?? []) {
    const byEmail = email && (ev.attendees ?? []).some((a) => a.email?.toLowerCase() === email);
    const byPhone = digits && (ev.description || '').replace(/\D/g, '').includes(digits);
    if (!byEmail && !byPhone) continue;
    const startISO = ev.start?.dateTime || ev.start?.date;
    if (!startISO) continue;
    out.push({
      summary: ev.summary || '(no title)',
      human: humanSlot(startISO),
      when: new Date(startISO) < now ? 'past' : 'upcoming',
    });
  }
  return out;
}

export async function createBooking(opts: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  designShort: string;
  startISO: string;
  endISO: string;
  instagram?: string;
  quoteOrNotes?: string;
  locationOverride?: string;
}): Promise<{ eventId: string; htmlLink: string; summary: string }> {
  const cal = calendarClient();
  const b = BUSINESS;

  const summary = b.calendarEvent.titleTemplate
    .replace('{name}', opts.clientName)
    .replace('{design}', opts.designShort);

  const descParts = [opts.clientPhone];
  if (opts.instagram) descParts.push(`ig: ${opts.instagram}`);
  if (opts.quoteOrNotes) descParts.push(opts.quoteOrNotes);
  const description = descParts.filter(Boolean).join(' | ');

  const { data } = await cal.events.insert({
    calendarId: CALENDAR_ID,
    sendUpdates: 'all', // emails the client the invite — this is the confirmation
    requestBody: {
      summary,
      description,
      location: opts.locationOverride || b.studio.address,
      // Confirmed appointments are purple ("Grape") so they pop on the calendar.
      colorId: b.calendarEvent.colorId,
      start: { dateTime: opts.startISO, timeZone: TZ },
      end: { dateTime: opts.endISO, timeZone: TZ },
      attendees: [{ email: opts.clientEmail }],
      reminders: {
        useDefault: false,
        overrides: b.calendarEvent.reminderMinutes.map((minutes) => ({
          method: 'popup' as const,
          minutes,
        })),
      },
    },
  });

  return {
    eventId: data.id!,
    htmlLink: data.htmlLink || '',
    summary,
  };
}
