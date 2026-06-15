import React, { useCallback, useMemo } from 'react'
import SectionHeader from './SectionHeader.jsx'
import PhotoCarousel from './PhotoCarousel.jsx'
import CircularGallery from './CircularGallery.jsx'
import { WORK_CATEGORIES, PLATES, toRoman } from '../data.js'

export default function Work({ onOpen }) {
  // Every plate, in category order, fed to the curved WebGL ring. The `index`
  // maps each card back to its place in PLATES so a click opens the lightbox.
  const galleryItems = useMemo(
    () => PLATES.map((p, i) => ({ image: p.src, text: p.title, index: i })),
    [],
  )

  // Stable identity so opening/closing the lightbox (which re-renders Work)
  // doesn't change CircularGallery's props and tear down the WebGL scene.
  const openPlate = useCallback((i) => onOpen(PLATES, i), [onOpen])

  return (
    <section className="section work" id="work">
      <SectionHeader
        numeral="I"
        title="Selected Work"
        note="Healed pieces, photographed in daylight — every plate one of one. Three curated sets; drag or swipe through each."
      />

      <div className="work-showcase" data-reveal aria-hidden="true">
        <div className="work-showcase-stage">
          <CircularGallery
            items={galleryItems}
            bend={2.6}
            textColor="#d4bc9a"
            borderRadius={0.04}
            font='500 30px "Cormorant Garamond"'
            fontUrl="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&display=swap"
            scrollSpeed={2}
            scrollEase={0.045}
            autoScroll={0.018}
            onItemClick={openPlate}
          />
        </div>
        <p className="work-showcase-hint">Drag to turn the ring · tap a plate to open it</p>
      </div>

      {WORK_CATEGORIES.map((cat, c) => (
        <PhotoCarousel
          key={cat.key}
          numeral={toRoman(c + 1)}
          name={cat.name}
          note={cat.note}
          photos={cat.plates}
          onOpen={onOpen}
        />
      ))}

      <p className="work-more" data-reveal>
        The full portfolio lives on{' '}
        <a href="https://www.instagram.com/hintertattoo/" target="_blank" rel="noreferrer">
          @hintertattoo
        </a>{' '}
        — 1,200 pieces and counting.
      </p>
    </section>
  )
}
