import React from 'react'
import SectionHeader from './SectionHeader.jsx'
import PhotoCarousel from './PhotoCarousel.jsx'
import { WORK_CATEGORIES, toRoman } from '../data.js'

export default function Work({ onOpen }) {
  return (
    <section className="section work" id="work">
      <SectionHeader
        numeral="I"
        title="Selected Work"
        note="Healed pieces, photographed in daylight — every plate one of one. Three curated sets; drag or swipe through each."
      />

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
