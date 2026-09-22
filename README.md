# Gameday Scoreboard — build bout entry

A concept build of the **Gameday all-sports scoreboard home page** (page 1 of the
Gameday MVP scope), built as a side-by-side style comparison.

- **Stack:** Vite + React, hand-written CSS, no UI framework.
- **Data:** 100% synthetic. Every school, team, opponent, score, and date is
  fictional, generated relative to the current date. The header carries a
  "Demo data" badge.
- **Brand:** Fieldhouse by Flux Athletics — navy, Flux Mint (`#3DDC84`), white.

## Run it

```bash
npm install
npm run dev
```

## Deploy

Vercel auto-detects the Vite project (`npm run build`, output `dist`).
Every push to `main` redeploys.
