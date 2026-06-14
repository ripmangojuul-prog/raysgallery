import React, { useEffect, useRef } from 'react'
import Glint from './Glint.jsx'

// One full-bleed flowing video band. Several of these are spaced evenly down the
// page so the studio footage threads through the content rather than clumping.
// The video lazy-loads and plays only while in view, then pauses to save battery.
export default function ReelBreak({ reel, index, total }) {
  const ref = useRef(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (!v.src && v.dataset.src) v.src = v.dataset.src
            if (!reduce) {
              const p = v.play()
              if (p && p.catch) p.catch(() => {})
            }
          } else if (!v.paused) {
            v.pause()
          }
        })
      },
      { threshold: 0.25 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  return (
    <section className="reel-break" aria-label={`Studio reel ${index + 1} of ${total}`}>
      <video
        ref={ref}
        className="reel-break-video"
        data-src={reel.src}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
      />
      <div className="reel-break-scrim" aria-hidden="true" />
      <div className="reel-break-content" data-reveal>
        <p className="reel-break-kicker">
          <Glint size={8} /> {reel.kicker} <Glint size={8} />
        </p>
        <h3 className="reel-break-title">
          {reel.title.split('\n').map((line, j) => (
            <span key={j} className="reel-break-line">{line}</span>
          ))}
        </h3>
        <p className="reel-break-body">{reel.body}</p>
        <span className="reel-break-index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
    </section>
  )
}
