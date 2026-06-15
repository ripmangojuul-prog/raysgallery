// ─────────────────────────────────────────────────────────────────────────────
// The brain. Runs one conversation turn: builds context, calls Grok (xAI's
// OpenAI-compatible Chat Completions API) with tools + vision, runs the tool
// loop, and returns the reply (emoji-stripped, split into human-feeling bubbles).
// ─────────────────────────────────────────────────────────────────────────────

import type OpenAI from 'openai';
import { xai, XAI_MODEL } from '../lib/xai.js';
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
// Grok 4.2 is a reasoning model: hidden reasoning tokens count against this cap,
// so keep it generous or the short visible reply could get truncated. Tune with
// XAI_MAX_TOKENS.
const MAX_COMPLETION_TOKENS = Number(process.env.XAI_MAX_TOKENS) || 8000;
const MAX_TOOL_ITERATIONS = 6;
// xAI vision accepts jpg/jpeg and png only.
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png'];

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

  // Two system messages: the big stable prompt FIRST (identical every turn, so
  // xAI's automatic prompt caching hits this prefix), then the volatile per-client
  // memory brief so it stays fresh without busting that cache.
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: buildSystemPrompt({ todayHuman, todayISO, locationOverride: ctx.locationOverride ?? null }),
    },
    {
      role: 'system',
      content: buildClientMemory(state, appts, calEvents),
    },
  ];

  // Prior turns from the rolling window (stored as plain text).
  for (const m of state.messages) {
    messages.push({ role: m.role, content: m.content });
  }

  // The new inbound turn. With images, content must be a parts array (images
  // first, then text); without, a plain string keeps the request simple.
  const validImages = (images ?? []).filter((img) => {
    if (VALID_IMAGE_TYPES.includes(img.mimeType)) return true;
    log('warn', `skipping unsupported image type ${img.mimeType}`);
    return false;
  });
  if (validImages.length) {
    const parts: OpenAI.Chat.Completions.ChatCompletionContentPart[] = validImages.map((img) => ({
      type: 'image_url',
      image_url: { url: `data:${img.mimeType};base64,${img.dataBase64}`, detail: 'high' },
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
        xai.chat.completions.create(
          {
            model: XAI_MODEL,
            max_completion_tokens: MAX_COMPLETION_TOKENS,
            messages,
            tools: TOOLS,
          },
          // Pin this conversation to one cache key to maximize prompt-cache hits.
          { headers: { 'x-grok-conv-id': state.phone } }
        ),
      { label: 'chat.completions.create' }
    );

    const msg = resp.choices[0]?.message;
    const toolCalls = msg?.tool_calls ?? [];

    if (toolCalls.length > 0) {
      // Echo the assistant's tool-call turn back, then answer each tool call.
      // (Rebuilt cleanly — drop the non-standard reasoning_content field.)
      messages.push({ role: 'assistant', content: msg?.content ?? '', tool_calls: toolCalls });
      for (const tc of toolCalls) {
        if (tc.type !== 'function') continue;
        try {
          const args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
          const result = await executeTool(tc.function.name, args, ctx);
          messages.push({ role: 'tool', tool_call_id: tc.id, content: sanitizeToolResult(result) });
        } catch (err: any) {
          messages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: `Tool failed: ${err?.message ?? String(err)}`,
          });
        }
      }
      continue; // let the model react to tool results
    }

    // Final assistant turn — gather text.
    finalText = (msg?.content ?? '').trim();
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
