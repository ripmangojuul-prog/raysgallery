# HINTER MASKEN — Phoenix Fineline SurRealism

The official site for HINTER MASKEN (@hintertattoo). A dark, museum-plate,
single-page site: hero → studio info → selected work → flash archive →
artist → press → FAQ → booking.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
```

## Where things live

- `src/` — React components (one per section) + `src/data.js` (all copy, links, FAQ, image lists)
- `src/index.css` — the entire design system (tokens at the top)
- `public/work/` — healed-piece photos shown in Selected Work
- `public/flash/` — flash-sheet scans shown in the Flash Archive
- `public/artist/portrait.jpg` — hero & artist portrait
- `site design guide.txt` — the style/token reference the design follows

## Adding new work

1. Drop the image in `public/work/` or `public/flash/`
2. For work plates: add an entry to `PLATES` in `src/data.js`
3. For flash: add the filename to `SHEET_GROUPS` logic or extend the list in `src/data.js`

## Older experiments (kept, untouched)

- `cloud-gallery/` — the previous root app: immersive 3D sky gallery (React Three Fiber)
- `gallery/` — first-person 3D virtual gallery
- `cloudscape/` — cloud environment experiment
