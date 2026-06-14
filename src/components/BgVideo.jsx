import React, { useEffect, useRef, useState } from 'react'

const SOURCES = ['/video/bg-3.mp4', '/video/bg-2.mp4', '/video/bg-1.mp4']

export default function BgVideo() {
  const [index, setIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const v = ref.current
    if (!v) return
    setReady(false)
    v.load()
    const p = v.play()
    if (p && p.catch) p.catch(() => {})
  }, [index])

  const next = () => setIndex((n) => (n + 1) % SOURCES.length)

  return (
    <div className="hero-video" aria-hidden="true">
      <video
        ref={ref}
        className={ready ? 'is-ready' : ''}
        src={SOURCES[index]}
        muted
        autoPlay
        playsInline
        preload="auto"
        onCanPlay={() => setReady(true)}
        onEnded={next}
        onError={next}
      />
    </div>
  )
}
