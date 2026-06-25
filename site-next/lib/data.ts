// HINTER TATTOO site content. Single source of truth for copy.
// Every user-visible string here is free of em-dash and en-dash by design
// (enforced by scripts/check-dashes.mjs). Curly apostrophes/quotes are kept.

export const LINKS = {
  instagram: 'https://www.instagram.com/hintertattoo/',
  // Booking is text-only. Keep phone and sms in sync with the FAQ.
  phone: '(480) 420-4319',
  sms: 'sms:+14804204319',
  altars: 'https://www.instagram.com/meetusatthealtars/',
  voyagela:
    'https://voyagela.com/interview/meet-rachel-catchings-hinter-masken-traveling-artist/',
};

export type Plate = {
  src: string;
  title: string;
  meta: string;
  alt: string;
};

export type Category = {
  key: string;
  name: string;
  note: string;
  plates: Plate[];
};

export const WORK_CATEGORIES: Category[] = [
  {
    key: 'surreal-uncanny',
    name: 'Surreal & Uncanny',
    note: 'Dark-surrealist set pieces where the everyday slips its skin: melting faces, glass coffins, and screens that watch back.',
    plates: [
      { src: '/work/photos/ig-095.jpg', title: 'The Glass Table', meta: 'Black & grey · calf', alt: 'Black and grey surreal tattoo of a latex-clad woman on hands and knees forming a glass table, on a calf' },
      { src: '/work/photos/ig-036.jpg', title: 'Shatter', meta: 'Black & grey · thigh', alt: 'Black and grey surreal realism tattoo of a shattered melting glass female face with drips on thigh' },
      { src: '/work/photos/ig-130.jpg', title: 'The Settee', meta: 'Black & grey · forearm', alt: 'Black and grey forearm tattoo of an ornate antique settee with two sardines arranged to form an uncanny face' },
      { src: '/work/photos/ig-088.jpg', title: 'On Ice', meta: 'Black & grey · forearm', alt: "Black and grey realism tattoo of a woman's face frozen inside an ice cube on forearm" },
      { src: '/work/photos/ig-136.jpg', title: 'Dead Channel', meta: 'Black & grey · upper arm', alt: 'Black and grey upper-arm tattoo of three stacked vintage CRT televisions displaying dark surreal imagery' },
      { src: '/work/photos/ig-231.jpg', title: 'Unzipped', meta: 'Black & grey · upper arm', alt: 'Black and grey realism tattoo of a skeletal figure peeling open a zipper in the skin on a person upper arm' },
      { src: '/work/photos/ig-118.jpg', title: 'The Morning Edition', meta: 'Black & grey · forearm', alt: 'Black and grey fineline tattoo of a seated person reading a burning newspaper on a stool, on a forearm' },
    ],
  },
  {
    key: 'figures-faces',
    name: 'Figures & Faces',
    note: 'Black & grey portraiture and the human form: cinematic homage and surreal double-exposure.',
    plates: [
      { src: '/work/photos/ig-200.jpg', title: 'Chainmail', meta: 'Black & grey · forearm', alt: 'Black and grey forearm tattoo of a medieval woman in a chainmail coif with a surreal double-exposure figure across her chest' },
      { src: '/work/photos/ig-138.jpg', title: 'Sunday Best', meta: 'Black & grey · forearm', alt: 'Black and grey forearm tattoo of a vintage suited man in a fedora walking among fineline doodled flowers' },
      { src: '/work/photos/ig-176.jpg', title: 'Pierrot', meta: 'Black & grey · arm', alt: 'Fine-line black and grey tattoo of a Pierrot clown ballerina posed on a stippled crescent moon' },
      { src: '/work/photos/ig-240.jpg', title: 'Winged Veil', meta: 'Black & grey · arm', alt: 'Surreal black and grey portrait tattoo of two women with a dragonfly and moth covering their faces' },
      { src: '/work/photos/ig-213.jpg', title: 'The Kiss', meta: 'Black & grey · arm', alt: 'Black and grey fineline tattoo of two classical lovers kissing within an ornate oval frame with an angel wing' },
      { src: '/work/photos/ig-129.jpg', title: 'Pin-Up', meta: 'Black & grey · arm', alt: 'Black and grey fineline arm tattoo of a kneeling pin-up woman in a studded corset and high heels' },
      { src: '/work/photos/ig-034.jpg', title: 'Black Swan', meta: 'Black & grey · forearm', alt: 'Black and grey realism tattoo of two retro televisions displaying Black Swan ballerina portraits on forearm' },
    ],
  },
  {
    key: 'objects-stilllife',
    name: 'Objects & Still Life',
    note: 'Hyperreal everyday objects rendered with cold precision and a wink of menace.',
    plates: [
      { src: '/work/photos/ig-105.jpg', title: 'S E X', meta: 'Black & grey · forearm', alt: 'Black and grey realism tattoo of a glossy patent handbag reading SEX on a forearm' },
      { src: '/work/photos/ig-067.jpg', title: 'Wrong Number', meta: 'Black & grey · leg', alt: 'Black and grey surreal tattoo of a vintage rotary phone with a conch shell receiver and an eye in the dial, on a leg' },
      { src: '/work/photos/ig-143.jpg', title: 'Be Kind, Rewind', meta: 'Black & grey · wrist', alt: 'Black and grey tattoo of a VHS tape of The Shining with a please remember to rewind label, on a wrist' },
      { src: '/work/photos/ig-238.jpg', title: 'Instant', meta: 'Black & grey · arm', alt: 'Detailed black and grey tattoo of a vintage Polaroid Sun 600 camera printing a photo' },
      { src: '/work/photos/ig-211.jpg', title: 'The Urn', meta: 'Black & grey · calf', alt: 'Fine-line black and grey calf tattoo of a classical urn with snake handles depicting a reclining nude figure' },
      { src: '/work/photos/ig-244.jpg', title: 'Nightcap', meta: 'Black & grey · arm', alt: 'Black and grey realism tattoo of an ornate crystal goblet filled with dark wine on an arm' },
      { src: '/work/photos/ig-209.jpg', title: 'Last Call', meta: 'Black & grey · forearm', alt: 'Black and grey forearm tattoo of a martini glass splashing, garnished with a tiny mirrored disco ball' },
    ],
  },
  {
    key: 'architecture-ornament',
    name: 'Architecture & Ornament',
    note: 'Gothic stone, sacred geometry, and devotional metalwork: the reverent end of the dark register.',
    plates: [
      { src: '/work/photos/ig-243.jpg', title: 'Saint Michael', meta: 'Black & grey · forearm', alt: 'Black and grey realism tattoo of armored archangel Saint Michael with spear standing over a fallen demon on a forearm' },
      { src: '/work/photos/ig-234.jpg', title: 'Sanctuary', meta: 'Black & grey · arm', alt: 'Black and grey tattoo of an angel embracing a robed figure inside a Gothic cathedral arch with rose window and script lettering' },
      { src: '/work/photos/ig-167.jpg', title: 'The Cathedral', meta: 'Black & grey · leg', alt: 'Detailed black and grey leg tattoo of a gothic cathedral with a tall spire' },
      { src: '/work/photos/ig-047.jpg', title: 'The Mourner', meta: 'Black & grey · calf', alt: 'Black and grey realism tattoo of a winged angel statue resting on an Ionic column on a calf' },
      { src: '/work/photos/ig-115.jpg', title: 'Love, Daddy', meta: 'Black & grey · upper arm', alt: 'Black and grey fineline tattoo of a winged cherub aiming a flintlock pistol above a Love Daddy banner, on an upper arm' },
      { src: '/work/photos/ig-108.jpg', title: 'Bow & Cross', meta: 'Black & grey · arm', alt: 'Black and grey realism tattoo of a shiny bow with dangling gothic cross charm on an arm' },
    ],
  },
  {
    key: 'chrome-flora-fauna',
    name: 'Chrome, Flora & Fauna',
    note: 'Liquid-metal surfaces and the natural world, reimagined in mirror-bright black & grey.',
    plates: [
      { src: '/work/photos/ig-251.jpg', title: 'Mirrorball', meta: 'Black & grey · arm', alt: 'Black and grey surreal tattoo of a kneeling chrome android figure with a glittering disco-ball head' },
      { src: '/work/photos/ig-082.jpg', title: 'Mirror, Mirror', meta: 'Black & grey · hand', alt: 'Black and grey hand tattoo of a butterfly whose wings reveal two mirrored portraits of a woman face' },
      { src: '/work/photos/ig-194.jpg', title: 'Lovebirds', meta: 'Black & grey · forearm', alt: 'Black and grey forearm tattoo of two lovebirds pulling the pin from a chrome hand grenade' },
      { src: '/work/photos/ig-228.jpg', title: 'Heartbone', meta: 'Black & grey · forearm', alt: 'Black and grey forearm tattoo of an animal skull arranged into a heart shape with smooth shading' },
      { src: '/work/photos/ig-216.jpg', title: 'Eagle & Serpent', meta: 'Black & grey · hand', alt: 'Black and grey fineline tattoo of an eagle attacking a snake spanning the back of a hand and thumb' },
      { src: '/work/photos/ig-185.jpg', title: 'Serpent Urn', meta: 'Black & grey · calf', alt: 'Black and grey tattoo of an ornate classical urn entwined with snakes, topped by a flower, on the calf' },
      { src: '/work/photos/ig-180.jpg', title: 'Chrome Wing', meta: 'Black & grey · ankle', alt: 'Black and grey tattoo of a polished chrome butterfly and a knife on the ankle, dark lighting' },
    ],
  },
];

