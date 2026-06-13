// ——— HINTER MASKEN · site content ———

export const LINKS = {
  instagram: 'https://www.instagram.com/hintertattoo/',
  booking: 'https://www.instagram.com/hintertattobooking/',
  altars: 'https://www.instagram.com/meetusatthealtars/',
  voyagela: 'https://voyagela.com/interview/meet-rachel-catchings-hinter-masken-traveling-artist/',
  interview: 'https://www.stevewilkos1.com/blog/hinter-masken-interview',
}

export function toRoman(n) {
  const map = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  let out = ''
  for (const [v, s] of map) while (n >= v) { out += s; n -= v }
  return out
}

// ——— Selected work · healed pieces ———
export const PLATES = [
  {
    src: '/work/plate-01.png',
    title: 'The Morning Edition',
    desc: 'A figure on a barstool, lost behind a burning broadsheet. Smoke rendered in single-needle whip shading; newsprint set in miniature.',
    meta: 'Black & grey · inner forearm',
    alt: 'Fineline black and grey tattoo of a woman seated on a barstool, her upper body hidden behind a burning newspaper',
  },
  {
    src: '/work/plate-02.png',
    title: 'Heart, Pierced',
    desc: 'An engraved foil heart run through with an arrow, its ribbon trailing toward the ankle. Crosshatch over smooth wash — etching on skin.',
    meta: 'Black & grey · lower leg',
    alt: 'Black and grey tattoo of a crumpled metallic heart balloon pierced by an arrow, with a trailing string',
  },
  {
    src: '/work/plate-03.png',
    title: 'Hypnose',
    desc: 'Cuffed heels descend through an op-art spiral, contained inside a five-point star. The pattern bends; the hardware shines.',
    meta: 'Black & grey · upper arm',
    alt: 'Black and grey tattoo of high heels with handcuffs inside a star filled with a hypnotic spiral pattern',
  },
]

// ——— Flash archive · available sheets ———
const SHEET_GROUPS = { g01: 19, g02: 4, g04: 3, g06: 4, g07: 4, g08: 4, g09: 4, g10: 4, g11: 4, g12: 1 }

export const FLASH = Object.entries(SHEET_GROUPS)
  .flatMap(([g, n]) => Array.from({ length: n }, (_, i) => `${g}_${String(i + 1).padStart(2, '0')}`))
  .map((id, i) => ({
    src: `/flash/${id}.jpg`,
    title: `Flash № ${toRoman(i + 1)}`,
    desc: 'Available to claim — one wearer per design.',
    meta: 'Available flash · black & grey',
    alt: `Flash sheet ${i + 1} — fineline black and grey surrealist tattoo designs`,
  }))

// ——— Press & collaborations ———
export const PRESS = [
  {
    outlet: 'VoyageLA',
    piece: 'Meet Rachel Catchings — Hinter Masken, Traveling Artist',
    note: 'Interview',
    href: LINKS.voyagela,
  },
  {
    outlet: 'The Steve Wilkos Blog',
    piece: 'Hinter Masken — In Conversation',
    note: 'Interview',
    href: LINKS.interview,
  },
  {
    outlet: 'Inked Magazine',
    piece: 'Featured collaboration',
    note: 'Collaboration',
    href: LINKS.instagram,
  },
  {
    outlet: 'Gretsch Guitars',
    piece: 'Artist collaboration',
    note: 'Collaboration',
    href: LINKS.instagram,
  },
]

// ——— FAQ ———
export const FAQ = [
  {
    q: 'How do I book?',
    a: 'All booking runs through Instagram. Send a direct message to @hintertattobooking with your idea, preferred placement, approximate size, and any reference images. Custom projects begin with a consultation; flash from the archive can be claimed directly — first come, first kept.',
  },
  {
    q: 'Where is the studio?',
    a: 'A private, appointment-only studio in Phoenix, Arizona. The exact address is shared once your appointment is confirmed. Guest spots and travel dates are announced on Instagram.',
  },
  {
    q: 'Do you take walk-ins?',
    a: 'No. The studio is private and every session is reserved in advance. This keeps the room quiet, unhurried, and entirely yours for the day.',
  },
  {
    q: 'Is a deposit required?',
    a: 'Yes — a non-refundable deposit secures your date and is deducted from the final price of the tattoo. Pricing depends on size, placement, and detail, and is quoted during booking. Rescheduling with fair notice moves your deposit with you.',
  },
  {
    q: 'What do you specialize in?',
    a: 'Fineline surrealism in black & grey — engraving-style linework, smooth wash shading, and high-contrast chrome and liquid effects. Occasionally a single muted accent color where a piece calls for it. If you want bold traditional, neon color, or script, another artist will serve you better.',
  },
  {
    q: 'How old do I need to be?',
    a: 'Eighteen or older, with a valid government-issued photo ID — no exceptions, even with parental consent.',
  },
  {
    q: 'How should I prepare for my session?',
    a: 'Sleep well, eat a real meal, and hydrate the day before and the day of. Moisturize the area for a few days ahead, skip alcohol for 24 hours, and wear comfortable clothing that exposes the placement. Bring water, snacks, and headphones if you like.',
  },
  {
    q: 'What about healing and touch-ups?',
    a: 'You leave with written aftercare instructions — follow them and the piece will settle the way it was designed to, since every tattoo is drawn with healing and ageing in mind. If anything needs attention once fully healed, reach out through booking.',
  },
]
