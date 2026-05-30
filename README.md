# Lumora

Lumora is a PixVerse-powered campaign studio for marketplace sellers. Paste a product page link, get a structured multi-shot plan (one prompt per shot), generate each shot in PixVerse, then import results back into Lumora for a shoppable landing gallery.

## Submission

- Project Title: Lumora
- Project Summary: A PixVerse campaign studio that turns a marketplace product link into a shot-by-shot prompt pack, lets creators generate each shot in PixVerse, and imports results into a shoppable landing gallery.
- Target Audience: TikTok Shop and Shopee sellers (solo sellers to small businesses), plus creators/marketers who need fast product promo assets for short-form platforms.
- Problem Being Solved: Sellers struggle to produce consistent, high-converting product videos quickly. Existing generators are slow, expensive, or require creative expertise. Lumora bridges product data → production-ready prompts → PixVerse rendering → shoppable gallery, reducing time and friction from “product page” to “publish + checkout”.

## What it does

- Extracts product data from TikTok Shop and Shopee SG product links
- Generates a shot-by-shot prompt pack (4–8 shots, 5–8s per shot, >=30s total)
- Keeps PixVerse usage simple:
  - Manual workflow: copy a single shot prompt + use the extracted product image as reference
  - Agent workflow: copy an agent-ready prompt to run PixVerse CLI + stitch shots, then upload the final MP4
- Imports PixVerse results (link or id) and saves the PDP link so the gallery can link back to checkout

## App flow

1. Open Studio
2. Paste product link and extract product info
3. Generate shot pack
4. For each shot:
   - Copy prompt and generate in PixVerse using the reference image
   - Paste the PixVerse link/id back into Lumora to save the shot and unlock the next one
5. Landing page shows your saved videos with links back to the product page

## Tech stack

- Frontend: Vite + React + TypeScript, TailwindCSS, Framer Motion, Zustand
- Backend: Express + Cheerio scraper + PixVerse resolve API + video upload endpoint

## Local development

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev
```

Environment variables:

```env
VITE_API_URL=http://localhost:3001
```

## Deployment notes

- Frontend can be deployed on Vercel.
- Backend should be deployed on a server environment (Render/Fly/Railway) if you need uploads and scraping. Vercel serverless is not a good fit for persistent video storage.

## Repository structure

```
src/
  pages/
    LandingPage.tsx
    Studio.tsx
  components/
  stores/
backend/
  src/index.ts
  src/scraper.ts
```

## Hackathon

Track: Video Generation
Project: Lumora (PixVerse campaign studio)