// Flat list (all plates, category order) for the WebGL ring and the lightbox.
export const PLATES: Plate[] = WORK_CATEGORIES.flatMap((c) => c.plates);

export type Reel = {
  src: string;
  title: string;
  body: string;
};

export const REEL: Reel[] = [
  {
    src: '/video/reel-01.mp4',
    title: 'Single Needle',
    body: 'Fine line, surrealism, whimsical.',
  },
  {
    src: '/video/reel-02.mp4',
    title: 'Fineline surrealism',
    body: 'Black and grey dreamwork, engraved into skin one session at a time.',
  },
  {
    src: '/video/reel-03.mp4',
    title: 'Private, by appointment',
    body: 'A quiet room, a long table, and all the time the piece needs.',
  },
];

export type FlashSheet = { src: string; alt: string };

// Available flash sheets in /public/flash. No per-tile numerals or pills: each
// is simply a claimable design (availability is stated once in the section).
const SHEET_GROUPS: Record<string, number> = {
  g01: 19, g02: 4, g04: 3, g06: 4, g07: 4, g08: 4, g09: 4, g10: 4, g11: 4, g12: 1,
};

export const FLASH: FlashSheet[] = Object.entries(SHEET_GROUPS)
  .flatMap(([g, n]) => Array.from({ length: n }, (_, i) => `${g}_${String(i + 1).padStart(2, '0')}`))
  .map((id, i) => ({
    src: `/flash/${id}.jpg`,
    alt: `Flash sheet ${i + 1}. Fineline black and grey surrealist tattoo designs, available to claim.`,
  }));

