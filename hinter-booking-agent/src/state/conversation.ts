// ─────────────────────────────────────────────────────────────────────────────
// Conversation state model. One document per client (keyed by phone), stored in
// Firestore (see tools/db.ts). The agent is mostly stateless per turn; this doc
// is the memory — profile gathered so far, rolling message window, and stage.
// ─────────────────────────────────────────────────────────────────────────────

/** Coarse funnel stage — useful for analytics + nudging, not hard gating. */
export type Stage =
  | 'new' // first contact
  | 'intake' // gathering idea/size/placement/availability
  | 'discussing' // talking the piece, quoting
  | 'scheduling' // picking a date/time
  | 'awaiting_deposit' // date agreed, waiting for Zelle
  | 'deposit_claimed' // client says paid; Ray verifying
  | 'booked' // deposit confirmed + invite sent
  | 'handoff'; // escalated to Ray

export interface ClientProfile {
  phone: string; // E.164, the key
  name?: string;
  email?: string;
  instagram?: string;
  idea?: string;
  placement?: string;
  size?: string;
  experience?: string;
  local?: boolean;
  references?: string[]; // notes/urls about reference images they've sent
  notes?: string;
}

export interface StoredMessage {
  role: 'user' | 'assistant';
  /** Plain text. For inbound image messages we store a short marker like "[sent an image]". */
  content: string;
  ts: number; // epoch ms
}

export interface Appointment {
  eventId?: string;
  start?: string; // ISO
  end?: string; // ISO
  design?: string;
  location?: string;
  depositClaimedAt?: number;
  depositConfirmedAt?: number;
}

export interface ConversationState {
  phone: string;
  stage: Stage;
  profile: ClientProfile;
  messages: StoredMessage[]; // rolling window (capped in db.ts)
  appointment?: Appointment;
  handoff?: { active: boolean; reason?: string; at?: number };
  createdAt: number;
  updatedAt: number;
}

export function emptyConversation(phone: string): ConversationState {
  const now = Date.now();
  return {
    phone,
    stage: 'new',
    profile: { phone },
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

/** How many recent messages to keep in the rolling window sent to the model. */
export const MESSAGE_WINDOW = 40;
