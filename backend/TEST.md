# Product Scraper Test

This file contains test commands to verify the product scraping functionality.

## Test TikTok Shop

```bash
curl -X POST http://localhost:3001/api/product/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.tiktok.com/shop/product/example"}' \
  2>/dev/null | jq .
```

## Test Shopee SG

```bash
curl -X POST http://localhost:3001/api/product/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://shopee.sg/example"}' \
  2>/dev/null | jq .
```

## Test Video Generation

```bash
# 1. Start generation
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "productData": {
      "title": "Test Product",
      "description": "A test product",
      "price": "S$99.00",
      "image": "https://example.com/image.jpg",
      "store": "TikTok Shop"
    },
    "style": "trending",
    "duration": 15,
    "aspectRatio": "9:16"
  }' \
  2>/dev/null | jq .
```

## Expected Output

### Successful Product Extraction

```json
{
  "success": true,
  "product": {
    "title": "Product Title",
    "description": "Product description...",
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

### Successful Video Generation

```json
{
  "success": true,
  "task": {
    "id": "task_123456789_abc",
    "status": "processing",
    "prompt": "Product showcase video: ...",
    "createdAt": "2026-05-30T00:00:00.000Z"
  },
  "message": "Video generation started. Poll /api/generate/:taskId for status."
}
```

## Manual Testing

1. Open your browser to http://localhost:5173/
2. Navigate to the Studio (`/studio`)
3. Paste a real TikTok Shop or Shopee SG product URL
4. Click "Extract" to see real product data being scraped

## Notes

- TikTok Shop and Shopee may block scraping requests
- If you get 403 errors, the site requires authentication
- Some products may not extract all fields
- The scraper uses realistic user-agents to avoid blocking
