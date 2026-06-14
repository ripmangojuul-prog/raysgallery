import React, { useCallback, useEffect, useRef, useState } from 'react'
import Glint from './Glint.jsx'
import { CREATE_STYLES } from '../createStyles.js'
import { generateStyled, generateStencil } from '../services/restyler.js'

const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Could not read that image.'))
    reader.readAsDataURL(file)
  })

export default function Create() {
  const [mode, setMode] = useState('standard') // 'standard' | 'coverup'
  const [image, setImage] = useState(null) // source data URL
  const [styleId, setStyleId] = useState(CREATE_STYLES[0].id)
  const [result, setResult] = useState(null)
  const [stencil, setStencil] = useState(null)
  const [busy, setBusy] = useState(false)
  const [busyLabel, setBusyLabel] = useState('')
  const [error, setError] = useState(null)
  const [slider, setSlider] = useState(50)
  const [dragging, setDragging] = useState(false)

  const fileRef = useRef(null)
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const drawingRef = useRef(false)
  const [hasMask, setHasMask] = useState(false)
  const [brush, setBrush] = useState(34)

  const loadFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    try {
      const url = await readFileAsDataURL(file)
      setImage(url)
      setResult(null)
      setStencil(null)
      setError(null)
      setHasMask(false)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const onInput = (e) => {
    if (e.target.files?.[0]) loadFile(e.target.files[0])
    e.target.value = ''
  }
  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0])
  }

  // ---- Cover-up mask canvas ----
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasMask(false)
  }, [])

  useEffect(() => {
    if (mode === 'coverup' && image && imgRef.current?.complete) initCanvas()
  }, [mode, image, initCanvas])

  const paint = (clientX, clientY) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (clientX - rect.left) * (canvas.width / rect.width)
    const y = (clientY - rect.top) * (canvas.height / rect.height)
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = 'rgba(196, 168, 130, 0.55)'
    ctx.fillStyle = 'rgba(196, 168, 130, 0.55)'
    ctx.lineWidth = brush * (canvas.width / rect.width)
    ctx.lineCap = 'round'
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }
  const startPaint = (x, y) => {
    drawingRef.current = true
    setHasMask(true)
    canvasRef.current?.getContext('2d').beginPath()
    paint(x, y)
  }
  const endPaint = () => {
    drawingRef.current = false
    canvasRef.current?.getContext('2d').beginPath()
  }
  const clearMask = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    setHasMask(false)
  }

  // Build a black/white mask PNG from the painted overlay.
  const buildMask = () => {
    const src = canvasRef.current
    if (!src || !hasMask) return null
    const out = document.createElement('canvas')
    out.width = src.width
    out.height = src.height
    const octx = out.getContext('2d')
    octx.fillStyle = 'black'
    octx.fillRect(0, 0, out.width, out.height)
    const data = src.getContext('2d').getImageData(0, 0, src.width, src.height).data
    const md = octx.createImageData(out.width, out.height)
    for (let i = 0; i < data.length; i += 4) {
      const on = data[i + 3] > 10
      md.data[i] = md.data[i + 1] = md.data[i + 2] = on ? 255 : 0
      md.data[i + 3] = 255
    }
    octx.putImageData(md, 0, 0)
    return out.toDataURL('image/png')
  }

  const run = async () => {
    if (!image || busy) return
    let maskDataUrl = null
    if (mode === 'coverup') {
      maskDataUrl = buildMask()
      if (!maskDataUrl) {
        setError('Paint over the tattoo you want to cover first.')
        return
      }
    }
    setBusy(true)
    setBusyLabel(mode === 'coverup' ? 'Reworking your tattoo…' : 'Restyling…')
    setError(null)
    setResult(null)
    setStencil(null)
    try {
      const out = await generateStyled(image, styleId, { mode, maskDataUrl })
      setResult(out)
      setSlider(50)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const makeStencil = async () => {
    if (!result || busy) return
    setBusy(true)
    setBusyLabel('Drawing stencil…')
    setError(null)
    try {
      setStencil(await generateStencil(result))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const download = (url, tag) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `hinter-${tag}-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const reset = () => {
    setImage(null)
    setResult(null)
    setStencil(null)
    setError(null)
    setHasMask(false)
  }

  const shown = stencil || result

  return (
    <section className="section create" id="create">
      <div className="create-inner" data-reveal>
        <p className="create-kicker"><Glint size={9} /> Play with the work <Glint size={9} /></p>
        <h2 className="create-title">Create — <em>restyle a photo</em></h2>
        <p className="create-sub">
          Upload any photo and reimagine it in graphite, dotwork, or liquid chrome — or
          mock up a cover-up over an existing tattoo. Free to play with, no account needed.
        </p>

        <div className="create-modes" role="tablist">
          <button className={`create-mode ${mode === 'standard' ? 'is-active' : ''}`} onClick={() => { setMode('standard'); setResult(null); setStencil(null) }} role="tab" aria-selected={mode === 'standard'}>Restyle</button>
          <button className={`create-mode ${mode === 'coverup' ? 'is-active' : ''}`} onClick={() => { setMode('coverup'); setResult(null); setStencil(null) }} role="tab" aria-selected={mode === 'coverup'}>Tattoo Cover-Up</button>
        </div>

        <div className="create-grid">
          {/* Source / mask column */}
          <div className="create-stage">
            {!image ? (
              <label
                className={`create-drop ${dragging ? 'is-drag' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <input ref={fileRef} type="file" accept="image/*" onChange={onInput} hidden />
                <span className="create-drop-mark">＋</span>
                <span className="create-drop-title">Upload a photo</span>
                <span className="create-drop-hint">Tap to choose · or drag an image here</span>
              </label>
            ) : (
              <div className="create-canvas-wrap">
                {mode === 'coverup' && !shown ? (
                  <div className="create-mask-stage">
                    <img ref={imgRef} src={image} alt="Your tattoo" onLoad={initCanvas} draggable={false} />
                    <canvas
                      ref={canvasRef}
                      className="create-mask-canvas"
                      onMouseDown={(e) => startPaint(e.clientX, e.clientY)}
                      onMouseMove={(e) => drawingRef.current && paint(e.clientX, e.clientY)}
                      onMouseUp={endPaint}
                      onMouseLeave={endPaint}
                      onTouchStart={(e) => { e.preventDefault(); const t = e.touches[0]; startPaint(t.clientX, t.clientY) }}
                      onTouchMove={(e) => { e.preventDefault(); if (drawingRef.current) { const t = e.touches[0]; paint(t.clientX, t.clientY) } }}
                      onTouchEnd={endPaint}
                    />
                    <p className="create-mask-tip">Paint over the tattoo you want to cover</p>
                  </div>
                ) : shown ? (
                  <CompareView before={image} after={shown} slider={slider} setSlider={setSlider} isStencil={!!stencil} />
                ) : (
                  <img className="create-src-preview" src={image} alt="Your photo" draggable={false} />
                )}

                {busy && (
                  <div className="create-busy">
                    <span className="create-spinner" />
                    <span>{busyLabel}</span>
                  </div>
                )}
              </div>
            )}

            {image && mode === 'coverup' && !shown && (
              <div className="create-mask-tools">
                <label className="create-brush">
                  Brush
                  <input type="range" min="12" max="80" value={brush} onChange={(e) => setBrush(Number(e.target.value))} />
                </label>
                <button className="create-textbtn" onClick={clearMask} disabled={!hasMask}>Clear</button>
                <button className="create-textbtn" onClick={() => fileRef.current?.click()}>Change photo</button>
                <input ref={fileRef} type="file" accept="image/*" onChange={onInput} hidden />
              </div>
            )}
          </div>

          {/* Style picker column */}
          <div className="create-side">
            <p className="create-side-label">Choose a style</p>
            <div className="create-styles">
              {CREATE_STYLES.map((s) => (
                <button
                  key={s.id}
                  className={`create-style ${styleId === s.id ? 'is-active' : ''}`}
                  onClick={() => setStyleId(s.id)}
                  title={s.blurb}
                >
                  <span className="create-style-name">{s.name}</span>
                  <span className="create-style-blurb">{s.blurb}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="create-error">{error}</p>}

        <div className="create-actions">
          {!shown ? (
            <button className="btn btn--gold" onClick={run} disabled={!image || busy}>
              {busy ? 'Working…' : mode === 'coverup' ? 'Generate cover-up' : 'Restyle photo'}
            </button>
          ) : (
            <>
              <button className="btn btn--gold" onClick={() => download(shown, stencil ? 'stencil' : 'restyle')}>Download</button>
              {!stencil && <button className="btn" onClick={makeStencil} disabled={busy}>Make stencil</button>}
              <button className="btn" onClick={() => { setResult(null); setStencil(null) }} disabled={busy}>Try another style</button>
              <button className="create-textbtn" onClick={reset}>Start over</button>
            </>
          )}
          {image && !shown && <button className="create-textbtn" onClick={reset}>Start over</button>}
        </div>

        <p className="create-fine">
          Powered by Google Gemini. Your photo is sent for generation only and isn&apos;t stored.
          Like what you made? <a href="#book">Book it as a real tattoo.</a>
        </p>
      </div>
    </section>
  )
}

function CompareView({ before, after, slider, setSlider, isStencil }) {
  return (
    <div className="create-compare">
      <img className="create-compare-after" src={after} alt={isStencil ? 'Stencil' : 'Restyled'} draggable={false} />
      <div className="create-compare-before" style={{ width: `${slider}%` }}>
        <img src={before} alt="Original" draggable={false} />
      </div>
      <input
        className="create-compare-range"
        type="range"
        min="0"
        max="100"
        value={slider}
        onChange={(e) => setSlider(Number(e.target.value))}
        aria-label="Compare original and result"
      />
      <span className="create-compare-handle" style={{ left: `${slider}%` }} aria-hidden="true" />
    </div>
  )
}
