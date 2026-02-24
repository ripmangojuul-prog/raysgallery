import React, { useEffect } from 'react'
import { useStore } from './store.js'
import { ARTWORKS } from './artworks.js'

export function UI() {
  const artInRange = useStore((s) => s.artInRange)
  const lightboxArt = useStore((s) => s.lightboxArt)
  const isMenuOpen = useStore((s) => s.isMenuOpen)
  const openLightbox = useStore((s) => s.openLightbox)
  const closeLightbox = useStore((s) => s.closeLightbox)
  const toggleMenu = useStore((s) => s.toggleMenu)
  const closeAll = useStore((s) => s.closeAll)

  // Keyboard handler — reads latest state via getState() to avoid stale closures
  useEffect(() => {
    const handleKeyDown = (e) => {
      const s = useStore.getState()

      if (e.code === 'Space') {
        e.preventDefault()
        if (s.artInRange && !s.lightboxArt && !s.isMenuOpen) {
          s.openLightbox(s.artInRange)
        }
      }
      if (e.code === 'Escape') {
        s.closeAll()
      }
      if (e.code === 'KeyM' && !s.lightboxArt) {
        s.toggleMenu()
      }
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        if (s.artInRange && !s.lightboxArt && !s.isMenuOpen) {
          s.openLightbox(s.artInRange)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const hasOverlay = !!lightboxArt || isMenuOpen

  return (
    <div className="ui-container">
      {/* ---- HUD: Title ---- */}
      <div
        className="hud-top-left"
        style={{ opacity: hasOverlay ? 0 : 1, transition: 'opacity 0.4s ease' }}
      >
        <h1>HINTER TATTOO</h1>
        <p className="subtitle">Dark surrealism &middot; Fine-line realism</p>
      </div>

      {/* ---- HUD: Menu Button ---- */}
      <div className="hud-top-right">
        <button className="btn-primary" onClick={toggleMenu}>
          {isMenuOpen ? 'CLOSE' : 'MENU'}
        </button>
      </div>

      {/* ---- HUD: Controls ---- */}
      <div
        className="hud-bottom"
        style={{ opacity: hasOverlay ? 0 : 1, transition: 'opacity 0.4s ease' }}
      >
        <span className="control-hint">
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Move
          <span className="control-sep">&middot;</span>
          <kbd>M</kbd> Menu
          {artInRange && !hasOverlay && (
            <>
              <span className="control-sep">&middot;</span>
              <span className="highlight-text">
                <kbd>SPACE</kbd> Inspect
              </span>
            </>
          )}
          <span className="control-sep">&middot;</span>
          <kbd>ESC</kbd> Close
        </span>
      </div>

      {/* ---- Proximity Prompt ---- */}
      {artInRange && !lightboxArt && !isMenuOpen && (
        <div className="proximity-prompt">
          <kbd>SPACE</kbd>
          &ensp;See details
        </div>
      )}

      {/* ---- Lightbox ---- */}
      {lightboxArt && (
        <div className="overlay-backdrop lightbox-backdrop" onClick={closeLightbox}>
          <button className="btn-primary overlay-close" onClick={closeLightbox}>
            CLOSE&ensp;<kbd>ESC</kbd>
          </button>
          <img
            src={lightboxArt.url}
            alt={lightboxArt.title}
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          <h2 className="lightbox-title">{lightboxArt.title}</h2>
        </div>
      )}

      {/* ---- Menu Overlay (Masonry Grid) ---- */}
      {isMenuOpen && !lightboxArt && (
        <div className="overlay-backdrop menu-container">
          <button className="btn-primary overlay-close" onClick={toggleMenu}>
            CLOSE&ensp;<kbd>ESC</kbd>
          </button>
          <h2 className="menu-heading">Portfolio</h2>
          <div className="masonry-grid">
            {ARTWORKS.map((art) => (
              <div
                className="portfolio-item"
                key={art.id}
                onClick={() => openLightbox(art)}
              >
                <img src={art.url} alt={art.title} loading="lazy" />
                <div className="portfolio-item-overlay">
                  <span className="portfolio-item-title">{art.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
