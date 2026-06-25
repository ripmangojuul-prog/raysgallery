# HINTER TATTOO — "Ink Gallery After Dark"

A cinematic, agency-grade **motion website** for Ray's Gallery / HINTER TATTOO,
built in the style of the "$35K motion-website playbook" (Higgsfield + Claude Code).
It is a **self-contained static site** — it does not touch the live React app at the
repo root, so it can be reviewed, deployed to a preview URL, and promoted only when
you're ready.

## What makes it read as "expensive"
The six signature cinematic effects from the playbook, wired to real brand content:

1. **Film grain** — animated SVG `feTurbulence` overlay, `soft-light`, ~7%.
2. **Vignette** — fixed radial-gradient frame so the screen reads as graded footage.
3. **Particle field** — capped canvas `requestAnimationFrame` drift behind the hero (IntersectionObserver-gated).
4. **Glass cards** — `backdrop-filter` blur on the nav, the Create card, and the lightbox.
5. **One global color grade** — a single warm duotone applied to every image and video so AI stills and real tattoo photos share one art-directed look.
6. **Scroll pacing** — [Lenis](https://github.com/darkroomengineering/lenis) inertial smooth-scroll (lerp 0.08) bridged to **GSAP ScrollTrigger** for parallax, clip-path reveals, and cinematic reel mask-wipes.

Type system: **Fraunces** (display) × **Inter** (body) — deliberately avoiding the two
biggest "AI-generated" tells (no purple→blue gradient hero, no Inter-as-display).
Palette: a warm 4-step charcoal ramp (`#0A0908 → #2A2724`) with a single rationed
**oxblood** accent (`#7A1E1E`) used at most once per viewport.

## Generated assets (Higgsfield AI)
Created with the `higgsfield` CLI — ink + Sonoran-desert surreal motifs, all IP-clean
(no text, no people, no real tattoo artwork). ~135 credits total.

| File | Model | Purpose |
|---|---|---|
| `assets/hero-still.jpg` | gpt_image_2 (4K) | hero poster / source frame |
| `assets/hero-loop.mp4` | seedance_2_0 (i2v, 8s) | cinematic hero loop |
| `assets/section-portal.jpg` | gpt_image_2 | Studio + Create background |
| `assets/section-ink-bloom.jpg` | gpt_image_2 | Work + Book background; ambient source |
| `assets/section-desert-veil.jpg` | gpt_image_2 (9:16) | Artist background |
| `assets/ambient-loop.mp4` | seedance_2_0 (i2v, 6s) | ambient drift behind Work |

Real brand assets (`assets/work/`, `assets/flash/`, `assets/video/`, `assets/portrait.jpg`)
are copied from the live site's `public/` so the gallery shows Ray's actual work and the
real flash archive.

## Preview locally
No build step, no dependencies (GSAP + Lenis load from CDN):

```bash
cd new-site
npx serve -l 4321 .
# open http://localhost:4321
```

## Deploy to Vercel (separate preview)
```bash
cd new-site
vercel            # preview URL
vercel --prod     # production
```
It deploys as a static site (no framework build). To replace the live raysgallery.com
later, point the domain at this project — but that is a deliberate, separate step.

## Notes / content rules preserved
- Booking is **text-only** to **(480) 420-4319** — no call CTA, form, or scheduler.
- Deposit is **$100** (per the live FAQ).
- Zero emoji — only the ✦ glint and the literal `<3` in the cancellation FAQ.
- The **Create** tool (Gemini restyle/cover-up) is a live React feature; here it is a
  teaser that links to `raysgallery.com/#create`. Wire it in directly if this becomes the
  primary site.
