import type { ConversationState } from '../state/conversation.js';

/** Passed to every tool handler. Lets tools mutate the live conversation and
 *  reach Ray (the owner) over the same Google Voice line. */
export interface ToolContext {
  state: ConversationState;
  /** Text Ray's personal cell (handoff pings + deposit-confirm requests). */
  notifyOwner: (msg: string) => Promise<void>;
  /** Active travel location override, if any. */
  locationOverride?: { address: string; dateRange: string } | null;
}
