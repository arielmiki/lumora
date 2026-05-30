# Lumora - Product Requirements Document

## 1. Product Overview

**Lumora** is a PixVerse campaign studio for marketplace sellers. It turns a product page link into a shot-by-shot prompt pack (one prompt per shot), guides creators through generating shots in PixVerse, and imports results into a shoppable landing gallery with a checkout link back to the product page.

### Problem Statement

- Sellers need short-form product videos, but producing consistent, high-converting creative is slow and requires skill
- “Generate a full video” workflows are unreliable and hard to control; creators prefer modular shots they can re-run and stitch
- There is a gap between product listing data and production-ready prompts that work well in PixVerse

### Target Audience

- TikTok Shop and Shopee sellers (solo sellers to small businesses)
- Creators / marketers producing UGC-style product promos
- SEA social commerce teams needing rapid iteration on hooks and shots

### Value Proposition

- Shortens time from “product page” → “ready-to-render prompts” → “shoppable gallery”
- Keeps PixVerse as the renderer; Lumora focuses on commerce-aware direction, shot planning, and organization
- Saves the product (PDP) link alongside the video so viewers can go straight to checkout

## 2. Core Features

### 2.1 Product Link Extraction

- Input: TikTok Shop (primary) and Shopee SG (secondary)
- Output: title, price, description, rating/reviews (if available), primary image, PDP URL

### 2.2 Shot Pack Generator

- Generates a **shot plan** with:
  - 4–8 shots
  - 5–8 seconds per shot
  - >= 30 seconds total
  - platform-aware aspect ratio (9:16 / 1:1 / 16:9)
- Produces **one PixVerse prompt per shot** (no “master prompt”)
- Uses extracted product description to derive feature phrases for shot content and overlays

### 2.3 Manual PixVerse Workflow (Web)

- Step-by-step UI that shows **one active shot**
- User can only progress to the next shot after saving the PixVerse link/id for the current one
- Provides the **product reference image** (copy/open/download) for PixVerse image conditioning
- Imports PixVerse results per-shot and saves them into a single campaign record

### 2.4 Agent Workflow (CLI Prompt + Upload)

- Generates an agent-ready instruction prompt for tools like Claude Code:
  - run PixVerse CLI per-shot
  - stitch shots with ffmpeg
- Upload final MP4 back into Lumora so it appears in the landing gallery

### 2.5 Landing Gallery (Shoppable)

- Landing page displays saved campaigns/videos
- Each video links back to the **PDP checkout** URL
- Local-first storage (hackathon mode) with optional “public” flag for showcase

## 3. User Journey

### 3.1 Primary Flow (Manual)

1. Paste product link
2. Lumora extracts product + image
3. Generate shot pack
4. For each shot:
   - Copy prompt → generate in PixVerse with reference image
   - Paste PixVerse link/id → save shot → unlock next
5. Landing gallery shows the campaign and checkout link

### 3.2 Alternate Flow (Agent)

1. Generate shot pack
2. Copy agent prompt → render shots via PixVerse CLI → stitch into final.mp4
3. Upload final MP4 into Lumora
4. Landing gallery shows the uploaded final video and checkout link

## 4. UX / Design Principles

- Clean editorial aesthetic (Lumora theme), minimal clutter, no emoji usage
- “One job per screen”: extraction → shot prompts → import
- Strong guardrails: step gating, clear status, predictable progress
- Social-first outputs: 9:16 defaults, short overlays, hook-first pacing

## 5. Success Metrics (Hackathon)

- Time to first usable shot prompt: under 30 seconds
- Manual flow completion: at least 1 saved shot in under 2 minutes
- Import reliability: PixVerse link/id resolves successfully > 95% (for valid ids)
- Showcase readiness: landing gallery can display and link to PDP for all saved items

## 6. Future Roadmap

- Multi-user accounts + cloud storage for campaigns
- Object storage (S3/R2) for uploaded final videos
- Auto-stitching pipeline (worker + queue) for non-Vercel deployments
- A/B variants (hook lines, shot sequences, overlay copy) with quick regenerate
- Performance analytics for posted videos (manual inputs or platform integrations)
