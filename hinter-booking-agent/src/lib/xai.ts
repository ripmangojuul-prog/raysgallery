import OpenAI from 'openai';

if (!process.env.XAI_API_KEY) {
  throw new Error('XAI_API_KEY is not set. Copy .env.example to .env and fill it in.');
}

// xAI's API is OpenAI-compatible: same official `openai` SDK, just a different
// baseURL + key (xAI recommends the OpenAI SDK over its other compat layers for
// stability). All Grok calls go through `client.chat.completions.create`.
export const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

// Grok 4.2 reasoning — a chain-of-thought model that also accepts image input and
// function calling in the same request (so vision + tools still work). Pinned to
// the dated snapshot from the xAI console; override with XAI_MODEL (e.g.
// `grok-4.20-reasoning` for the rolling stable alias, or `grok-4.3`).
export const XAI_MODEL = process.env.XAI_MODEL || 'grok-4.20-0309-reasoning';
