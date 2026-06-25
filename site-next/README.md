# HINTER TATTOO. Next.js redesign (`site-next/`)

A parallel, from-scratch rebuild of the live HINTER site, re-expressing the same
brand against the `design-taste-frontend` (anti-slop) skill. It does not touch
the live Vite/React app at the repo root.

- **Stack:** Next.js 16 (App Router, RSC) + Tailwind v4 + Motion + ogl (WebGL).
- **Fonts:** Cormorant Garamond + Jost, self-hosted via `next/font` (no Google `<link>`).
- **Dials (target):** DESIGN_VARIANCE 7 / MOTION_INTENSITY 6 / VISUAL_DENSITY 3.
- **Mode:** Redesign-Preserve. Brand, content, IA, and the text-only booking
  path are preserved; the slop tells are removed.

## Run

```bash
npm install
npm run dev          # http://localhost:3000 (or: npm run dev -- --port 3200)
npm run build        # production build
npm run check:dashes # fails if any em-dash / en-dash reaches user-visible source
```

The **Create** tool needs `GEMINI_API_KEY` in `.env.local` (carried over from the
root app). It calls Google Gemini through `app/api/generate/route.ts`.

## What changed from the live site (audit-driven)

- **Zero em-dashes.** ~60+ visible em/en dashes removed; `check:dashes` guards it.
- **Section headers** rebuilt as left-aligned stacks: no Roman numerals, no
  floating top-right corner notes (the old `SectionHeader` split-header).
- **One marquee**, three eyebrows total (hero, Create, Book), no scroll cues, no
  on-image pills, no reel pagination, no middle-dot pileups.
- **Work**: the WebGL ring stays as the signature showpiece (code-split, mounted
  only near viewport), and the five repeated carousels become one accessible
  category-toggle grid.
- **Hero video**: 19.5MB clip replaced by a 975KB grayscale loop + a 110KB poster
  (the LCP element and the reduced-motion still); `preload="metadata"`.
- **Nav**: sentinel `IntersectionObserver` instead of a `window` scroll listener.
- **Lightbox**: true modal (focus trap, page `inert`, scroll lock, focus restore).
- **Create**: `aria-live` status, `role="alert"` error, `aria-busy`, skeleton
  instead of a spinner, honest toggle group (not a half-built tablist).
- **FAQ**: accessible accordion.
- **Nav wordmark** set to `HINTER` (the live nav read `RAY'S GALLERY`, which
  conflicted with the HINTER TATTOO brand used everywhere else on the site).

## Deploy

`vercel` from this folder. Set `GEMINI_API_KEY` in the project's environment.
Assets (work photos, flash, artist portrait, reels) are copied into `public/`.