export type Faq = { q: string; a: string };

export const FAQ: Faq[] = [
  {
    q: 'What is the Create tool?',
    a: 'Create is a free tool on this site. Upload a hand-drawn sketch, a photo, or any reference, and it restyles your image into the textures and execution styles I’m known for tattooing. It’s a way to explore a direction before you reach out; bring whatever you make into your text when you’re ready to book.',
  },
  {
    q: 'How do I book with you?',
    a: 'Text (480) 420-4319 (text only) to begin. In your message include: what you’d like tattooed, the size and placement, the first date you’re ready to begin (for scheduling), and whether you’re ready to pay a $100 deposit. The deposit is credited toward the cost of the tattoo and is required to book a session.',
  },
  {
    q: 'What form of payment do you take?',
    a: 'Cash, Zelle, Cash App, Venmo, Bitcoin, or Ethereum.',
  },
  {
    q: 'Where are you located?',
    a: 'I’m based out of Phoenix, Arizona. The studio is here too.',
  },
  {
    q: 'How should I prepare for my appointment?',
    a: 'Bring cash and a valid government-issued ID. Eat beforehand and be fully hydrated, and don’t drink alcohol the night before or the day of. Wear comfortable clothing that allows access to the area being tattooed. You’re welcome to bring one guest, and please don’t arrive more than 10 minutes early or 20 minutes late.',
  },
  {
    q: 'How much time should I set aside?',
    a: 'I’d highly suggest booking on a day you have nothing else going on. My palm-sized tattoos have taken anywhere from 1 hour to 10, depending on complexity and placement.',
  },
  {
    q: 'How long will the tattoo take?',
    a: 'We’ll give you our best estimate over text when discussing the piece. Time shifts with size and placement, and keep in mind it’s always just an estimate; things can run over or under.',
  },
  {
    q: 'Do you repeat flash?',
    a: 'Sort of. I like to add variations and color, and I’m happy to work with anybody on whatever they want specifically. I like to keep each piece a little unique.',
  },
  {
    q: 'Can I change my design?',
    a: 'Of course, just give us 24 hours’ notice.',
  },
  {
    q: 'What is your cancellation policy?',
    a: 'All deposits are non-refundable. Your space is reserved once a deposit is down, and refunds would make it impossible to keep a concrete schedule. I’ll allow rescheduling if you text me at least 48 hours in advance; each request is handled case by case. Depending on the situation, another deposit may be required to reschedule, which goes toward the tattoo. Deposits keep the schedule in place; it’s for your security and mine.',
  },
  {
    q: 'What is your policy on deposits?',
    a: 'All deposits are non-refundable. I offer one complimentary reschedule; anything beyond that will require an additional deposit.',
  },
  {
    q: 'What is your policy on touch-ups?',
    a: 'Free touch-ups within one month. Anything beyond that is treated at half price. Please reach out with the subject “Touch up.”',
  },
];

