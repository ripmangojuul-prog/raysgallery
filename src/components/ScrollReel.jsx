import React, { useEffect, useRef } from 'react'
import { REEL } from '../data.js'
import Glint from './Glint.jsx'

// Bangbang-style scrolling video reel: full-viewport panels stack as you scroll,
// each with a pinned, autoplaying background video. Videos are loaded and played
// only while in view to keep the page light.
export default function ScrollReel() {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const videos = root.querySelectorAll('video[data-src]')

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const v = e.target
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
      { threshold: 0.35 },
    )
    videos.forEach((v) => io.observe(v))
    return () => io.disconnect()
  }, [])

  return (
    <section className="reel" id="reel" ref={ref} aria-label="Studio reel">
      {REEL.map((r, i) => (
        <article className="reel-panel" key={r.src}>
          <video
            className="reel-video"
            data-src={r.src}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
          />
          <div className="reel-scrim" aria-hidden="true" />
          <div className="reel-content">
            <p className="reel-kicker">
              <Glint size={8} /> {r.kicker} <Glint size={8} />
            </p>
            <h3 className="reel-title">
              {r.title.split('\n').map((line, j) => (
                <span key={j} className="reel-title-line">{line}</span>
              ))}
            </h3>
            <p className="reel-body">{r.body}</p>
            <span className="reel-index" aria-hidden="true">
              {String(i + 1).padStart(2, '0')} / {String(REEL.length).padStart(2, '0')}
            </span>
          </div>
        </article>
      ))}
    </section>
  )
}
