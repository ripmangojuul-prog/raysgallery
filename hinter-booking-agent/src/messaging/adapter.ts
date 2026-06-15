// ─────────────────────────────────────────────────────────────────────────────
// MessagingAdapter — the ONLY thing tying this agent to Google Voice.
//
// Everything else (brain, calendar, deposits, DB) is provider-agnostic. To move
// to Twilio/Telnyx later, implement this same interface in one new file and swap
// it in src/index.ts. Nothing else changes.
// ─────────────────────────────────────────────────────────────────────────────

export interface InboundImage {
  mimeType: string; // image/jpeg | image/png | image/webp | image/gif
  dataBase64: string;
}

export interface InboundMessage {
  /** Stable unique id for dedupe (so we never double-process a text). */
  id: string;
  /** Sender phone, normalized to E.164 where possible (e.g. +14809790110). */
  from: string;
  /** Message text (may be empty if image-only). */
  text: string;
  /** Reference images the client sent, if any (for vision). */
  images?: InboundImage[];
  ts: number;
}

export interface MessagingAdapter {
  /** One-time setup (launch browser / open client). */
  init(): Promise<void>;
  /** Return new inbound messages since the last poll. Must dedupe internally. */
  poll(): Promise<InboundMessage[]>;
  /** Send a text to a recipient phone. */
  send(to: string, text: string): Promise<void>;
  /** Graceful shutdown. */
  close(): Promise<void>;
}

/** Normalize a US phone string to E.164 (+1XXXXXXXXXX) where possible. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  const d = digits.replace(/\D/g, '');
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith('1')) return `+${d}`;
  return raw.trim();
}
