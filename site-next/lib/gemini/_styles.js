// Curated style set for the HINTER "Create" tab: the named styles + every chrome.
// IDs must match keys in _stylePrompts.js. Keep in sync with src/createStyles.js.

export const CREATE_STYLES = [
  { id: 'hyper_graphite',        name: 'Hyper Graphite',        blurb: 'Hyper-real graphite & charcoal.' },
  { id: 'fine_line_minimalist', name: 'Fine Line Minimalist',  blurb: 'Delicate single-needle linework.' },
  { id: 'dotwork',              name: 'Sacred Dotwork',        blurb: 'Geometry & stippled pointillism.' },
  { id: 'dore_chrome_line',     name: 'Doré Chrome Line',      blurb: 'Chrome via Doré engraving lines.' },
  { id: 'y2k_gothic_chrome',    name: 'Y2K Gothic Chrome',     blurb: 'Cool silver visual-kei chrome.' },
  { id: 'porcelain_chrome',     name: 'Porcelain Chrome',      blurb: 'Silver-white porcelain w/ blue veining.' },
  { id: '80s_chrome',           name: '80s Chrome',            blurb: 'Airbrushed Sorayama liquid chrome.' },
  { id: 'silver_chrome',        name: 'Silver Chrome',         blurb: 'Mirror-polished liquid silver.' },
  { id: 'liquid_mercury',       name: 'Liquid Mercury',        blurb: 'Cool molten metal, surreal flow.' },
  { id: 'holo_iridescent',      name: 'Holo Iridescent',       blurb: 'Prismatic rainbow chrome.' },
  { id: 'mirror_chrome_ornate', name: 'Mirror Chrome Ornate',  blurb: 'Lustrous high-contrast mirror chrome.' },
  { id: 'prismatic_chrome',     name: 'Prismatic Chrome',      blurb: 'Mirror chrome w/ rainbow refraction.' },
  { id: 'dripping_chrome',      name: 'Dripping Chrome',       blurb: 'Liquid chrome melting downward.' },
  { id: 'honey_gold_chrome',    name: 'Honey Gold Chrome',     blurb: 'Warm syrupy amber-gold chrome.' },
  { id: 'red_chrome',           name: 'Red Chrome',            blurb: 'Candy-apple lacquered red chrome.' },
  { id: 'dual_tone_chrome',     name: 'Dual-Tone Chrome',      blurb: 'Gold & silver chrome interplay.' },
  { id: 'rainbow_hue_chrome',   name: 'Rainbow-Hue Chrome',    blurb: 'Silver chrome, anodized undertones.' },
  { id: 'bw_micro_chrome',      name: 'B/W Micro Chrome',      blurb: 'High-contrast B&W chrome microrealism.' },
  { id: 'biomech_chrome_couture', name: 'Biomech Chrome Couture', blurb: 'Rose-gold biomech chrome.' },
  { id: 'biomech_red_core',     name: 'Biomech Red Core',      blurb: 'Translucent chrome, red interior glow.' },
  { id: 'kawaii_chrome_blob',   name: 'Kawaii Chrome Blob',    blurb: 'Inflated pearl-to-rose-gold chrome.' },
  { id: 'glassy_chrome',        name: 'Glassy Chrome',         blurb: 'Glass-chrome hybrid, see-through.' },
  { id: 'chain_chrome',         name: 'Chain Chrome',          blurb: 'Interlocking chrome chain-mail.' },
  { id: 'cartoon_chrome',       name: 'Cartoon Chrome',        blurb: 'Playful color-blocked chrome.' },
  { id: 'lego_chrome',          name: 'Lego Chrome',           blurb: 'Chrome-plated block construction.' },
  { id: 'condensation_chrome',  name: 'Condensation Chrome',   blurb: 'Chrome w/ sweating droplets.' },
  { id: 'melting_face_chrome',  name: 'Melting Face Chrome',   blurb: 'Viscous chrome transformation.' },
  { id: 'surreal_airbrush_chrome', name: 'Surreal Airbrush Chrome', blurb: 'Dreamlike pulp airbrushed chrome.' },
  { id: 'chrome_portal_frame',  name: 'Chrome Portal Frame',   blurb: 'Melting chrome border treatment.' },
];

export const CREATE_STYLE_IDS = new Set(CREATE_STYLES.map((s) => s.id));
