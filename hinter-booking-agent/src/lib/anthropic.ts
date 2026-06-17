import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set. Copy .env.example to .env and fill it in.');
}

// The brain runs on Anthropic's Claude. All calls go through
// `anthropic.messages.create` (Messages API: top-level system prompt, native
// tool-use loop, base64 image vision, and automatic prompt caching).
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Claude Sonnet 4.6 — the balanced model: fast and cheap enough for SMS volume
// while handling vision + tool use + the conversational voice this agent needs.
// Override with ANTHROPIC_MODEL (e.g. `claude-opus-4-8` for max capability, or
// `claude-haiku-4-5-20251001` for the cheapest/fastest).
export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

// Visible reply cap. SMS replies are short, so 1024 is plenty; bump via
// ANTHROPIC_MAX_TOKENS if you ever enable longer outputs.
export const MAX_TOKENS = Number(process.env.ANTHROPIC_MAX_TOKENS) || 1024;
