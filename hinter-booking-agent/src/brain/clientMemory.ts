// ─────────────────────────────────────────────────────────────────────────────
// Client memory. Builds a private "what you already know about this person" brief
// from their saved Firestore profile + their real calendar appointments. Injected
// each turn (as an uncached system block) so the agent recognizes returning
// clients, references their booking, and never re-asks what it already knows.
// ─────────────────────────────────────────────────────────────────────────────

import type { ConversationState } from '../state/conversation.js';

export interface CalRef {
  summary: string;
  human: string;
  when: 'past' | 'upcoming';
}

export function buildClientMemory(
  state: ConversationState,
  appts: Record<string, any>[],
  calEvents: CalRef[]
): string {
  const p = state.profile;
  const known: string[] = [];
  if (p.name) known.push(`Name: ${p.name}`);
  if (p.instagram) known.push(`Instagram: ${p.instagram}`);
  if (typeof p.local === 'boolean') known.push(p.local ? 'Local to Phoenix' : 'Traveling in');
  if (p.idea) known.push(`Idea: ${p.idea}`);
  if (p.placement) known.push(`Placement: ${p.placement}`);
  if (p.size) known.push(`Size: ${p.size}`);
  if (p.budget) known.push(`Budget: ${p.budget}`);
  if (p.experience) known.push(`Tattoo experience: ${p.experience}`);
  if (p.references?.length) known.push(`References they've sent: ${p.references.join('; ')}`);
  if (p.email) known.push(`Email: ${p.email}`);

  // Merge DB appointment records + live calendar events (dedupe by summary+when).
  const seen = new Set<string>();
  const events: string[] = [];
  for (const e of calEvents) {
    const k = `${e.summary}|${e.when}`;
    if (seen.has(k)) continue;
    seen.add(k);
    events.push(`${e.summary} — ${e.human} (${e.when})`);
  }
  for (const a of appts) {
    const label = a.summary || a.design || 'appointment';
    const k = `${label}|db`;
    if (seen.has(k)) continue;
    seen.add(k);
    events.push(`${label}${a.start ? ` — ${a.start}` : ''}`);
  }

  const returning = state.messages.length > 0 || events.length > 0;

  const lines: string[] = [];
  lines.push(
    'WHAT YOU ALREADY KNOW ABOUT THIS CLIENT (private memory — never read it aloud or mention that you have notes; just use it so you sound like you genuinely remember them, and never re-ask things you already know):'
  );
  lines.push(known.length ? known.map((k) => `  - ${k}`).join('\n') : '  - Nothing on file yet — looks like a brand new contact.');

  if (events.length) {
    lines.push('THEIR APPOINTMENTS (your calendar memory — reference these naturally if relevant):');
    lines.push(events.map((e) => `  - ${e}`).join('\n'));
  }

  lines.push(
    returning
      ? 'This is a RETURNING conversation/client. Greet like you already know them, pick up where you left off, do not re-introduce yourself, and do not re-ask details you already have above.'
      : 'This looks like a FIRST contact — give them a warm welcome.'
  );
  lines.push(`Current funnel stage: ${state.stage}.`);
  return lines.join('\n');
}
