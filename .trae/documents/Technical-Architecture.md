# Lumora - Technical Architecture

## 1. Architecture Overview

Lumora is a two-tier app:

- **Frontend**: Vite + React (Lumora UI, local-first campaign gallery)
- **Backend**: Express API (product extraction, PixVerse resolve, optional uploads)

PixVerse is treated as the **renderer**. Lumora focuses on generating a commerce-aware shot plan and organizing outputs.

### 1.1 System Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         Frontend                              │
│          Vite + React + Tailwind + Zustand + Framer           │
│  - / (Landing + gallery)                                      │
│  - /studio (shot pack + import + agent prompt)                │
└──────────────────────────────────────────────────────────────┘
                              │  HTTPS (Axios)
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                          Backend                               │
│                          Express                               │
│  - POST /api/product/extract   (scrape TikTok/Shopee)          │
│  - POST /api/pixverse/resolve  (PixVerse id -> mp4 url)        │
│  - POST /api/upload/video      (optional final mp4 upload)     │
│  - GET  /api/video/:id         (stream uploaded/local video)   │
│  - GET  /api/download/:id      (download uploaded/local video) │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                   External / Third-party                      │
│  - TikTok Shop / Shopee product pages (scraping)              │
│  - PixVerse detail API (resolve video id -> media url)        │
│  - PixVerse web app / PixVerse CLI (rendering step)           │
└──────────────────────────────────────────────────────────────┘
```

## 2. Technology Stack

- Frontend: React + TypeScript, TailwindCSS, Framer Motion, Zustand, React Router
- Backend: Node.js + Express, Axios, Cheerio, CORS, Multer (uploads)
- Storage (hackathon): localStorage on frontend; local disk uploads on backend

## 3. Routes

### 3.1 Frontend Routes

| Route | Page | Purpose |
|------|------|---------|
| `/` | Landing | Public gallery + CTA to Studio |
| `/studio` | Studio | Extract product → generate shot pack → import results |

### 3.2 Backend API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/product/extract` | POST | Extract product info from TikTok/Shopee URL |
| `/api/pixverse/resolve` | POST | Resolve PixVerse link/id → mp4 + thumbnail |
| `/api/upload/video` | POST | Upload final MP4 (agent workflow) |
| `/api/video/:id` | GET | Stream uploaded/local video |
| `/api/download/:id` | GET | Download uploaded/local video |
| `/api/health` | GET | Health check |

## 4. API Definitions

### 4.1 Extract Product

`POST /api/product/extract`

```ts
interface ExtractRequest {
  url: string;
}

interface ExtractResponse {
  success: boolean;
  product: {
    title: string;
    description: string;
    price: string;
    currency: string;
    image: string;
    images: string[];
    rating?: number;
    reviews?: number;
    store?: string;
    url: string;
  };
}
```

### 4.2 Resolve PixVerse Video

`POST /api/pixverse/resolve`

```ts
interface ResolveRequest {
  url?: string;
  id?: string | number;
}

interface ResolveResponse {
  success: boolean;
  video: {
    id: number;
    pixverseUrl: string;
    mp4Url: string;
    thumbnailUrl: string;
    aspectRatio?: string;
    duration?: number;
    prompt?: string;
  };
}
```

### 4.3 Upload Final Video (Agent Output)

`POST /api/upload/video` (multipart/form-data)

- field: `file` (MP4)
- optional: `productData` (JSON string)
- optional: `pdpUrl`

```ts
interface UploadResponse {
  success: boolean;
  video: {
    id: string;
    videoUrl: string;
    downloadUrl: string;
    thumbnailUrl: string;
    pdpUrl?: string;
  };
}
```

## 5. Data Model (Frontend)

Lumora is organized around a “campaign” record stored in localStorage.

```ts
type ShotPrompt = {
  index: number;
  sceneDescription: string;
  cameraMovement: string;
  subjectAction: string;
  pixVersePrompt: string;
  suggestedDuration: number;
  aspectRatio: string;
};

type ShotRender = {
  index: number;
  pixVerseUrl: string;
  pixVerseId: string;
  mp4Url: string;
  thumbnailUrl: string;
};

type PromptPack = {
  shotPrompts: ShotPrompt[];
  captions: string[];
  hashtags: string[];
  plannedDuration: number;
  shotCount: number;
};

type Campaign = {
  id: string;
  productUrl: string;
  productData: {
    title: string;
    description: string;
    price: string;
    image: string;
    url: string;
  };
  style: string;
  duration: number;
  aspectRatio: string;
  status: 'processing' | 'ready' | 'failed';
  videoUrl: string;
  downloadUrl?: string;
  thumbnailUrl: string;
  isPublic: boolean;
  metadata: {
    pdpUrl?: string;
    promptPack?: PromptPack;
    shotRenders?: ShotRender[];
  };
  createdAt: Date;
};
```

## 6. Deployment

### 6.1 Recommended

- Frontend: Vercel
- Backend: Render/Fly/Railway (server process + optional disk)

Frontend must set:

```env
VITE_API_URL=https://your-backend-domain
```

### 6.2 Notes

- Vercel serverless is not suitable for persistent on-disk video storage; if uploads are required, use object storage (S3/R2) or a server host.

## 7. Security / Reliability

- Validate and sanitize extracted URLs
- Keep CORS allowlist strict in production
- Avoid storing secrets in frontend; all scraping + PixVerse resolve happens server-side
