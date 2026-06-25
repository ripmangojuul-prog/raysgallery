'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import Reveal from './Reveal';
import { CREATE_STYLES } from '@/lib/data';
import { generateStyled, generateStencil } from '@/lib/restyler';

const readFileAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.readAsDataURL(file);
  });

export default function Create() {
  const [mode, setMode] = useState<'standard' | 'coverup'>('standard');
  const [image, setImage] = useState<string | null>(null);
  const [styleId, setStyleId] = useState(CREATE_STYLES[0].id);
  const [result, setResult] = useState<string | null>(null);
  const [stencil, setStencil] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [slider, setSlider] = useState(50);
  const [dragging, setDragging] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const drawingRef = useRef(false);
  const [hasMask, setHasMask] = useState(false);
  const [brush, setBrush] = useState(34);

  const loadFile = useCallback(async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    try {
      const url = await readFileAsDataURL(file);
      setImage(url);
      setResult(null);
      setStencil(null);
      setError(null);
      setHasMask(false);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) loadFile(e.target.files[0]);
    e.target.value = '';
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0]);
  };

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setHasMask(false);
  }, []);

  useEffect(() => {
    if (mode === 'coverup' && image && imgRef.current?.complete) initCanvas();
  }, [mode, image, initCanvas]);

  const paint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(94, 226, 122, 0.5)';
    ctx.fillStyle = 'rgba(94, 226, 122, 0.5)';
    ctx.lineWidth = brush * (canvas.width / rect.width);
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const startPaint = (x: number, y: number) => {
    drawingRef.current = true;
    setHasMask(true);
    canvasRef.current?.getContext('2d')?.beginPath();
    paint(x, y);
  };
  const endPaint = () => {
    drawingRef.current = false;
    canvasRef.current?.getContext('2d')?.beginPath();
  };
  const clearMask = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setHasMask(false);
  };

  const buildMask = () => {
    const src = canvasRef.current;
    if (!src || !hasMask) return null;
    const out = document.createElement('canvas');
    out.width = src.width;
    out.height = src.height;
    const octx = out.getContext('2d')!;
    octx.fillStyle = 'black';
    octx.fillRect(0, 0, out.width, out.height);
    const data = src.getContext('2d')!.getImageData(0, 0, src.width, src.height).data;
    const md = octx.createImageData(out.width, out.height);
    for (let i = 0; i < data.length; i += 4) {
      const on = data[i + 3] > 10;
      md.data[i] = md.data[i + 1] = md.data[i + 2] = on ? 255 : 0;
      md.data[i + 3] = 255;
    }
    octx.putImageData(md, 0, 0);
    return out.toDataURL('image/png');
  };

  const run = async () => {
    if (!image || busy) return;
    let maskDataUrl: string | null = null;
    if (mode === 'coverup') {
      maskDataUrl = buildMask();
      if (!maskDataUrl) {
        setError('Paint over the tattoo you want to cover first.');
        return;
      }
    }
    setBusy(true);
    setBusyLabel(mode === 'coverup' ? 'Reworking your tattoo' : 'Restyling your photo');
    setError(null);
    setResult(null);
    setStencil(null);
    try {
      const out = await generateStyled(image, styleId, { mode, maskDataUrl });
      setResult(out);
      setSlider(50);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const makeStencil = async () => {
    if (!result || busy) return;
    setBusy(true);
    setBusyLabel('Drawing the stencil');
    setError(null);
    try {
      setStencil(await generateStencil(result));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const download = (url: string, tag: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `hinter-${tag}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setStencil(null);
    setError(null);
    setHasMask(false);
  };

  const shown = stencil || result;

  const textBtn =
    'font-mono text-[0.68rem] uppercase tracking-[0.12em] text-faint transition-colors hover:text-acid active:translate-y-px disabled:opacity-40';
  const actionBtn =
    'inline-flex items-center justify-center whitespace-nowrap border px-7 py-3 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition-[background-color,color,border-color,transform] duration-200 active:translate-y-px disabled:opacity-40 disabled:pointer-events-none';

  return (
    <section id="create" className="shell border-b border-rule py-[var(--section-pad)]">
      <Reveal>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[0.72rem] text-acid">[ 03 ]</span>
          <span className="h-px flex-1 bg-rule-2" aria-hidden="true" />
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-faint">free // no account</span>
        </div>
        <h2 className="mt-7 font-head font-bold uppercase leading-[0.95] tracking-[-0.01em] text-paper text-[clamp(2rem,6vw,4.2rem)]">
          Create <span className="text-acid">/</span> restyle a photo
        </h2>
        <p className="mt-5 max-w-[60ch] text-[0.95rem] leading-relaxed text-dim">
          Upload any photo and reimagine it in graphite, dotwork, or liquid chrome, or mock up a
          cover-up over an existing tattoo.
        </p>
      </Reveal>

      <div className="mt-9" role="group" aria-label="Choose what to make">
        <div className="inline-flex border border-rule">
          {([
            ['standard', 'Restyle'],
            ['coverup', 'Tattoo Cover-Up'],
          ] as const).map(([id, label]) => {
            const on = mode === id;
            return (
              <button
                key={id}
                aria-pressed={on}
                onClick={() => {
                  setMode(id);
                  setResult(null);
                  setStencil(null);
                }}
                className={`px-6 py-3 font-mono text-[0.7rem] uppercase tracking-[0.14em] transition-colors active:translate-y-px ${
                  on ? 'bg-paper text-void' : 'text-dim hover:text-paper'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="relative">
          {!image ? (
            <label
              className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-4 border border-dashed bg-void-2 text-center transition-colors ${
                dragging ? 'border-acid bg-void' : 'border-rule-2 hover:border-dim'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <input ref={fileRef} type="file" accept="image/*" onChange={onInput} hidden />
              <Plus size={34} weight="bold" className="text-acid" />
              <span className="font-mono text-[0.95rem] uppercase tracking-[0.12em] text-paper">Upload a photo</span>
              <span className="font-mono text-[0.72rem] text-faint">Tap to choose, or drag an image here</span>
            </label>
          ) : (
            <div className="relative overflow-hidden border border-rule bg-void-2">
              {mode === 'coverup' && !shown ? (
                <div className="relative">
                  <img ref={imgRef} src={image} alt="Your tattoo" onLoad={initCanvas} draggable={false} className="w-full select-none" />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
                    onMouseDown={(e) => startPaint(e.clientX, e.clientY)}
                    onMouseMove={(e) => drawingRef.current && paint(e.clientX, e.clientY)}
                    onMouseUp={endPaint}
                    onMouseLeave={endPaint}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      const t = e.touches[0];
                      startPaint(t.clientX, t.clientY);
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      if (drawingRef.current) {
                        const t = e.touches[0];
                        paint(t.clientX, t.clientY);
                      }
                    }}
                    onTouchEnd={endPaint}
                  />
                  <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-void/75 py-2 text-center font-mono text-[0.68rem] uppercase tracking-[0.14em] text-acid">
                    Paint over the tattoo you want to cover
                  </p>
                </div>
              ) : shown ? (
                <CompareView before={image} after={shown} slider={slider} setSlider={setSlider} isStencil={!!stencil} />
              ) : (
                <img src={image} alt="Your photo" draggable={false} className="w-full select-none" />
              )}

              {busy ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-void/80"
                >
                  <div className="h-2 w-2/3 max-w-[240px] animate-pulse bg-rule-2" />
                  <div className="h-2 w-1/2 max-w-[180px] animate-pulse bg-rule-2" />
                  <span className="font-mono text-[0.74rem] uppercase tracking-[0.16em] text-acid">{busyLabel}</span>
                </div>
              ) : null}
            </div>
          )}

          {image && mode === 'coverup' && !shown ? (
            <div className="mt-4 flex flex-wrap items-center gap-5">
              <label className="flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-faint">
                Brush
                <input type="range" min={12} max={80} value={brush} onChange={(e) => setBrush(Number(e.target.value))} className="accent-acid" aria-label="Brush size" />
              </label>
              <button className={textBtn} onClick={clearMask} disabled={!hasMask}>
                Clear
              </button>
              <button className={textBtn} onClick={() => fileRef.current?.click()}>
                Change photo
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={onInput} hidden />
            </div>
          ) : null}
        </div>

        <div className="border border-rule bg-void-2/50 p-5">
          <p className="mb-4 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-faint">// choose a style</p>
          <div className="grid max-h-[420px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-1">
            {CREATE_STYLES.map((s) => {
              const on = styleId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setStyleId(s.id)}
                  aria-pressed={on}
                  className={`border px-4 py-3 text-left transition-colors active:translate-y-px ${
                    on ? 'border-acid bg-void' : 'border-rule hover:border-dim'
                  }`}
                >
                  <span className={`block font-mono text-[0.84rem] uppercase tracking-[0.04em] ${on ? 'text-acid' : 'text-paper'}`}>
                    {s.name}
                  </span>
                  <span className="mt-0.5 block font-mono text-[0.7rem] text-faint">{s.blurb}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-6 border-l-2 border-acid pl-4 font-mono text-[0.85rem] text-paper">
          {error}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        {!shown ? (
          <button onClick={run} disabled={!image || busy} aria-busy={busy} className={`${actionBtn} border-acid text-acid hover:bg-acid hover:text-void`}>
            {busy ? 'Working' : mode === 'coverup' ? 'Generate cover-up' : 'Restyle photo'}
          </button>
        ) : (
          <>
            <button onClick={() => download(shown, stencil ? 'stencil' : 'restyle')} className={`${actionBtn} border-acid text-acid hover:bg-acid hover:text-void`}>
              Download
            </button>
            {!stencil ? (
              <button onClick={makeStencil} disabled={busy} aria-busy={busy} className={`${actionBtn} border-rule-2 text-paper hover:bg-paper hover:text-void`}>
                Make stencil
              </button>
            ) : null}
            <button onClick={() => { setResult(null); setStencil(null); }} disabled={busy} className={`${actionBtn} border-rule-2 text-paper hover:bg-paper hover:text-void`}>
              Try another style
            </button>
            <button className={textBtn} onClick={reset}>
              Start over
            </button>
          </>
        )}
        {image && !shown ? (
          <button className={textBtn} onClick={reset}>
            Start over
          </button>
        ) : null}
      </div>

      <p className="mt-7 max-w-[60ch] font-mono text-[0.74rem] leading-relaxed text-faint">
        Powered by Google Gemini. Your photo is sent for generation only and isn&apos;t stored.{' '}
        <a href="#book" className="text-paper underline decoration-rule-2 underline-offset-4 hover:text-acid hover:decoration-acid">
          Book it as a real tattoo.
        </a>
      </p>
    </section>
  );
}

function CompareView({
  before,
  after,
  slider,
  setSlider,
  isStencil,
}: {
  before: string;
  after: string;
  slider: number;
  setSlider: (v: number) => void;
  isStencil: boolean;
}) {
  return (
    <div className="relative select-none">
      <img src={after} alt={isStencil ? 'Stencil result' : 'Restyled result'} draggable={false} className="block w-full" />
      <img
        src={before}
        alt="Original"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}
      />
      <span className="pointer-events-none absolute inset-y-0 w-px bg-acid" style={{ left: `${slider}%` }} aria-hidden="true" />
      <input
        type="range"
        min={0}
        max={100}
        value={slider}
        onChange={(e) => setSlider(Number(e.target.value))}
        aria-label="Compare original and result"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