export type CreateStyle = { id: string; name: string; blurb: string };

// Mirror of lib/gemini/_styles.js IDs. Keep in sync.
export const CREATE_STYLES: CreateStyle[] = [
  { id: 'hyper_graphite', name: 'Hyper Graphite', blurb: 'Hyper-real graphite & charcoal.' },
  { id: 'fine_line_minimalist', name: 'Fine Line Minimalist', blurb: 'Delicate single-needle linework.' },
  { id: 'dotwork', name: 'Sacred Dotwork', blurb: 'Geometry & stippled pointillism.' },
  { id: 'dore_chrome_line', name: 'Doré Chrome Line', blurb: 'Chrome via Doré engraving lines.' },
  { id: 'y2k_gothic_chrome', name: 'Y2K Gothic Chrome', blurb: 'Cool silver visual-kei chrome.' },
  { id: 'porcelain_chrome', name: 'Porcelain Chrome', blurb: 'Silver-white porcelain w/ blue veining.' },
  { id: '80s_chrome', name: '80s Chrome', blurb: 'Airbrushed Sorayama liquid chrome.' },
  { id: 'silver_chrome', name: 'Silver Chrome', blurb: 'Mirror-polished liquid silver.' },
  { id: 'liquid_mercury', name: 'Liquid Mercury', blurb: 'Cool molten metal, surreal flow.' },
  { id: 'holo_iridescent', name: 'Holo Iridescent', blurb: 'Prismatic rainbow chrome.' },
  { id: 'mirror_chrome_ornate', name: 'Mirror Chrome Ornate', blurb: 'Lustrous high-contrast mirror chrome.' },
  { id: 'prismatic_chrome', name: 'Prismatic Chrome', blurb: 'Mirror chrome w/ rainbow refraction.' },
  { id: 'dripping_chrome', name: 'Dripping Chrome', blurb: 'Liquid chrome melting downward.' },
  { id: 'honey_gold_chrome', name: 'Honey Gold Chrome', blurb: 'Warm syrupy amber-gold chrome.' },
  { id: 'red_chrome', name: 'Red Chrome', blurb: 'Candy-apple lacquered red chrome.' },
  { id: 'dual_tone_chrome', name: 'Dual-Tone Chrome', blurb: 'Gold & silver chrome interplay.' },
  { id: 'rainbow_hue_chrome', name: 'Rainbow-Hue Chrome', blurb: 'Silver chrome, anodized undertones.' },
  { id: 'bw_micro_chrome', name: 'B/W Micro Chrome', blurb: 'High-contrast B&W chrome microrealism.' },
  { id: 'biomech_chrome_couture', name: 'Biomech Chrome Couture', blurb: 'Rose-gold biomech chrome.' },
  { id: 'biomech_red_core', name: 'Biomech Red Core', blurb: 'Translucent chrome, red interior glow.' },
  { id: 'kawaii_chrome_blob', name: 'Kawaii Chrome Blob', blurb: 'Inflated pearl-to-rose-gold chrome.' },
  { id: 'glassy_chrome', name: 'Glassy Chrome', blurb: 'Glass-chrome hybrid, see-through.' },
  { id: 'chain_chrome', name: 'Chain Chrome', blurb: 'Interlocking chrome chain-mail.' },
  { id: 'cartoon_chrome', name: 'Cartoon Chrome', blurb: 'Playful color-blocked chrome.' },
  { id: 'lego_chrome', name: 'Lego Chrome', blurb: 'Chrome-plated block construction.' },
  { id: 'condensation_chrome', name: 'Condensation Chrome', blurb: 'Chrome w/ sweating droplets.' },
  { id: 'melting_face_chrome', name: 'Melting Face Chrome', blurb: 'Viscous chrome transformation.' },
  { id: 'surreal_airbrush_chrome', name: 'Surreal Airbrush Chrome', blurb: 'Dreamlike pulp airbrushed chrome.' },
  { id: 'chrome_portal_frame', name: 'Chrome Portal Frame', blurb: 'Melting chrome border treatment.' },
];
