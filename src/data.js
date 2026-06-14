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

// ——— Selected work · five curated carousels ———
// Healed photographs from @hintertattoo, extracted and converted to web JPGs in
// /public/work/photos. Curated from ~270 candidates into five balanced themed sets.
export const WORK_CATEGORIES = [
  {
    key: "surreal-uncanny",
    name: "Surreal & Uncanny",
    note: "Dark-surrealist set pieces where the everyday slips its skin — melting faces, glass coffins, and screens that watch back.",
    plates: [
      {
        src: "/work/photos/ig-095.jpg",
        title: "The Glass Table",
        desc: "Surreal latex-clad woman crawling as a glass coffee table",
        meta: "Black & grey · calf",
        alt: "Black and grey surreal tattoo of a latex-clad woman on hands and knees forming a glass table, on a calf",
      },
      {
        src: "/work/photos/ig-036.jpg",
        title: "Shatter",
        desc: "Shattered glass-like female face with dripping melting fragments",
        meta: "Black & grey · thigh",
        alt: "Black and grey surreal realism tattoo of a shattered melting glass female face with drips on thigh",
      },
      {
        src: "/work/photos/ig-130.jpg",
        title: "The Settee",
        desc: "Surreal antique settee with sardines forming a face",
        meta: "Black & grey · forearm",
        alt: "Black and grey forearm tattoo of an ornate antique settee with two sardines arranged to form an uncanny face",
      },
      {
        src: "/work/photos/ig-088.jpg",
        title: "On Ice",
        desc: "Woman's face frozen inside a realistic ice cube",
        meta: "Black & grey · forearm",
        alt: "Black and grey realism tattoo of a woman's face frozen inside an ice cube on forearm",
      },
      {
        src: "/work/photos/ig-136.jpg",
        title: "Dead Channel",
        desc: "Stacked vintage CRT televisions each showing a dark surreal image including a snarling fanged dog",
        meta: "Black & grey · upper arm",
        alt: "Black and grey upper-arm tattoo of three stacked vintage CRT televisions displaying dark surreal imagery",
      },
      {
        src: "/work/photos/ig-231.jpg",
        title: "Unzipped",
        desc: "Realistic skull emerging from a ripped-open zipper on the arm",
        meta: "Black & grey · upper arm",
        alt: "Black and grey realism tattoo of a skeletal figure peeling open a zipper in the skin on a person's upper arm",
      },
      {
        src: "/work/photos/ig-118.jpg",
        title: "The Morning Edition",
        desc: "Seated figure reading a burning newspaper on a stool",
        meta: "Black & grey · forearm",
        alt: "Black and grey fineline tattoo of a seated person reading a burning newspaper on a stool, on a forearm",
      },
    ],
  },
  {
    key: "figures-faces",
    name: "Figures & Faces",
    note: "Black & grey portraiture and the human form — cinematic homage and surreal double-exposure.",
    plates: [
      {
        src: "/work/photos/ig-200.jpg",
        title: "Chainmail",
        desc: "Chainmail-hooded medieval woman portrait with surreal double-exposure torso",
        meta: "Black & grey · forearm",
        alt: "Black and grey forearm tattoo of a medieval woman in a chainmail coif with a surreal double-exposure figure across her chest",
      },
      {
        src: "/work/photos/ig-138.jpg",
        title: "Sunday Best",
        desc: "Vintage suited man in a fedora walking with a flower, with fineline doodled flowers and grass",
        meta: "Black & grey · forearm",
        alt: "Black and grey forearm tattoo of a vintage suited man in a fedora walking among fineline doodled flowers",
      },
      {
        src: "/work/photos/ig-176.jpg",
        title: "Pierrot",
        desc: "Pierrot clown ballerina dancing on a crescent moon",
        meta: "Black & grey · arm",
        alt: "Fine-line black and grey tattoo of a Pierrot clown ballerina posed on a stippled crescent moon",
      },
      {
        src: "/work/photos/ig-240.jpg",
        title: "Winged Veil",
        desc: "Two women portrait with dragonfly and moth obscuring faces, surreal black and grey",
        meta: "Black & grey · arm",
        alt: "Surreal black and grey portrait tattoo of two women with a dragonfly and moth covering their faces",
      },
      {
        src: "/work/photos/ig-213.jpg",
        title: "The Kiss",
        desc: "Two embracing classical figures kissing inside an ornate baroque frame with an angel wing",
        meta: "Black & grey · arm",
        alt: "Black and grey fineline tattoo of two classical lovers kissing within an ornate oval frame with an angel wing",
      },
      {
        src: "/work/photos/ig-129.jpg",
        title: "Pin-Up",
        desc: "Fineline pin-up figure in fetish corset and heels",
        meta: "Black & grey · arm",
        alt: "Black and grey fineline arm tattoo of a kneeling pin-up woman in a studded corset and high heels",
      },
      {
        src: "/work/photos/ig-034.jpg",
        title: "Black Swan",
        desc: "Two vintage televisions showing Black Swan film portraits of a ballerina",
        meta: "Black & grey · forearm",
        alt: "Black and grey realism tattoo of two retro televisions displaying Black Swan ballerina portraits on forearm",
      },
    ],
  },
  {
    key: "objects-stilllife",
    name: "Objects & Still Life",
    note: "Hyperreal everyday objects rendered with cold precision and a wink of menace.",
    plates: [
      {
        src: "/work/photos/ig-105.jpg",
        title: "S E X",
        desc: "Glossy black handbag with 'SEX' lettering",
        meta: "Black & grey · forearm",
        alt: "Black and grey realism tattoo of a glossy patent handbag reading SEX on a forearm",
      },
      {
        src: "/work/photos/ig-067.jpg",
        title: "Wrong Number",
        desc: "Surreal vintage rotary telephone with a conch shell handset and an eye in the dial",
        meta: "Black & grey · leg",
        alt: "Black and grey surreal tattoo of a vintage rotary phone with a conch shell receiver and an eye in the dial, on a leg",
      },
      {
        src: "/work/photos/ig-143.jpg",
        title: "Be Kind, Rewind",
        desc: "VHS tape labeled The Shining",
        meta: "Black & grey · wrist",
        alt: "Black and grey tattoo of a VHS tape of The Shining with a 'please remember to rewind' label, on a wrist",
      },
      {
        src: "/work/photos/ig-238.jpg",
        title: "Instant",
        desc: "Vintage Polaroid Sun 600 camera ejecting a photo",
        meta: "Black & grey · arm",
        alt: "Detailed black and grey tattoo of a vintage Polaroid Sun 600 camera printing a photo",
      },
      {
        src: "/work/photos/ig-211.jpg",
        title: "The Urn",
        desc: "Classical urn with serpent handles depicting a reclining nude figure",
        meta: "Black & grey · calf",
        alt: "Fine-line black and grey calf tattoo of a classical urn with snake handles depicting a reclining nude figure",
      },
      {
        src: "/work/photos/ig-244.jpg",
        title: "Nightcap",
        desc: "Crystal goblet of dark wine with reflected candle",
        meta: "Black & grey · arm",
        alt: "Black and grey realism tattoo of an ornate crystal goblet filled with dark wine on an arm",
      },
      {
        src: "/work/photos/ig-209.jpg",
        title: "Last Call",
        desc: "Realistic martini glass mid-splash with a disco ball garnish",
        meta: "Black & grey · forearm",
        alt: "Black and grey forearm tattoo of a martini glass splashing, garnished with a tiny mirrored disco ball",
      },
    ],
  },
  {
    key: "architecture-ornament",
    name: "Architecture & Ornament",
    note: "Gothic stone, sacred geometry, and devotional metalwork — the reverent end of the dark register.",
    plates: [
      {
        src: "/work/photos/ig-243.jpg",
        title: "Saint Michael",
        desc: "Saint Michael archangel slaying a demon",
        meta: "Black & grey · forearm",
        alt: "Black and grey realism tattoo of armored archangel Saint Michael with spear standing over a fallen demon on a forearm",
      },
      {
        src: "/work/photos/ig-201.jpg",
        title: "The Last Supper",
        desc: "Skeletal Last Supper reinterpretation",
        meta: "Black & grey · inner forearm",
        alt: "Black and grey inner-forearm tattoo reimagining the Last Supper with skeletons seated around Christ at a table",
      },
      {
        src: "/work/photos/ig-234.jpg",
        title: "Sanctuary",
        desc: "Angel embracing a figure within a Gothic cathedral window with script",
        meta: "Black & grey · arm",
        alt: "Black and grey tattoo of an angel embracing a robed figure inside a Gothic cathedral arch with rose window and script lettering",
      },
      {
        src: "/work/photos/ig-167.jpg",
        title: "The Cathedral",
        desc: "Gothic cathedral with tall spire",
        meta: "Black & grey · leg",
        alt: "Detailed black and grey leg tattoo of a gothic cathedral with a tall spire",
      },
      {
        src: "/work/photos/ig-047.jpg",
        title: "The Mourner",
        desc: "Winged angel statue leaning on a classical column",
        meta: "Black & grey · calf",
        alt: "Black and grey realism tattoo of a winged angel statue resting on an Ionic column on a calf",
      },
      {
        src: "/work/photos/ig-115.jpg",
        title: "Love, Daddy",
        desc: "Cherub angel holding a flintlock pistol with a 'Love Daddy' banner",
        meta: "Black & grey · upper arm",
        alt: "Black and grey fineline tattoo of a winged cherub aiming a flintlock pistol above a 'Love Daddy' banner, on an upper arm",
      },
      {
        src: "/work/photos/ig-108.jpg",
        title: "Bow & Cross",
        desc: "Glossy ribbon bow with gothic cross pendant",
        meta: "Black & grey · arm",
        alt: "Black and grey realism tattoo of a shiny bow with dangling gothic cross charm on an arm",
      },
    ],
  },
  {
    key: "chrome-flora-fauna",
    name: "Chrome, Flora & Fauna",
    note: "Liquid-metal surfaces and the natural world, reimagined in mirror-bright black & grey.",
    plates: [
      {
        src: "/work/photos/ig-251.jpg",
        title: "Mirrorball",
        desc: "Chrome robotic figure kneeling with a disco-ball head",
        meta: "Black & grey · arm",
        alt: "Black and grey surreal tattoo of a kneeling chrome android figure with a glittering disco-ball head",
      },
      {
        src: "/work/photos/ig-082.jpg",
        title: "Mirror, Mirror",
        desc: "Butterfly with two women's faces in its wings",
        meta: "Black & grey · hand",
        alt: "Black and grey hand tattoo of a butterfly whose wings reveal two mirrored portraits of a woman's face",
      },
      {
        src: "/work/photos/ig-194.jpg",
        title: "Lovebirds",
        desc: "Two lovebirds pulling the pin from a hand grenade",
        meta: "Black & grey · forearm",
        alt: "Black and grey forearm tattoo of two lovebirds pulling the pin from a chrome hand grenade",
      },
      {
        src: "/work/photos/ig-228.jpg",
        title: "Heartbone",
        desc: "Heart-shaped animal skull formed from two fused skulls",
        meta: "Black & grey · forearm",
        alt: "Black and grey forearm tattoo of an animal skull arranged into a heart shape with smooth shading",
      },
      {
        src: "/work/photos/ig-216.jpg",
        title: "Eagle & Serpent",
        desc: "Eagle and snake fineline tattoo on the hand and thumb",
        meta: "Black & grey · hand",
        alt: "Black and grey fineline tattoo of an eagle attacking a snake spanning the back of a hand and thumb",
      },
      {
        src: "/work/photos/ig-185.jpg",
        title: "Serpent Urn",
        desc: "classical urn with snakes and a flower",
        meta: "Black & grey · calf",
        alt: "Black and grey tattoo of an ornate classical urn entwined with snakes, topped by a flower, on the calf",
      },
      {
        src: "/work/photos/ig-180.jpg",
        title: "Chrome Wing",
        desc: "Chrome metallic butterfly with a knife on the ankle",
        meta: "Black & grey · ankle",
        alt: "Black and grey tattoo of a polished chrome butterfly and a knife on the ankle, dark lighting",
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
