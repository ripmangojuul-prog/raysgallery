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

// ——— Selected work · three curated carousels ———
// Healed photographs from @hintertattoo, converted to web JPGs in /public/work/photos.
// Curated and grouped into three balanced sets of five.
export const WORK_CATEGORIES = [
  {
    key: 'portraiture',
    name: 'Figures & Faces',
    note: 'Black & grey fineline portraiture — film stills, dancers, and androids in smooth greywash, with one face set into a surreal op-art spade.',
    plates: [
      {
        src: '/work/photos/photo-09.jpg',
        title: 'Faith, Inverted',
        desc: 'A pole dancer in fishnets suspended from a cross-shaped pole — realist figure work with a surreal twist.',
        meta: 'Black & grey · calf',
        alt: 'Black and grey fineline tattoo of a pole dancer in fishnets hanging upside down on a cross-shaped pole, on a calf',
      },
      {
        src: '/work/photos/photo-07.jpg',
        title: 'The Gold Watch',
        desc: 'A reclining film still rendered in smooth black & grey wash, revolver in hand.',
        meta: 'Black & grey · upper arm',
        alt: 'Black and grey fineline tattoo of a reclining woman from a film scene holding a revolver, on an upper arm',
      },
      {
        src: '/work/photos/photo-16.jpg',
        title: 'Queen of Spades',
        desc: 'A portrait in sunglasses set inside a playing-card spade over a swirling op-art ground.',
        meta: 'Black & grey · shoulder',
        alt: "Black and grey fineline tattoo on a shoulder of a woman's face in sunglasses set inside a playing-card spade with a swirling op-art background",
      },
      {
        src: '/work/photos/photo-13.jpg',
        title: 'Frequency',
        desc: 'A kneeling android in headphones beside a boombox, music notes drifting up in fineline.',
        meta: 'Black & grey · upper arm',
        alt: 'Black and grey fineline tattoo of a kneeling robotic android woman in headphones beside a boombox with music notes, on an upper arm',
      },
      {
        src: '/work/photos/photo-02.jpg',
        title: 'Reclined',
        desc: 'A reclining figure from a film scene, built in layered grey wash.',
        meta: 'Black & grey · upper arm',
        alt: 'Fineline black and grey realism tattoo of a reclining woman from a film scene on an upper arm',
      },
    ],
  },
  {
    key: 'still-life',
    name: 'Objects & Still Life',
    note: 'Micro-realism in black & grey — glass, metal, and ornament rendered with crisp reflections and fine stippling. One piece carries a single pop of red.',
    plates: [
      {
        src: '/work/photos/photo-11.jpg',
        title: 'Atomizer',
        desc: 'A vintage cut-glass perfume atomizer, every reflection rendered in smooth wash.',
        meta: 'Black & grey · forearm',
        alt: 'Black and grey realism forearm tattoo of a vintage cut-glass perfume atomizer bottle with mesh squeeze bulb',
      },
      {
        src: '/work/photos/photo-06.jpg',
        title: 'Crocodile Heels',
        desc: 'A pair of stilettos rendered as crocodile heads — studded texture pulled in fine dotwork.',
        meta: 'Black & grey · thigh',
        alt: 'Black and grey thigh tattoo of two stiletto high heels rendered as crocodile heads with open jaws and studded textured surfaces',
      },
      {
        src: '/work/photos/photo-01.jpg',
        title: 'Cherry Bowl',
        desc: 'A checkerboard footed bowl of cherries — black & grey, lifted by a single red accent.',
        meta: 'Black & grey + red · thigh',
        alt: 'Black and grey tattoo of a checkerboard footed bowl filled with bright red cherries, inked on a thigh',
      },
      {
        src: '/work/photos/photo-10.jpg',
        title: 'Urn & Daffodil',
        desc: 'A neoclassical urn in tight micro-realism, topped by a loosely sketched daffodil.',
        meta: 'Black & grey · calf',
        alt: 'Black and grey fineline calf tattoo of an ornate neoclassical urn with figural relief, topped by a loosely sketched daffodil and leaves',
      },
      {
        src: '/work/photos/photo-03.jpg',
        title: 'Bite the Bullet',
        desc: 'Parted lips and teeth around a metallic bullet — realism with a hard reflective highlight.',
        meta: 'Black & grey · forearm',
        alt: 'Black and grey realism tattoo of parted lips and teeth biting a bullet, inked on a forearm',
      },
    ],
  },
  {
    key: 'chrome-surreal',
    name: 'Chrome & the Uncanny',
    note: 'Liquid-metal chrome and dreamlike surrealism — mirrored highlights and morphing forms. Mostly black & grey, with a faint colour accent in the 8-ball.',
    plates: [
      {
        src: '/work/photos/photo-15.jpg',
        title: 'Three Faces',
        desc: 'A jack-in-the-box, an eerie three-faced doll rising on a coiled spring above a starred box.',
        meta: 'Black & grey · inner arm',
        alt: 'Black and grey fineline tattoo on inner arm of a jack-in-the-box with a three-faced doll head rising on a spring and a star on the box',
      },
      {
        src: '/work/photos/photo-17.jpg',
        title: 'Silver Bullet',
        desc: 'A mouth holding a chrome bullet between the teeth — hard mirrored highlights on liquid metal.',
        meta: 'Black & grey · forearm',
        alt: 'Black and grey realism tattoo on a forearm of a mouth holding a shiny metallic chrome bullet between the teeth',
      },
      {
        src: '/work/photos/photo-08.jpg',
        title: 'Jack',
        desc: 'Three doll faces springing from the box in a single motion-blurred breath.',
        meta: 'Black & grey · forearm',
        alt: 'Black and grey fineline tattoo of a jack-in-the-box with three doll faces on a spring, a star, and a crank handle, on a forearm',
      },
      {
        src: '/work/photos/photo-18.jpg',
        title: 'Eye of the Sprig',
        desc: 'A botanical sprig whose leaves morph into a human eye and lips — quiet surrealism.',
        meta: 'Black & grey · arm',
        alt: 'Black and grey fineline tattoo on the back of an arm of a plant sprig whose leaves transform into a human eye and lips',
      },
      {
        src: '/work/photos/photo-05.jpg',
        title: 'You Wish',
        desc: 'A Magic 8-ball with a glossy mirrored surface and a hard star highlight; the answer window glows.',
        meta: 'Black & grey + blue · upper arm',
        alt: 'Black and grey upper-arm tattoo of a Magic 8-ball with a glossy reflective surface, sparkle highlight, and blue triangle answer window reading YOU WISH',
      },
    ],
  },
]

// Flat list (all plates, in category order) — used by the lightbox.
export const PLATES = WORK_CATEGORIES.flatMap((c) => c.plates)

// ——— Scroll reel · cinematic video panels ———
export const REEL = [
  {
    src: '/video/reel-01.mp4',
    kicker: 'In the chair',
    title: 'Single needle,\nsteady hand',
    body: 'Every line pulled by hand — no stencil shortcuts, no filler.',
  },
  {
    src: '/video/reel-02.mp4',
    kicker: 'Phoenix, Arizona',
    title: 'Fineline\nsurrealism',
    body: 'Black & grey dreamwork, engraved into skin one session at a time.',
  },
  {
    src: '/video/reel-03.mp4',
    kicker: 'The studio',
    title: 'Private,\nby appointment',
    body: 'A quiet room, a long table, and all the time the piece needs.',
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
