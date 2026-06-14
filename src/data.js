// ——— HINTER TATTOO · site content ———

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
    piece: 'Meet Ray — Hinter Tattoo, Traveling Artist',
    note: 'Interview',
    href: LINKS.voyagela,
  },
  {
    outlet: 'The Steve Wilkos Blog',
    piece: 'Hinter Tattoo — In Conversation',
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
    q: 'How do I book with you?',
    a: 'Through my website, which has my booking form and all of my available flash and custom options. My email is monitored daily and is the fastest way to reach me: rscatchings@gmail.com.',
  },
  {
    q: 'Once I’m given a date, how long do I have to pay the deposit?',
    a: 'After you submit a booking request, we’ll email you a date and time that fits your schedule. You then have 48 hours to send a deposit to hold the spot, or it will be offered to someone else.',
  },
  {
    q: 'What form of payment do you take?',
    a: 'Cash. I’ll accept partial payments via Zelle, Venmo, or Cash App if the session runs longer than the expected length of the tattoo.',
  },
  {
    q: 'What do your tattoos cost?',
    a: 'I charge $250 per hour, and most pieces run 2–4 hours — it all depends on complexity, placement, and budget. If that’s out of budget, please don’t haggle; but do reach out, because you’d be surprised how gracious most tattooers are.',
  },
  {
    q: 'What if I’m on a budget?',
    a: 'We’re happy to work with you over email to find something that captures what you want while respecting your budget.',
  },
  {
    q: 'Do you charge for custom drawings?',
    a: 'Yes. When designing a custom piece, I work with you in person to create something tailored specifically to your vision. The process often involves multiple revisions and takes real time to get every detail right. Custom drawings start at $50.',
  },
  {
    q: 'Where are you located?',
    a: 'I’m based out of Phoenix, Arizona — that’s where the studio is, too.',
  },
  {
    q: 'How should I prepare for my appointment?',
    a: 'Bring cash and a valid government-issued ID. Eat beforehand and be fully hydrated, and don’t drink alcohol the night before or the day of. Wear comfortable clothing that allows access to the area being tattooed. You’re welcome to bring one guest, and please don’t arrive more than 10 minutes early or 20 minutes late.',
  },
  {
    q: 'How much time should I set aside?',
    a: 'I’d highly suggest booking on a day you have nothing else going on. My palm-sized tattoos have taken anywhere from 1 hour to 10, depending on complexity, placement, and budget.',
  },
  {
    q: 'How long will the tattoo take?',
    a: 'We’ll give you our best estimate over email when discussing the piece. Time shifts with size and placement, and keep in mind it’s always just an estimate — things can run over or under.',
  },
  {
    q: 'What if I’m short on time and squeezing this in?',
    a: 'Be very thorough over email so we can time it perfectly. I can also open my hours earlier or later to accommodate — we just need that communicated to us ahead of time.',
  },
  {
    q: 'How long does it take to hear back?',
    a: 'Emails are checked every day and we’re very fast to respond. That said, please don’t send crucial information the day before your appointment and expect us to see it in time. Our phone numbers are in our email signature — please call if it’s urgent.',
  },
  {
    q: 'Do you repeat flash?',
    a: 'Sort of! I like to add variations and color, and I’m happy to work with anybody on whatever they want specifically. I like to keep each piece a little unique.',
  },
  {
    q: 'Can I change my design?',
    a: 'Of course — just give us 24 hours’ notice by email.',
  },
  {
    q: 'What is your policy on being late?',
    a: 'There’s a 20-minute grace period — I know traffic and life happen. If you think you’ll be later than that, please reach out by email and let me know.',
  },
  {
    q: 'What is your cancellation policy?',
    a: 'All deposits are non-refundable — your space is reserved once a deposit is down, and refunds would make it impossible to keep a concrete schedule. I’ll allow rescheduling if you email me at least 48 hours in advance; each request is handled case by case. Depending on the situation, another $150 deposit may be required to reschedule, which goes toward the tattoo. Deposits keep the schedule in place — it’s for your security and mine. <3',
  },
  {
    q: 'What is your policy on deposits?',
    a: 'All deposits are non-refundable. I offer one complimentary reschedule; anything beyond that will require an additional deposit.',
  },
  {
    q: 'What is your policy on touch-ups?',
    a: 'Free touch-ups within one month. Anything beyond that is treated at half price. Please email us with the subject “Touch up” — and don’t use the link in bio.',
  },
]
