// Gemini generation core — ported from the Restyler app, stripped of auth/credits.
// Model + prompt behavior kept identical so output matches 8krealism.com.

const DEFAULT_ASPECT_RATIO = '1:1';
const ALLOWED_IMAGE_SIZES = new Set(['1K', '2K', '4K']);
const DEFAULT_IMAGE_SIZE = '1K';
const IMAGE_SIZE_TIMEOUT_MS = { '1K': 50000, '2K': 60000, '4K': 100000 };

const ALLOWED_ASPECT_RATIOS = new Set([
  '1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9',
]);

const GEMINI_MODEL = 'gemini-3.1-flash-image-preview';
const DEFAULT_GEMINI_TIMEOUT_MS = 50000;

async function fetchWithTimeout(input, init, timeoutMs = DEFAULT_GEMINI_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
];

export function sanitizeAspectRatio(aspectRatio) {
  if (typeof aspectRatio !== 'string') return DEFAULT_ASPECT_RATIO;
  const trimmed = aspectRatio.trim();
  return ALLOWED_ASPECT_RATIOS.has(trimmed) ? trimmed : DEFAULT_ASPECT_RATIO;
}

export function sanitizeImageSize(imageSize) {
  if (typeof imageSize !== 'string') return DEFAULT_IMAGE_SIZE;
  const upper = imageSize.trim().toUpperCase();
  return ALLOWED_IMAGE_SIZES.has(upper) ? upper : DEFAULT_IMAGE_SIZE;
}

function parseGeminiErrorMessage(rawErrorText) {
  try {
    const parsed = JSON.parse(rawErrorText);
    const message = parsed?.error?.message;
    return typeof message === 'string' && message.length > 0 ? message : null;
  } catch {
    const trimmed = rawErrorText.trim();
    return trimmed.length > 0 ? trimmed.slice(0, 500) : null;
  }
}

function extractThoughtText(parts) {
  return parts
    .filter((part) => typeof part?.text === 'string' && part.text.length > 0)
    .map((part) => part.text)
    .join('\n')
    .trim();
}

function hasImageOutput(parts) {
  return parts.some((part) => (
    typeof part?.inlineData?.mimeType === 'string'
    && part.inlineData.mimeType.startsWith('image/')
    && typeof part?.inlineData?.data === 'string'
    && part.inlineData.data.length > 0
  ));
}

export async function analyzeImageSubject(apiKey, imageData, mimeType, mode, timeoutMs) {
  try {
    const analysisPrompt = mode === 'coverup'
      ? "Examine this tattoo and describe ONLY what the tattoo depicts — the artwork subjects themselves. For each distinct tattoo design visible, describe: what it depicts (animal, skull, portrait, symbol, etc.), its pose or arrangement, and key visual details. Do NOT describe the skin, body part, background, clothing, or setting. ONLY describe the tattoo artwork subjects as if they were standalone illustrations."
      : "This image contains tattoo artwork on a person's body. Describe ONLY what the tattoos depict — the artwork subjects themselves, as if they were standalone illustrations. For each distinct tattoo design, describe: what it depicts (animal, skull, figure, symbol, flower, etc.), its pose or composition, and key visual details. Do NOT describe the person's body, skin, background, clothing, furniture, or setting. ONLY the tattoo subjects.";

    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: analysisPrompt }, { inlineData: { mimeType, data: imageData } }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024, responseModalities: ['TEXT'] },
          safetySettings: SAFETY_SETTINGS,
        }),
      },
      timeoutMs || 15000
    );

    if (!response.ok) return null;
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text || text.length < 50) return null;
    return text;
  } catch {
    return null;
  }
}

export function injectSubjectDescription(parts, description, mode) {
  const enriched = JSON.parse(JSON.stringify(parts));
  const textPartIndex = enriched.findIndex((p) => typeof p.text === 'string');
  if (textPartIndex !== -1) {
    enriched[textPartIndex].text = mode === 'coverup'
      ? `SUBJECT ANALYSIS: The tattoo depicts: ${description}\n\n${enriched[textPartIndex].text}`
      : `REFERENCE ANALYSIS (use the attached image as the primary source, this is supplementary context): ${description}\n\n${enriched[textPartIndex].text}`;
  }
  return enriched;
}

export async function callGeminiGeneration({ apiKey, parts, aspectRatio, imageSize, mode = 'standard', styleId = null, styleName = null }) {
  const sanitizedAspectRatio = sanitizeAspectRatio(aspectRatio);
  const sanitizedImageSize = sanitizeImageSize(imageSize);
  const timeoutMs = IMAGE_SIZE_TIMEOUT_MS[sanitizedImageSize] ?? DEFAULT_GEMINI_TIMEOUT_MS;

  let response;
  try {
    response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            temperature: 0.4,
            thinkingConfig: { includeThoughts: true },
            imageConfig: { imageSize: sanitizedImageSize, aspectRatio: sanitizedAspectRatio },
          },
          safetySettings: SAFETY_SETTINGS,
        }),
      },
      timeoutMs
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { ok: false, status: 504, error: 'Gemini API timed out. Try again with a smaller image.' };
    }
    console.error('Gemini API fetch failed:', error);
    return { ok: false, status: 500, error: 'Gemini API request failed.' };
  }

  if (!response.ok) {
    const errorText = await response.text();
    const parsedMessage = parseGeminiErrorMessage(errorText);
    console.error('Gemini API error:', { status: response.status, message: parsedMessage || errorText, mode, styleId, styleName });
    return {
      ok: false,
      status: response.status,
      error: parsedMessage ? `Gemini API error: ${parsedMessage}` : `Gemini API error: ${response.statusText}`,
    };
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];
  const candidateParts = candidate?.content?.parts || [];
  if (!hasImageOutput(candidateParts)) {
    const thoughtText = extractThoughtText(candidateParts);
    console.error('Gemini returned no image part:', { mode, styleId, styleName, finishReason: candidate?.finishReason || null, thoughtPreview: thoughtText.slice(0, 300) });
    if (candidate?.finishReason === 'SAFETY') {
      return { ok: false, status: 422, error: 'Generation blocked by safety filters. Please try a different source image or style.', finishReason: candidate.finishReason };
    }
    return { ok: false, status: 422, error: 'Model generated text but no image. Please try again.', finishReason: candidate?.finishReason || null };
  }

  return { ok: true, data };
}
