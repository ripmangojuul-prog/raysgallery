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
    'work Ray does, and ask whether they would want it done in her black-&-grey style instead. Do NOT ' +
    'describe how she would render it, do NOT redesign it, and do NOT pitch or list specific elements — ' +
    'that is Ray\'s call. If they still want the off-style piece, or it is clearly not a fit ' +
    '(e.g. full-color anime), hand off to Ray rather than promising something she wouldn\'t do.',
} as const;

// Compact string for embedding in the system prompt. This is PRIVATE knowledge:
// it exists so the agent's brain understands Ray and can silently judge whether a
// request/reference is in her lane. It is NOT a menu, a script, or a source of
// suggestions — the agent must never recite, pitch, or enthuse about any of it.
export function styleSectorBrief(): string {
  return [
    'PRIVATE STYLE KNOWLEDGE — INTERNAL ONLY. NEVER recite, list, quote, paraphrase, or pitch any of this to a client. This is background for your own understanding ONLY: (a) so you know who Ray is as an artist, and (b) so you can silently judge whether a client\'s request or reference image is the kind of work Ray does. It is a private lens for your own judgment — NOT a menu, a sales script, or a source of suggestions. You NEVER use it to describe, suggest, add to, or design a client\'s tattoo, and you NEVER talk about technique, texture, mood, or style elements out loud. None of these elements are things you bring up.',
    '',
    `WHO RAY IS (for your understanding, never to be said): ${STYLE_SECTOR.identity}`,
    '',
    'INSIDE RAY\'S LANE (use ONLY to recognize an in-style request — never read aloud, never offer as ideas):',
    ...STYLE_SECTOR.inScope.map((s) => `  • ${s}`),
    '',
    'OUTSIDE RAY\'S LANE — instant tells a request is NOT a HINTER piece (use ONLY to recognize an off-style request; never promise these as a HINTER piece):',
    ...STYLE_SECTOR.outOfScope.map((s) => `  • ${s}`),
    '',
    'HOW TO ACT ON THIS KNOWLEDGE (judgment only, never narration):',
    '  • In-lane request or reference → just acknowledge it simply ("got it", "cool") and keep gathering what you need to book. Do NOT comment on the style, the technique, or why it fits. Do NOT add elements or suggest anything.',
    '  • Out-of-lane request → ' + STYLE_SECTOR.redirectGuidance,
    '  • If a client asks what would look good, what you\'d add, or how you\'d do it → that\'s Ray\'s job, not yours. Briefly say Ray will go over all of that with them once they\'re on the books, then steer back to booking. Never answer the design question yourself.',
  ].join('\n');
}
