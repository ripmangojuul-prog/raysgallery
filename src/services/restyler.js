// Client-side glue for the Create tab: optimize the source image, call /api/generate.
const MAX_PAYLOAD_BYTES = 3_900_000
const RESIZE_STEPS = [
  { maxDimension: 2048, quality: 0.9 },
  { maxDimension: 1664, quality: 0.85 },
  { maxDimension: 1400, quality: 0.8 },
  { maxDimension: 1200, quality: 0.75 },
  { maxDimension: 1024, quality: 0.7 },
  { maxDimension: 896, quality: 0.65 },
]

const getMime = (b64) => {
  const m = b64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/)
  return m ? m[1] : 'image/jpeg'
}
const cleanB64 = (b64) => b64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
const utf8Bytes = (s) => new TextEncoder().encode(s).length

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image for resizing.'))
    img.src = src
  })

const reencode = async (inline, maxDimension, quality, outMime) => {
  const image = await loadImage(`data:${inline.mimeType || 'image/jpeg'};base64,${inline.data}`)
  const longest = Math.max(image.width, image.height)
  const scale = longest > maxDimension ? maxDimension / longest : 1
  const w = Math.max(1, Math.round(image.width * scale))
  const h = Math.max(1, Math.round(image.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, w, h)
  const encoded = outMime === 'image/png' ? canvas.toDataURL('image/png') : canvas.toDataURL(outMime, quality)
  return { mimeType: outMime, data: cleanB64(encoded) }
}

const optimize = async (payload) => {
  let p = JSON.parse(JSON.stringify(payload))
  if (utf8Bytes(JSON.stringify(p)) <= MAX_PAYLOAD_BYTES) return p
  const keys = [{ key: 'image', mimeType: 'image/jpeg' }]
  if (p.maskImage) keys.push({ key: 'maskImage', mimeType: 'image/png' })
  for (const step of RESIZE_STEPS) {
    for (const { key, mimeType } of keys) {
      if (!p[key]) continue
      try {
        p[key] = await reencode(p[key], step.maxDimension, step.quality, mimeType)
      } catch {}
    }
    if (utf8Bytes(JSON.stringify(p)) <= MAX_PAYLOAD_BYTES) return p
  }
  throw new Error('Image is too large. Please use a smaller photo.')
}

const extractImage = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts || []
  const imagePart = parts.find(
    (part) =>
      typeof part?.inlineData?.mimeType === 'string' &&
      part.inlineData.mimeType.startsWith('image/') &&
      typeof part?.inlineData?.data === 'string' &&
      part.inlineData.data.length > 0,
  )
  if (imagePart) return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`
  throw new Error('No image was generated. Try a different photo or style.')
}

const callApi = async (payload) => {
  const optimized = await optimize(payload)
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(optimized),
  })
  if (!res.ok) {
    let parsed = {}
    try {
      parsed = await res.json()
    } catch {}
    if (res.status === 429) throw new Error(parsed.error || 'Too many requests — wait a moment and try again.')
    if (res.status === 413) throw new Error('Image is too large. Please use a smaller photo.')
    throw new Error(parsed.error || `Generation failed (${res.status}).`)
  }
  return extractImage(await res.json())
}

// imageDataUrl: data: URL of the source photo. maskDataUrl: optional cover-up mask.
export async function generateStyled(imageDataUrl, styleId, { mode = 'standard', maskDataUrl = null, aspectRatio = '1:1', imageSize = '1K' } = {}) {
  const payload = {
    type: 'generation',
    styleId,
    mode,
    aspectRatio,
    imageSize,
    image: { mimeType: getMime(imageDataUrl), data: cleanB64(imageDataUrl) },
  }
  if (mode === 'coverup' && maskDataUrl) {
    payload.maskImage = { mimeType: getMime(maskDataUrl), data: cleanB64(maskDataUrl) }
  }
  return callApi(payload)
}

export async function generateStencil(imageDataUrl, aspectRatio = '1:1') {
  return callApi({
    type: 'stencil',
    aspectRatio,
    image: { mimeType: getMime(imageDataUrl), data: cleanB64(imageDataUrl) },
  })
}
