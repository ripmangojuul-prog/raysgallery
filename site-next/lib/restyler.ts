// Client glue for the Create tool: optimize the source image client-side, then
// POST to the Next route handler at /api/generate. Ported from the live site.
/* eslint-disable @typescript-eslint/no-explicit-any */
const MAX_PAYLOAD_BYTES = 3_900_000;
const RESIZE_STEPS = [
  { maxDimension: 2048, quality: 0.9 },
  { maxDimension: 1664, quality: 0.85 },
  { maxDimension: 1400, quality: 0.8 },
  { maxDimension: 1200, quality: 0.75 },
  { maxDimension: 1024, quality: 0.7 },
  { maxDimension: 896, quality: 0.65 },
];

const getMime = (b64: string) => {
  const m = b64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
  return m ? m[1] : 'image/jpeg';
};
const cleanB64 = (b64: string) => b64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
const utf8Bytes = (s: string) => new TextEncoder().encode(s).length;

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for resizing.'));
    img.src = src;
  });

const ALLOWED_RATIOS: [string, number][] = [
  ['1:1', 1], ['2:3', 2 / 3], ['3:2', 3 / 2], ['3:4', 3 / 4], ['4:3', 4 / 3],
  ['4:5', 4 / 5], ['5:4', 5 / 4], ['9:16', 9 / 16], ['16:9', 16 / 9], ['21:9', 21 / 9],
];
const nearestAspectRatio = async (dataUrl: string) => {
  try {
    const img = await loadImage(dataUrl);
    const r = img.width / img.height;
    let best = '1:1';
    let diff = Infinity;
    for (const [label, value] of ALLOWED_RATIOS) {
      const d = Math.abs(value - r);
      if (d < diff) {
        diff = d;
        best = label;
      }
    }
    return best;
  } catch {
    return '1:1';
  }
};

const reencode = async (inline: any, maxDimension: number, quality: number, outMime: string) => {
  const image = await loadImage(`data:${inline.mimeType || 'image/jpeg'};base64,${inline.data}`);
  const longest = Math.max(image.width, image.height);
  const scale = longest > maxDimension ? maxDimension / longest : 1;
  const w = Math.max(1, Math.round(image.width * scale));
  const h = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, w, h);
  const encoded = outMime === 'image/png' ? canvas.toDataURL('image/png') : canvas.toDataURL(outMime, quality);
  return { mimeType: outMime, data: cleanB64(encoded) };
};

const optimize = async (payload: any) => {
  const p = JSON.parse(JSON.stringify(payload));
  if (utf8Bytes(JSON.stringify(p)) <= MAX_PAYLOAD_BYTES) return p;
  const keys = [{ key: 'image', mimeType: 'image/jpeg' }];
  if (p.maskImage) keys.push({ key: 'maskImage', mimeType: 'image/png' });
  for (const step of RESIZE_STEPS) {
    for (const { key, mimeType } of keys) {
      if (!p[key]) continue;
      try {
        p[key] = await reencode(p[key], step.maxDimension, step.quality, mimeType);
      } catch {
        /* keep the previous encoding on failure */
      }
    }
    if (utf8Bytes(JSON.stringify(p)) <= MAX_PAYLOAD_BYTES) return p;
  }
  throw new Error('Image is too large. Please use a smaller photo.');
};

const extractImage = (data: any) => {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(
    (part: any) =>
      typeof part?.inlineData?.mimeType === 'string' &&
      part.inlineData.mimeType.startsWith('image/') &&
      typeof part?.inlineData?.data === 'string' &&
      part.inlineData.data.length > 0,
  );
  if (imagePart) {
    return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
  }
  throw new Error('No image was generated. Try a different photo or style.');
};

const callApi = async (payload: any) => {
  const optimized = await optimize(payload);
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(optimized),
  });
  if (!res.ok) {
    let parsed: any = {};
    try {
      parsed = await res.json();
    } catch {
      /* non-json error body */
    }
    if (res.status === 429) throw new Error(parsed.error || 'Too many requests. Wait a moment and try again.');
    if (res.status === 413) throw new Error('Image is too large. Please use a smaller photo.');
    throw new Error(parsed.error || `Generation failed (${res.status}).`);
  }
  return extractImage(await res.json());
};

export async function generateStyled(
  imageDataUrl: string,
  styleId: string,
  { mode = 'standard', maskDataUrl = null as string | null, aspectRatio = null as string | null, imageSize = '4K' } = {},
) {
  const payload: any = {
    type: 'generation',
    styleId,
    mode,
    aspectRatio: aspectRatio || (await nearestAspectRatio(imageDataUrl)),
    imageSize,
    image: { mimeType: getMime(imageDataUrl), data: cleanB64(imageDataUrl) },
  };
  if (mode === 'coverup' && maskDataUrl) {
    payload.maskImage = { mimeType: getMime(maskDataUrl), data: cleanB64(maskDataUrl) };
  }
  return callApi(payload);
}

export async function generateStencil(imageDataUrl: string, aspectRatio: string | null = null) {
  return callApi({
    type: 'stencil',
    aspectRatio: aspectRatio || (await nearestAspectRatio(imageDataUrl)),
    imageSize: '4K',
    image: { mimeType: getMime(imageDataUrl), data: cleanB64(imageDataUrl) },
  });
}
