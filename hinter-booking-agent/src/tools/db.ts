// ─────────────────────────────────────────────────────────────────────────────
// Firestore data access.
//
// Collections:
//   conversations/{phone}   ConversationState (profile + rolling messages + stage)
//   appointments/{eventId}  confirmed bookings (mirror, for reporting)
//   deposits/{phone+ts}     deposit claims awaiting / confirmed
// ─────────────────────────────────────────────────────────────────────────────

import { getDb } from '../lib/firestore.js';
import {
  type ConversationState,
  type StoredMessage,
  type ClientProfile,
  emptyConversation,
  MESSAGE_WINDOW,
  type Stage,
  type Appointment,
} from '../state/conversation.js';

const conversations = () => getDb().collection('conversations');
const appointments = () => getDb().collection('appointments');
const deposits = () => getDb().collection('deposits');

export async function getConversation(phone: string): Promise<ConversationState> {
  const snap = await conversations().doc(phone).get();
  if (!snap.exists) return emptyConversation(phone);
  return snap.data() as ConversationState;
}

export async function saveConversation(state: ConversationState): Promise<void> {
  state.updatedAt = Date.now();
  // Keep the message window bounded.
  if (state.messages.length > MESSAGE_WINDOW) {
    state.messages = state.messages.slice(-MESSAGE_WINDOW);
  }
  await conversations().doc(state.phone).set(state, { merge: true });
}

export async function appendMessage(
  state: ConversationState,
  role: StoredMessage['role'],
  content: string
): Promise<void> {
  state.messages.push({ role, content, ts: Date.now() });
}

export async function mergeProfile(
  state: ConversationState,
  patch: Partial<ClientProfile>
): Promise<void> {
  state.profile = { ...state.profile, ...patch, phone: state.phone };
}

export async function setStage(state: ConversationState, stage: Stage): Promise<void> {
  state.stage = stage;
}

export async function setAppointment(
  state: ConversationState,
  appt: Partial<Appointment>
): Promise<void> {
  state.appointment = { ...(state.appointment ?? {}), ...appt };
}

export async function recordDeposit(phone: string, data: Record<string, unknown>) {
  await deposits().doc(`${phone}_${Date.now()}`).set({ phone, ...data, createdAt: Date.now() });
}

export async function recordAppointment(eventId: string, data: Record<string, unknown>) {
  await appointments().doc(eventId).set({ eventId, ...data, createdAt: Date.now() }, { merge: true });
}

/** All recorded appointments for a phone (sorted by start). Powers client memory. */
export async function getAppointmentsByPhone(phone: string) {
  const q = await appointments().where('phone', '==', phone).get();
  return q.docs
    .map((d) => d.data() as Record<string, any>)
    .sort((a, b) => String(a.start).localeCompare(String(b.start)));
}

/** Latest deposit-claim record for a phone (used when Ray confirms). */
export async function latestDepositClaim(phone: string) {
  const q = await deposits()
    .where('phone', '==', phone)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  return q.empty ? null : { id: q.docs[0].id, ...q.docs[0].data() };
}
