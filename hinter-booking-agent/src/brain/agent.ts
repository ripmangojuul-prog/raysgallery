// ─────────────────────────────────────────────────────────────────────────────
// The brain. Runs one conversation turn: builds context, calls Claude (Anthropic
// Messages API) with tools + vision, runs the tool loop, and returns the reply
// (emoji-stripped, split into human-feeling bubbles).
// ─────────────────────────────────────────────────────────────────────────────

import type Anthropic from '@anthropic-ai/sdk';
import { anthropic, ANTHROPIC_MODEL, MAX_TOKENS } from '../lib/anthropic.js';
import { buildSystemPrompt } from './systemPrompt.js';
import { TOOLS } from '../tools/definitions.js';
import { executeTool } from '../tools/index.js';
import type { ToolContext } from '../tools/types.js';
import type { InboundImage } from '../messaging/adapter.js';
import type { ConversationState } from '../state/conversation.js';
import { appendMessage, getAppointmentsByPhone } from '../tools/db.js';
import { getClientCalendarHistory } from '../tools/calendar.js';
import { buildClientMemory, type CalRef } from './clientMemory.js';
import { BUSINESS } from '../../config/business.js';
import { stripEmoji, splitIntoBubbles, sanitizeToolResult, withRetry, log } from '../lib/util.js';

const TZ = BUSINESS.studio.timezone;
const MAX_TOOL_ITERATIONS = 6;
// Claude vision accepts jpeg, png, webp, and (non-animated) gif.
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function todayParts() {
  const now = new Date();
  const todayHuman = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(now);
  const todayISO = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return { todayHuman, todayISO };
}

export async function runAgentTurn(opts: {
  state: ConversationState;
  inboundText: string;
  images?: InboundImage[];
  ctx: ToolContext;
}): Promise<{ replyBubbles: string[]; replyText: string; handoff: boolean }> {
  const { state, inboundText, images, ctx } = opts;
  const { todayHuman, todayISO } = todayParts();

  // Load client memory (best-effort — a memory lookup must never break a reply).
  let appts: Record<string, any>[] = [];
  let calEvents: CalRef[] = [];
  try {
    appts = await getAppointmentsByPhone(state.phone);
  } catch (e) {
    log('warn', 'appointment-memory lookup failed', e);
  }
  try {
    calEvents = await getClientCalendarHistory({ email: state.profile.email, phone: state.phone });
  } catch (e) {
    log('warn', 'calendar-memory lookup failed', e);
  }

  // Two system blocks: the big stable prompt FIRST (identical every turn) with a
  // cache breakpoint so Anthropic's prompt caching reuses this prefix, then the
  // volatile per-client memory brief AFTER the breakpoint so it stays fresh
  // without busting the cache.
  const system: Anthropic.TextBlockParam[] = [
    {
      type: 'text',
      text: buildSystemPrompt({ todayHuman, todayISO, locationOverride: ctx.locationOverride ?? null }),
      cache_control: { type: 'ephemeral' },
    },
    {
      type: 'text',
      text: buildClientMemory(state, appts, calEvents),
    },
  ];

  // Prior turns from the rolling window (stored as plain text). The Messages API
  // requires the conversation to start with a user turn, so drop any leading
  // assistant message left at the head of a sliced window.
  const messages: Anthropic.MessageParam[] = state.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  while (messages.length && messages[0].role === 'assistant') messages.shift();

  // The new inbound turn. With images, content is a blocks array (images first,
  // then text); without, a plain string keeps the request simple.
  const validImages = (images ?? []).filter((img) => {
    if (VALID_IMAGE_TYPES.includes(img.mimeType)) return true;
    log('warn', `skipping unsupported image type ${img.mimeType}`);
    return false;
  });
  if (validImages.length) {
    const parts: Anthropic.ContentBlockParam[] = validImages.map((img) => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: img.mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
        data: img.dataBase64,
      },
    }));
    parts.push({ type: 'text', text: inboundText || '(the client sent an image with no caption)' });
    messages.push({ role: 'user', content: parts });
  } else {
    messages.push({ role: 'user', content: inboundText || '(the client sent an image with no caption)' });
  }

  let finalText = '';
  for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
    const resp = await withRetry(
      () =>
        anthropic.messages.create({
          model: ANTHROPIC_MODEL,
          max_tokens: MAX_TOKENS,
          system,
          messages,
          tools: TOOLS,
        }),
      { label: 'messages.create' }
    );

    const toolUses = resp.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    );

    if (resp.stop_reason === 'tool_use' && toolUses.length > 0) {
      // Echo the assistant's tool-use turn back verbatim, then answer each call.
      messages.push({ role: 'assistant', content: resp.content });
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const tu of toolUses) {
        try {
          const result = await executeTool(tu.name, tu.input, ctx);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: tu.id,
            content: sanitizeToolResult(result),
          });
        } catch (err: any) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: tu.id,
            is_error: true,
            content: `Tool failed: ${err?.message ?? String(err)}`,
          });
        }
      }
      messages.push({ role: 'user', content: toolResults });
      continue; // let the model react to tool results
    }

    // Final assistant turn — gather the visible text.
    finalText = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    break;
  }

  if (!finalText) {
    finalText = "Hey! Give me just a sec and I'll get right back to you.";
  }

  // Enforce the hard no-emoji rule, then split into texting-style bubbles.
  if (BUSINESS.reply.stripEmoji) finalText = stripEmoji(finalText);
  const replyBubbles = BUSINESS.reply.splitOnBlankLines
    ? splitIntoBubbles(finalText, BUSINESS.reply.maxBubbles)
    : [finalText];

  // Persist the turn into the rolling window.
  const inboundForLog = inboundText || (images?.length ? '(sent an image)' : '');
  await appendMessage(state, 'user', inboundForLog);
  await appendMessage(state, 'assistant', finalText);

  return { replyBubbles, replyText: finalText, handoff: !!state.handoff?.active };
}
