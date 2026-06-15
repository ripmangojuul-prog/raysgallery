// Human handoff — pull Ray in and pause the bot's autonomy on this thread.

import type { ToolContext } from './types.js';
import { setStage } from './db.js';

export async function handoffToRay(
  ctx: ToolContext,
  input: { reason: string; summary: string }
): Promise<string> {
  const { state } = ctx;
  state.handoff = { active: true, reason: input.reason, at: Date.now() };
  await setStage(state, 'handoff');

  await ctx.notifyOwner(
    `HANDOFF NEEDED — ${state.profile.name || 'client'} (${state.phone})\n` +
      `Reason: ${input.reason}\n` +
      `Summary: ${input.summary}\n` +
      `The bot has paused on this thread. Reply here, or in Google Voice directly. ` +
      `When you've got it handled, reply: RESUME ${state.phone} to hand the thread back to the bot.`
  );

  return (
    'Ray has been notified and will jump in. Tell the client warmly and briefly that you want to make sure ' +
    "they're taken care of and you'll follow up shortly. Then stop — do not keep handling this yourself."
  );
}
