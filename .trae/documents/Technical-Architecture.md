# ViralVibe - Technical Architecture Document

## 1. Architecture Design

### 1.1 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│                  React@18 + TailwindCSS                     │
│                   + Vite + Framer Motion                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                            │
│                   (Frontend Routes)                         │
│  - /api/generate                                            │
│  - /api/trends                                             │
│  - /api/product/extract                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
        ┌───────────────────┐   ┌───────────────────┐
        │  Product Service  │   │   Video Service   │
        │  (Link Parsing)    │   │  (PixVerse API)   │
        └───────────────────┘   └───────────────────┘
                    │                   │
                    ▼                   ▼
        ┌───────────────────┐   ┌───────────────────┐
        │  Scraper Service  │   │   Trend Service   │
        │  (Web Scraping)    │   │  (Trend Fetcher) │
        └───────────────────┘   └───────────────────┘
```

### 1.2 Technology Stack

- **Frontend Framework**: React@18 + TypeScript
- **Styling**: TailwindCSS@3
- **Build Tool**: Vite
- **Animations**: Framer Motion
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Video Player**: React Player
- **Backend**: Express@4 (Node.js)
- **Database**: In-memory storage (demo) / PostgreSQL (production)
- **External APIs**: PixVerse API, Product Scraping APIs

## 2. Technology Description

### 2.1 Frontend Technologies

- **React@18**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **TailwindCSS@3**: Utility-first CSS framework
- **Vite**: Fast build tool and dev server
- **Framer Motion**: Production-ready animations
- **Zustand**: Lightweight state management
- **React Player**: Video playback component
- **Lucide React**: Icon library

### 2.2 Backend Technologies

- **Express@4**: Web framework
- **Node.js**: Runtime environment
- **Axios**: HTTP client for API calls
- **Cheerio**: HTML parsing for web scraping
- **CORS**: Cross-origin resource sharing
- **Dotenv**: Environment variables management

### 2.3 External Integrations

- **PixVerse API**: Video generation
- **TikTok Shop API**: Primary product data extraction
- **Shopee SG API**: Secondary product data extraction
- **TikTok Trend APIs**: Fetch trending sounds/effects

## 3. Route Definitions

### 3.1 Frontend Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing Page | Marketing, features, signup |
| `/dashboard` | Dashboard | Main workspace |
| `/studio` | Generation Studio | Video creation interface |
| `/templates` | Template Gallery | Browse and select templates |
| `/history` | Video History | View past generations |
| `/settings` | Settings | User preferences |

### 3.2 API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/generate` | POST | Generate video from product data |
| `/api/product/extract` | POST | Extract product info from URL |
| `/api/trends` | GET | Fetch current trending formats |
| `/api/templates` | GET | List available templates |
| `/api/health` | GET | Health check |

## 4. API Definitions

### 4.1 Generate Video

**Endpoint:** `POST /api/generate`

**Request:**
```typescript
interface GenerateRequest {
  productUrl: string;
  productData: {
    title: string;
    description: string;
    price: string;
    image: string;
    rating?: number;
  };
  style: 'trending' | 'funny' | 'emotional' | 'professional';
  duration: 15 | 30 | 60;
  aspectRatio: '9:16' | '1:1' | '16:9';
  templateId?: string;
}
```

**Response:**
```typescript
interface GenerateResponse {
  success: boolean;
  video: {
    id: string;
    url: string;
    thumbnail: string;
    status: 'processing' | 'ready' | 'failed';
  };
  metadata: {
    generationTime: number;
    trendScore: number;
    suggestions: string[];
  };
}
```

### 4.2 Extract Product

**Endpoint:** `POST /api/product/extract`

**Request:**
```typescript
interface ExtractRequest {
  url: string;
}
```

**Response:**
```typescript
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
  };
}
```

### 4.3 Get Trends

**Endpoint:** `GET /api/trends`

**Response:**
```typescript
interface TrendsResponse {
  trends: {
    id: string;
    name: string;
    type: 'sound' | 'effect' | 'format';
    popularity: number;
    thumbnail: string;
    usage: string;
  }[];
  lastUpdated: string;
}
```

## 5. Server Architecture

### 5.1 Backend Structure

```
Backend (Express)
├── Routes
│   ├── /api/generate
│   ├── /api/product
│   └── /api/trends
├── Services
│   ├── VideoService
│   ├── ProductService
│   └── TrendService
├── Middleware
│   ├── Error Handler
│   ├── CORS
│   └── Request Logger
└── Utils
    ├── Web Scraper
    └── Data Transformers
```

### 5.2 Service Layer Architecture

```
Controller Layer
    ↓
Service Layer
    ├── VideoService
    │   ├── generateVideo()
    │   ├── getVideoStatus()
    │   └── downloadVideo()
    ├── ProductService
    │   ├── extractProduct()
    │   ├── validateUrl()
    │   └── parseHtml()
    └── TrendService
        ├── fetchTrends()
        ├── getTrendingSounds()
        └── getTrendingFormats()
    ↓
Repository Layer
    └── Data Access (mock data / database)
```

## 6. Data Model

### 6.1 User Model

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'guest' | 'user' | 'premium';
  createdAt: Date;
  lastLogin: Date;
  preferences: {
    defaultStyle: string;
    defaultDuration: number;
    defaultAspectRatio: string;
  };
  usage: {
    videosGenerated: number;
    videosRemaining: number;
  };
}
```

### 6.2 Video Model

```typescript
interface Video {
  id: string;
  userId: string;
  productUrl: string;
  productData: ProductData;
  style: string;
  duration: number;
  aspectRatio: string;
  templateId?: string;
  status: 'processing' | 'ready' | 'failed';
  videoUrl: string;
  thumbnailUrl: string;
  metadata: {
    generationTime: number;
    trendScore: number;
    trendIds: string[];
  };
  createdAt: Date;
}
```

### 6.3 Template Model

```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  category: 'trending' | 'demo' | 'unboxing' | 'transformation' | 'lifestyle';
  thumbnail: string;
  preview: string;
  config: {
    defaultDuration: number;
    defaultStyle: string;
    effects: string[];
    music: string;
  };
  popularity: number;
  isPremium: boolean;
}
```

### 6.4 Product Data Model

```typescript
interface ProductData {
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
}
```

## 7. Project Structure

### 7.1 Directory Layout

```
viralvibe/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── landing/
│   │   │   ├── dashboard/
│   │   │   └── studio/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── types/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── .env.example
├── README.md
└── package.json (workspace root)
```

## 8. Environment Variables

```env
# Frontend
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=ViralVibe

# Backend
PORT=3001
PIXVERSE_API_KEY=your_pixverse_api_key
PIXVERSE_API_URL=https://api.pixverse.ai

# Optional
DATABASE_URL=postgresql://user:pass@localhost:5432/viralvibe
```

## 9. Performance Requirements

- Video generation: < 30 seconds for 15s video
- Page load time: < 2 seconds
- API response time: < 500ms
- Real-time updates: WebSocket or polling for generation status
- Image optimization: Lazy loading, WebP format
- Video compression: H.264 codec, optimized bitrate

## 10. Security Considerations

- API key protection: Backend-only exposure
- URL validation: Prevent malicious links
- Rate limiting: 10 requests per minute (guest), 100 requests per minute (registered)
- Input sanitization: Prevent XSS attacks
- CORS policy: Allow specific origins only
- HTTPS: Enforce secure connections
