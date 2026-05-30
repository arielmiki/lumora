# ViralVibe Backend API

Express.js backend for ViralVibe video generation platform.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Running the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The server runs on `http://localhost:3001` by default.

## 📡 API Endpoints

### Health Check

```bash
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-05-30T00:00:00.000Z",
  "pixverse": "ready"
}
```

### Extract Product

Extract product information from a TikTok Shop or Shopee SG URL.

```bash
POST /api/product/extract
Content-Type: application/json

{
  "url": "https://tiktok.com/shop/product/..."
}
```

Response:
```json
{
  "success": true,
  "product": {
    "title": "Premium Wireless Earbuds Pro",
    "description": "High-quality wireless earbuds with active noise cancellation...",
    "price": "S$89.90",
    "currency": "SGD",
    "image": "https://...",
    "images": ["https://...", "https://..."],
    "rating": 4.8,
    "reviews": 234,
    "store": "TikTok Shop",
    "url": "https://..."
  }
}
```

### Generate Video

Start video generation with PixVerse.

```bash
POST /api/generate
Content-Type: application/json

{
  "productUrl": "https://tiktok.com/shop/product/...",
  "productData": {
    "title": "Premium Wireless Earbuds Pro",
    "description": "...",
    "price": "S$89.90",
    "image": "https://...",
    "store": "TikTok Shop"
  },
  "style": "trending",
  "duration": 15,
  "aspectRatio": "9:16"
}
```

Response:
```json
{
  "success": true,
  "task": {
    "id": "task_123456789_abc123",
    "status": "processing",
    "prompt": "Product showcase video: ...",
    "createdAt": "2026-05-30T00:00:00.000Z"
  },
  "message": "Video generation started. Poll /api/generate/:taskId for status."
}
```

### Check Generation Status

Poll for video generation status.

```bash
GET /api/generate/:taskId
```

Response (in progress):
```json
{
  "success": true,
  "task": {
    "id": "task_123456789_abc123",
    "status": "rendering",
    "progress": 65,
    "message": "Rendering video..."
  }
}
```

Response (completed):
```json
{
  "success": true,
  "task": {
    "id": "task_123456789_abc123",
    "status": "completed",
    "videoUrl": "https://example.com/videos/...",
    "thumbnailUrl": "https://example.com/thumbnails/...",
    "metadata": {
      "generationTime": 3.2,
      "trendScore": 92,
      "suggestions": [
        "Add trending sound @trending_sound",
        "Use hashtags: #TikTokShop #ProductShowcase"
      ]
    }
  }
}
```

### Cancel Generation

```bash
POST /api/generate/:taskId/cancel
```

Response:
```json
{
  "success": true,
  "message": "Task cancelled successfully"
}
```

### Get Trending Formats

```bash
GET /api/trends
```

Response:
```json
{
  "success": true,
  "trends": [
    {
      "id": "trend-1",
      "name": "Product Showcase",
      "type": "format",
      "popularity": 95,
      "usage": "2.4k videos this week"
    },
    {
      "id": "trend-2",
      "name": "Unboxing Reveal",
      "type": "format",
      "popularity": 88,
      "usage": "1.8k videos this week"
    }
  ],
  "lastUpdated": "2026-05-30T00:00:00.000Z"
}
```

## 🎨 Video Styles

- **trending**: Dynamic, viral TikTok style, energetic
- **funny**: Comedic, humorous, lighthearted
- **emotional**: Touching, heartfelt, story-driven
- **professional**: Clean, polished, sleek

## 📐 Aspect Ratios

- `9:16` - TikTok (vertical video)
- `1:1` - Instagram (square)
- `16:9` - YouTube (horizontal)

## ⏱️ Video Durations

- 15 seconds - Quick, viral content
- 30 seconds - More detail
- 60 seconds - In-depth showcase

## 🔧 Configuration

Environment variables (in `.env` file):

```env
PORT=3001
```

## 📝 Notes

- The backend is configured to work with TikTok Shop and Shopee SG URLs
- Product extraction returns mock data for demo purposes (can be extended to real scraping)
- Video generation uses mock responses (can be extended to real PixVerse API integration)
- For production, implement actual web scraping and PixVerse API calls

## 🤝 Integration

The backend is designed to work with the ViralVibe frontend. Set the frontend environment variable:

```env
VITE_API_URL=http://localhost:3001
```

## 📄 License

MIT License - Hackathon Project
