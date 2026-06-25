// Free, account-free image generation for the Create tool. App Router port of
// the original Vercel function: same Gemini model, prompts, and vision pre-pass.
import type { NextRequest } from 'next/server';
import {
  analyzeImageSubject,
  callGeminiGeneration,
  injectSubjectDescription,
  sanitizeAspectRatio,
  sanitizeImageSize,
} from '@/lib/gemini/_generateCore.js';
import { getStylePrompt } from '@/lib/gemini/_stylePrompts.js';
import { CREATE_STYLE_IDS } from '@/lib/gemini/_styles.js';

export const runtime = 'nodejs';
export const maxDuration = 120;

const STENCIL_PROMPT =
  'Convert this image into a professional tattoo stencil. strictly black line work on a pure white background. No shading, no gray values, no gradients, no colors. Clean, continuous, distinct lines suitable for a thermal transfer printer. High contrast.';
const COVERUP_PREFIX =
  'You are a Tattoo Restyle Expert.\nTask: Redraw the existing tattoo (first image) exactly, applying a new artistic style. The white areas in the mask (second image) indicate the focus areas to restyle.\nConstraints:\n1. STRICTLY PRESERVE the original linework, geometry, and composition.\n2. Do NOT generate new objects, characters, or elements not present in the original.\n3. Do NOT change the pose or outline of any figure.\n4. ONLY update the shading, texture, and color to match the requested style.\nCreate a coherent, intentional, professional tattoo design.\n\n';

// Tiny in-memory IP rate limit (best-effort; resets on cold start).
const HITS = new Map<string, { start: number; count: number }>();
function rateLimited(ip: string, max = 8, windowMs = 60000) {
  const now = Date.now();
  const rec = HITS.get(ip);
  if (!rec || now - rec.start > windowMs) {
    HITS.set(ip, { start: now, count: 1 });
    return false;
  }
  rec.count += 1;
  return rec.count > max;
}

const cleanBase64 = (value: string) => value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
const isImagePayload = (v: any) =>
  !!v && typeof v === 'object' && typeof v.mimeType === 'string' && typeof v.data === 'string';
const isImageMime = (v: any) => typeof v === 'string' && v.startsWith('image/');

function buildParts(body: any) {
  const type = body?.type === 'stencil' ? 'stencil' : 'generation';
  const mode = body?.mode === 'coverup' ? 'coverup' : 'standard';
  const aspectRatio = sanitizeAspectRatio(body?.aspectRatio);
  const imageSize = sanitizeImageSize(body?.imageSize);

  if (!isImagePayload(body?.image) || !isImageMime(body.image.mimeType) || !body.image.data.trim()) {
    throw { status: 400, message: 'A valid source image is required.' };
  }
  const imagePart = { mimeType: body.image.mimeType, data: cleanBase64(body.image.data) };

  if (type === 'stencil') {
    return {
      parts: [{ text: STENCIL_PROMPT }, { inlineData: imagePart }],
      styleId: null,
      styleName: 'Stencil',
      mode: 'standard',
      aspectRatio,
      imageSize,
    };
  }

  const styleId = typeof body?.styleId === 'string' ? body.styleId.trim() : '';
  if (!CREATE_STYLE_IDS.has(styleId)) {
    throw { status: 400, message: 'Unknown style.' };
  }
  const stylePrompt = getStylePrompt(styleId);
  if (!stylePrompt) {
    throw { status: 400, message: 'Unknown style.' };
  }

  if (mode === 'coverup') {
    const promptText =
      COVERUP_PREFIX +
      stylePrompt.replace(
        '[SUBJECT]',
        'A professional restyle of the existing tattoo in the reference photo, preserving all original linework and composition',
      );
    const parts: any[] = [{ text: promptText }, { inlineData: imagePart }];
    if (isImagePayload(body?.maskImage) && isImageMime(body.maskImage.mimeType) && body.maskImage.data.trim()) {
      parts.push({ inlineData: { mimeType: body.maskImage.mimeType, data: cleanBase64(body.maskImage.data) } });
    }
    return { parts, styleId, styleName: styleId, mode, aspectRatio, imageSize };
  }

  const promptText = stylePrompt.replace('[SUBJECT]', 'The subject in the attached image');
  return { parts: [{ text: promptText }, { inlineData: imagePart }], styleId, styleName: styleId, mode, aspectRatio, imageSize };
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Image generation is not configured.' }, { status: 500 });
  }

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return Response.json({ error: 'Too many requests. Please wait a minute and try again.' }, { status: 429 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  body = body || {};

  if (JSON.stringify(body).length > 10 * 1024 * 1024) {
    return Response.json({ error: 'Image is too large. Please use a smaller photo.' }, { status: 413 });
  }

  let gp: any;
  try {
    gp = buildParts(body);
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Invalid request.' }, { status: err?.status || 400 });
  }

  const isStencil = gp.styleId === null;

  let parts = gp.parts;
  if (!isStencil) {
    const imagePart = gp.parts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));
    if (imagePart) {
      const description = await analyzeImageSubject(
        apiKey,
        imagePart.inlineData.data,
        imagePart.inlineData.mimeType,
        gp.mode,
        15000,
      );
      if (description) parts = injectSubjectDescription(gp.parts, description, gp.mode);
    }
  }

  try {
    const generation = await callGeminiGeneration({
      apiKey,
      parts,
      aspectRatio: gp.aspectRatio,
      imageSize: gp.imageSize,
      mode: gp.mode,
      styleId: gp.styleId,
      styleName: gp.styleName,
    });
    if (generation.ok === false) {
      return Response.json({ error: generation.error }, { status: generation.status });
    }
    return Response.json(generation.data);
  } catch (error: any) {
    console.error('Server error:', error);
    return Response.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
