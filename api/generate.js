// Free, account-free image generation for the HINTER "Create" tab.
// Ported from the Restyler app with all auth / credits / Firebase removed.
import {
  analyzeImageSubject,
  callGeminiGeneration,
  injectSubjectDescription,
  sanitizeAspectRatio,
  sanitizeImageSize,
} from './_generateCore.js';
import { getStylePrompt } from './_stylePrompts.js';
import { CREATE_STYLE_IDS } from './_styles.js';

export const config = { maxDuration: 120 };

const STENCIL_PROMPT = 'Convert this image into a professional tattoo stencil. strictly black line work on a pure white background. No shading, no gray values, no gradients, no colors. Clean, continuous, distinct lines suitable for a thermal transfer printer. High contrast.';
const COVERUP_PREFIX = 'You are a Tattoo Restyle Expert.\nTask: Redraw the existing tattoo (first image) exactly, applying a new artistic style. The white areas in the mask (second image) indicate the focus areas to restyle.\nConstraints:\n1. STRICTLY PRESERVE the original linework, geometry, and composition.\n2. Do NOT generate new objects, characters, or elements not present in the original.\n3. Do NOT change the pose or outline of any figure.\n4. ONLY update the shading, texture, and color to match the requested style.\nCreate a coherent, intentional, professional tattoo design.\n\n';

// --- tiny in-memory IP rate limit (best-effort; resets on cold start) ---
const HITS = new Map();
function rateLimited(ip, max = 8, windowMs = 60000) {
  const now = Date.now();
  const rec = HITS.get(ip);
  if (!rec || now - rec.start > windowMs) {
    HITS.set(ip, { start: now, count: 1 });
    return false;
  }
  rec.count += 1;
  return rec.count > max;
}

function cleanBase64(value) {
  return value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
}
function isImagePayload(v) {
  return !!v && typeof v === 'object' && typeof v.mimeType === 'string' && typeof v.data === 'string';
}
function isImageMime(v) {
  return typeof v === 'string' && v.startsWith('image/');
}

function buildParts(body) {
  const type = body?.type === 'stencil' ? 'stencil' : 'generation';
  const mode = body?.mode === 'coverup' ? 'coverup' : 'standard';
  const aspectRatio = sanitizeAspectRatio(body?.aspectRatio);
  const imageSize = sanitizeImageSize(body?.imageSize);

  if (!isImagePayload(body?.image) || !isImageMime(body.image.mimeType) || !body.image.data.trim()) {
    throw { status: 400, message: 'A valid source image is required.' };
  }
  const imagePart = { mimeType: body.image.mimeType, data: cleanBase64(body.image.data) };

  if (type === 'stencil') {
    return { parts: [{ text: STENCIL_PROMPT }, { inlineData: imagePart }], styleId: null, styleName: 'Stencil', mode: 'standard', aspectRatio, imageSize };
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
    let promptText = COVERUP_PREFIX + stylePrompt.replace(
      '[SUBJECT]',
      'A professional restyle of the existing tattoo in the reference photo, preserving all original linework and composition'
    );
    const parts = [{ text: promptText }, { inlineData: imagePart }];
    if (isImagePayload(body?.maskImage) && isImageMime(body.maskImage.mimeType) && body.maskImage.data.trim()) {
      parts.push({ inlineData: { mimeType: body.maskImage.mimeType, data: cleanBase64(body.maskImage.data) } });
    }
    return { parts, styleId, styleName: styleId, mode, aspectRatio, imageSize };
  }

  let promptText = stylePrompt.replace('[SUBJECT]', 'The subject in the attached image');
  if (body?.whiteBackground === true) {
    promptText += ' MODIFY: Isolate the subject completely on a pure, flat white background. Remove all original background context.';
  }
  return { parts: [{ text: promptText }, { inlineData: imagePart }], styleId, styleName: styleId, mode, aspectRatio, imageSize };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Image generation is not configured.' });

  const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const bodySize = JSON.stringify(body).length;
  if (bodySize > 10 * 1024 * 1024) {
    return res.status(413).json({ error: 'Image is too large. Please use a smaller photo.' });
  }

  let gp;
  try {
    gp = buildParts(body);
  } catch (err) {
    return res.status(err?.status || 400).json({ error: err?.message || 'Invalid request.' });
  }

  const isStencil = gp.styleId === null;

  // Vision pre-pass for richer prompts (skip for stencils).
  let parts = gp.parts;
  if (!isStencil) {
    const imagePart = gp.parts.find((p) => p.inlineData?.mimeType?.startsWith('image/'));
    if (imagePart) {
      const description = await analyzeImageSubject(apiKey, imagePart.inlineData.data, imagePart.inlineData.mimeType, gp.mode, 15000);
      if (description) parts = injectSubjectDescription(gp.parts, description, gp.mode);
    }
  }

  try {
    const generation = await callGeminiGeneration({
      apiKey, parts, aspectRatio: gp.aspectRatio, imageSize: gp.imageSize, mode: gp.mode, styleId: gp.styleId, styleName: gp.styleName,
    });
    if (generation.ok === false) {
      return res.status(generation.status).json({ error: generation.error });
    }
    return res.status(200).json(generation.data);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
