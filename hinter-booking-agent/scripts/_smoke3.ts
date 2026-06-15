import 'dotenv/config';
import { runAgentTurn } from '../src/brain/agent.js';
import { emptyConversation } from '../src/state/conversation.js';
import type { ToolContext } from '../src/tools/types.js';

const state = emptyConversation('+15555550133');
const ctx: ToolContext = { state, locationOverride: null, notifyOwner: async () => {} };

async function turn(t: string) {
  console.log('\nYOU: ' + t);
  const r = await runAgentTurn({ state, inboundText: t, ctx });
  console.log('RAY: ' + r.replyBubbles.join('\n     '));
}

// 1) design request — should NOT pitch elements/execution; relaxed tone
await turn('Hey my name is ash I want a tattoo of brass knuckles');
// 2) placement + size in one burst — should NOT re-ask placement, should NOT ask budget
await turn('6 inches on my stomach');
// 3) availability — should check the real calendar and offer dates
await turn("whats your availability, im local to phoenix");
process.exit(0);
