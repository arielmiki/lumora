# 🎬 ViralVibe - End-to-End Test Guide

## ✅ CORS Issue Fixed!

I've fixed the CORS configuration to allow requests from the frontend (localhost:5173) to the backend (localhost:3001).

## 🚀 Both Servers Running

- **Frontend**: http://localhost:5173/ ✅
- **Backend**: http://localhost:3001 ✅
- **CORS Test Page**: Open `test-cors.html` in your browser

## 🧪 How to Test

### Option 1: Use the CORS Test Page

1. Open the file in your browser:
   ```
   file:///Users/arielmiki/Workspace/trae-hack/pixverse/test-cors.html
   ```

2. Click the test buttons to verify CORS is working:
   - Health Check
   - Product Extraction
   - Video Generation
   - Poll Status
   - Full End-to-End Flow

### Option 2: Test from Terminal

```bash
# Test 1: Health Check
curl http://localhost:3001/api/health

# Test 2: Generate Video
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "productData": {
      "title": "Test Product",
      "description": "A test product",
      "price": "S$99.90",
      "image": "https://example.com/image.jpg",
      "store": "TikTok Shop"
    },
    "style": "trending",
    "duration": 15,
    "aspectRatio": "9:16"
  }'

# Test 3: Poll Status (replace TASK_ID with actual ID)
curl http://localhost:3001/api/generate/TASK_ID
```

### Option 3: Use the Web UI

1. Open **http://localhost:5173/**
2. Navigate to **Studio** (`/studio`)
3. Paste a TikTok Shop URL
4. Click **Extract** to scrape product
5. Select style, duration, aspect ratio
6. Click **Generate Video**
7. Watch the progress!

## 🔍 What Was Fixed

### CORS Configuration

**Before:**
```typescript
app.use(cors());  // Basic CORS
```

**After:**
```typescript
app.use(cors({
  origin: '*',  // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Handle preflight requests
app.options('*', cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

### API Logging

Added interceptors to the API service for better debugging:
- Request logging
- Response logging
- Error details

## 📋 Test Flow

### Full End-to-End Test

1. **Health Check** → Verify backend is running
2. **Product Extraction** → Scrape product from URL (may fail for real sites)
3. **Video Generation** → Start generation task
4. **Poll Status** → Check generation progress
5. **Completion** → Video ready with stats

### Expected Output

```
1️⃣ Health Check: ✅ {"status":"healthy","timestamp":"...","scraper":"ready"}

2️⃣ Video Generation: ✅ 
   Task ID: task_123456789_abc

3️⃣ Poll Status: ✅
   Poll 1: processing (15%)
   Poll 2: processing (28%)
   Poll 3: rendering (45%)
   Poll 4: rendering (67%)
   Poll 5: completed (100%)
   
🎉 Video Ready!
```

## 🎯 Testing Real URLs

### Test with TikTok Shop
```
https://www.tiktok.com/shop/product/example
```

### Test with Shopee SG
```
https://shopee.sg/example-product
```

**Note:** Real product scraping may fail due to:
- Anti-bot measures
- Authentication requirements
- JavaScript rendering

The UI shows errors gracefully if scraping fails.

## 🐛 Troubleshooting

### Still getting CORS errors?

1. **Check backend is running:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Check frontend is running:**
   - Open http://localhost:5173/

3. **Clear browser cache:**
   - Press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

4. **Check browser console:**
   - Press F12 → Console tab
   - Look for CORS error messages

### Check Backend Logs

Look at the backend terminal for:
- Incoming requests
- CORS headers being set
- Error messages

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/product/extract` | POST | Scrape product |
| `/api/generate` | POST | Start generation |
| `/api/generate/:id` | GET | Poll status |
| `/api/generate/:id/cancel` | POST | Cancel task |
| `/api/trends` | GET | Get trends |

## 🎨 Frontend Features

### Dashboard (`/dashboard`)
- Quick generate widget
- Recent projects
- Trending section

### Studio (`/studio`)
- Product link input
- Style selector
- Duration selector
- Aspect ratio selector
- Real-time progress
- Cancel button
- Video stats

### Templates (`/templates`)
- Template gallery
- Category filters
- One-click use

## 🚀 Next Steps

1. **Test the UI** → Go to http://localhost:5173/studio
2. **Extract a product** → Paste a URL and click Extract
3. **Generate a video** → Click Generate Video
4. **Watch progress** → See real-time status updates
5. **Download** → When complete, download your video

## 📝 Notes

- Video generation is **mock** (simulated progress)
- Real PixVerse integration requires API key
- Product scraping may fail on real sites
- CORS is now properly configured for development

## 🎉 Success Criteria

✅ Backend API responds to requests
✅ Frontend can call backend without CORS errors
✅ Video generation starts successfully
✅ Progress polling works
✅ UI updates in real-time
✅ Error handling works

**If all tests pass, you're ready for the hackathon! 🚀**
