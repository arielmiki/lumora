# Lumora

PixVerse prompt builder + community marketplace showcase for ecommerce sellers.

Lumora turns a TikTok Shop / Shopee SG product link into a ready-to-run PixVerse shot pack — prompts, captions, and reference images for every scene — then publishes the finished MP4 to a public showcase others can browse and remix.

Live: <https://uselumora.vercel.app>

---

## How it works

1. **Paste a product link** in Studio (or skip the scraper and fill the fields manually — every field is editable).
2. **Pick direction, duration, aspect ratio.**
3. **Build the shot pack.** Lumora generates 4–8 PixVerse shot prompts (5–8s each, ≥30s total), with the reference image baked in.
4. **Use it one of two ways:**
   - **Agent (CLI prompt)** — copy a terminal-ready instruction and paste it into Claude Code or any coding agent; it runs each shot through the PixVerse CLI and stitches the result with `ffmpeg`.
   - **Manual (Web)** — copy each shot prompt to [PixVerse](https://app.pixverse.ai), then paste the resulting links back into Lumora.
5. **Upload the final MP4.** Drop the stitched video into the dropzone, Lumora extracts a thumbnail on the client, both land in Vercel Blob, and your film appears in the public marketplace showcase.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vite + React + TypeScript, TailwindCSS, Framer Motion, Zustand, React Router |
| Serverless functions (uploads) | `api/upload/video.ts`, `api/upload/thumbnail.ts` using `@vercel/blob` |
| Backend (scraper + PixVerse passthrough) | Express + Cheerio, deployed on Render |
| Storage | Vercel Blob for uploaded MP4s + extracted thumbnails |
| AI generation | [PixVerse CLI](https://github.com/pixverseai/pixverse-cli) |

## Local development

Frontend (this directory):

```bash
npm install
npm run dev          # http://localhost:5173
```

Backend (separate process, only needed for product extraction + manual-mode imports):

```bash
cd backend
npm install
npm run dev          # http://localhost:3001
```

Copy the example env file and adjust to taste:

```bash
cp .env.example .env
```

The Vercel Blob upload functions only work in production (they need `BLOB_READ_WRITE_TOKEN` provided automatically by Vercel). For local dev the rest of the app — extract, shot-pack build, CLI prompt — works without them.

## Environment variables

| Variable | Where | Description |
|---|---|---|
| `VITE_API_URL` | frontend | Backend base URL (e.g. `http://localhost:3001` in dev, your Render URL in prod) |
| `VITE_APP_NAME` | frontend | Display name shown in the navbar |
| `BLOB_READ_WRITE_TOKEN` | Vercel project env | Provided automatically when you connect a Vercel Blob store |
| `PORT` | backend | Backend HTTP port (Render sets this automatically) |

## Repository layout

```
api/upload/             # Vercel serverless functions for Blob client uploads
backend/                # Express scraper + PixVerse passthrough (Render)
public/                 # Static favicon / assets
src/
  components/           # Navbar, shared bits
  hooks/                # useTheme
  lib/                  # publicImage() helper, pixversePack builder
  pages/                # LandingPage, Studio, Gallery, Dashboard, Home
  services/api.ts       # axios + Blob upload client
  stores/useStore.ts    # Zustand store
DESIGN-GUIDE.md         # Visual + interaction design reference
render.yaml             # Render blueprint (Singapore region by default)
vercel.json             # SPA rewrite scoped to non-/api paths
```

## Deployment

- **Frontend + serverless uploads:** `vercel deploy --prod` from the repo root.
- **Backend:** push to `main`; Render reads `render.yaml` and redeploys `lumora-backend`. The blueprint pins `region: singapore`.
- A clean SPA rewrite (`(?!api/).*` → `index.html`) keeps `/api/upload/*` reachable as Vercel functions while everything else falls through to the SPA.

## Contributing

Issues and PRs welcome. Quick rules:

- Keep prompts short and behaviour explicit — no dead code, no scaffolding for hypothetical features.
- Don't commit secrets. `.env` is gitignored; use `.env.example` to add new keys.
- Big binaries (MP4s, large images) belong in Blob storage, not the repo.

## License

[MIT](./LICENSE) © 2026 Lumora contributors.
