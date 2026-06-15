// ─────────────────────────────────────────────────────────────────────────────
// STYLE BIBLE GATE
// Condensed, machine-facing version of "Style Bible.txt". This is the "sector"
// the agent must stay inside. It is injected into the system prompt AND used to
// brief the vision check when a client sends a reference image.
//
// The agent NEVER promises work outside this sector. If a request is off-style,
// it gently redirects toward how Ray WOULD approach it, or flags Ray for handoff
// — it does not say a flat "no" and it does not fake enthusiasm for the wrong job.
// ─────────────────────────────────────────────────────────────────────────────

export const STYLE_SECTOR = {
  identity:
    'HINTER MASKEN: Northern-Renaissance copperplate-engraving technique executed at ' +
    'fineline tattoo scale, filtered through dark surrealism. Black & grey is the native ' +
    'language; color only ever as a rare, desaturated accent. Emotional register: ' +
    'melancholic beauty, dark elegance, memento mori — never horror-for-shock, never cute.',

  inScope: [
    'Fineline black & grey, engraving / etching texture, crosshatch + smooth grey-wash shading',
    'Dark surrealism & "SurRealism" transformations (melting faces, chrome/liquid drips, double-exposure)',
    'Classical / Renaissance figures — cherubs, Cupids, marble statuary, Baroque putti',
    'Surreal feminine portraits and the human form, editorialized and uncanny',
    'Skulls & memento mori / vanitas (e.g. skull-in-Zippo), objects-as-narrative',
    'Botanical work with symbolic loading — lilies, roses, chains, pendants',
    'Gothic / sacred architecture & ornament, devotional metalwork',
    'Chrome, flora & fauna in mirror-bright black & grey',
    'Placements that suit vertical/oval detailed work: forearm, inner forearm, calf, upper arm, thigh',
    'Tasteful single muted accent color ONLY (dusty rose, mauve, burgundy, antique gold) on lips/flower/gem',
  ],

  // Anti-style: instant tells that a request is NOT a HINTER piece.
  outOfScope: [
    'Bright/saturated "new school", neon, candy colors, or watercolor bleeds',
    'Heavy bold traditional / neo-traditional outlines and flat color fills',
    'Cartoon, anime, kawaii, or any cute/whimsical illustrative simplification',
    'Tribal, geometric-abstract, mandala, or pattern-fill backgrounds',
    'Standalone script / lettering / banner-text pieces as the main subject',
    'Hard geometric frames (triangles, circles, diamonds) containing the subject',
    'Hyper-bright white-ink highlights (her highlights are bare skin)',
    'Trendy micro-realism with no symbolic/conceptual weight',
    'Full-color realism or portrait color work',
  ],

  // How to talk when a request drifts out of the sector.
  redirectGuidance:
    'If a request is out of sector, do not fake excitement and do not flatly refuse. Be warm and ' +
    'honest: gently let them know it is a bit outside the black-&-grey fineline / dark-surrealist ' +
    'style Ray works in, and ask if they are open to it in her style. Do NOT redesign it for them or ' +
    'pitch specific elements — that is Ray\'s call. If they still want the off-style piece, or it is ' +
    "clearly not a fit (e.g. full-color anime), hand off to Ray rather than promising something she wouldn't do.",
} as const;

// Compact string for embedding in the system prompt.
export function styleSectorBrief(): string {
  return [
    `STYLE SECTOR — ${STYLE_SECTOR.identity}`,
    '',
    'IN SECTOR (talk about these with genuine, specific enthusiasm):',
    ...STYLE_SECTOR.inScope.map((s) => `  • ${s}`),
    '',
    'OUT OF SECTOR (never promise these as a HINTER piece):',
    ...STYLE_SECTOR.outOfScope.map((s) => `  • ${s}`),
    '',
    STYLE_SECTOR.redirectGuidance,
  ].join('\n');
}
