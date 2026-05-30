import axios from 'axios';
import * as cheerio from 'cheerio';
import type { Product } from './types.js';

class ProductScraper {
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  ];

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  async scrape(url: string): Promise<Product> {
    console.log('Starting to scrape:', url);

    const lower = url.toLowerCase();
    if (
      lower.includes('tiktok.com/shop') ||
      lower.includes('shop.tiktok.com') ||
      lower.includes('tiktokshop.') ||
      /tiktok\.com.*\/product\//.test(lower) ||
      /vt\.tiktok\.com/.test(lower)
    ) {
      return this.scrapeTikTokShop(url);
    } else if (lower.includes('shopee.sg')) {
      return this.scrapeShopee(url);
    }

    throw new Error('Unsupported marketplace. Please use TikTok Shop or Shopee SG URLs.');
  }

  private extractTikTokProductId(url: string): string | null {
    const patterns = [
      /\/pdp\/(?:[^/?#]+\/)?(\d{10,})/i,
      /\/view\/product\/(\d{10,})/i,
      /\/product\/(?:[^/?#]+\/)?(\d{10,})/i,
      /productId=(\d{10,})/i,
      /product_id=(\d{10,})/i,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  private normalizeImageUrl(src: any): string {
    if (!src) return '';
    let s: string | undefined;
    if (typeof src === 'string') {
      s = src;
    } else if (typeof src === 'object') {
      s =
        src.url_list?.[0] ||
        src.urlList?.[0] ||
        src.url ||
        (typeof src.image === 'object' ? this.normalizeImageUrl(src.image) : undefined) ||
        src.src;
    }
    if (!s) return '';
    s = String(s).trim();
    if (s.startsWith('//')) s = 'https:' + s;
    if (!/^https?:\/\//i.test(s)) return '';
    return s;
  }

  private isTikTokShopHomepageFallback(text: string): boolean {
    if (!text) return false;
    const t = text.toLowerCase();
    return (
      t.includes('free shipping on clothing') ||
      t.includes('tiktok shop singapore') ||
      t.includes('discover deals on clothing') ||
      t.includes('tts-logo')
    );
  }

  private deepFindTikTokProduct(html: string): {
    title?: string;
    price?: string;
    image?: string;
    description?: string;
    images?: string[];
    rating?: number;
    reviews?: number;
    store?: string;
  } | null {
    const scriptRegex = /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g;
    let m: RegExpExecArray | null;
    const candidates: any[] = [];
    while ((m = scriptRegex.exec(html)) !== null) {
      try {
        const json = JSON.parse(m[1]);
        candidates.push(json);
      } catch {
        /* ignore non-JSON */
      }
    }

    const result: {
      title?: string;
      price?: string;
      image?: string;
      description?: string;
      images?: string[];
      rating?: number;
      reviews?: number;
      store?: string;
    } = {};

    const visit = (node: any, depth = 0) => {
      if (!node || depth > 18) return;
      if (Array.isArray(node)) {
        for (const it of node) visit(it, depth + 1);
        return;
      }
      if (typeof node !== 'object') return;

      const title =
        node.productName ||
        node.product_name ||
        node.product_title ||
        node.productTitle ||
        node.title ||
        node.name;
      const priceField =
        node.salePrice ||
        node.sale_price ||
        node.discounted_price ||
        node.price ||
        node.originalPrice ||
        node.original_price ||
        node.price_info ||
        node.priceFormatted ||
        node.formatted_price;
      const image =
        this.normalizeImageUrl(
          node.coverImg ||
            node.cover_img ||
            node.cover ||
            node.image ||
            node.main_image ||
            node.thumbnailImageUrl ||
            node.thumb_url ||
            node.firstFrameImage ||
            (Array.isArray(node.images) ? node.images[0] : null)
        ) || '';

      if (typeof title === 'string' && title.trim().length > 3 && (image || priceField)) {
        if (!result.title) result.title = title.trim();
        if (!result.image && image) result.image = image;
        if (!result.price && priceField) {
          if (typeof priceField === 'string') {
            result.price = priceField.trim();
          } else if (typeof priceField === 'object') {
            const num = priceField.price_str || priceField.priceStr || priceField.priceFormatted || priceField.formatted || priceField.priceVal || priceField.price || priceField.amount || priceField.value;
            const currency = priceField.currency || priceField.currencyCode || priceField.currencySymbol || '';
            if (num) {
              result.price = typeof num === 'string' ? num : `${currency}${num}`.trim();
            }
          }
        }
        if (!result.description) {
          const desc = node.productDescription || node.product_description || node.description || node.desc;
          if (typeof desc === 'string') {
            const trimmed = desc.trim();
            const looksLikeJson = /^[\[{]/.test(trimmed);
            if (trimmed.length > 0 && trimmed.length < 1200 && !looksLikeJson) {
              result.description = trimmed;
            }
          }
        }
        if (!result.rating) {
          const r = node.rating || node.starRating || node.star_rating || node.reviewScore || node.review_score;
          const rn = typeof r === 'string' ? parseFloat(r) : Number(r);
          if (!Number.isNaN(rn) && rn > 0 && rn <= 5) result.rating = rn;
        }
        if (!result.reviews) {
          const rv = node.reviewCount || node.review_count || node.commentCount || node.comment_count || node.totalReviewCount;
          const rvn = typeof rv === 'string' ? parseInt(rv, 10) : Number(rv);
          if (!Number.isNaN(rvn) && rvn > 0) result.reviews = rvn;
        }
        if (!result.store) {
          const shop = node.shopName || node.shop_name || node.sellerName || node.seller_name || (node.shop && (node.shop.name || node.shop.shopName));
          if (typeof shop === 'string' && shop.trim().length > 0) result.store = shop.trim();
        }
        if (!result.images && Array.isArray(node.images)) {
          const imgs = node.images.map((i: any) => this.normalizeImageUrl(i)).filter(Boolean);
          if (imgs.length) result.images = imgs.slice(0, 5);
        }
      }

      for (const key of Object.keys(node)) {
        visit(node[key], depth + 1);
      }
    };

    for (const c of candidates) visit(c);
    return result.title || result.image || result.price ? result : null;
  }

  private async scrapeTikTokShop(url: string): Promise<Product> {
    console.log('Scraping TikTok Shop:', url);

    const productId = this.extractTikTokProductId(url);
    const candidates: string[] = [url];
    if (productId) {
      const synthetic = [
        `https://www.tiktok.com/shop/pdp/${productId}`,
        `https://shop.tiktok.com/view/product/${productId}`,
      ];
      for (const s of synthetic) {
        if (!candidates.includes(s)) candidates.push(s);
      }
    }

    const headers = {
      'User-Agent': this.getRandomUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-SG,en-US;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'sec-ch-ua': '"Chromium";v="120", "Google Chrome";v="120", "Not-A.Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
    };

    let html = '';
    let usedUrl = url;
    let lastError: any = null;
    for (const candidate of candidates) {
      try {
        const response = await axios.get(candidate, {
          headers,
          timeout: 15000,
          maxRedirects: 5,
          validateStatus: (s) => s >= 200 && s < 400,
        });
        const body = String(response.data || '');
        if (body.length < 8000) continue;
        html = body;
        usedUrl = candidate;
        break;
      } catch (err: any) {
        lastError = err;
        if (err.response?.status === 404) continue;
        if (err.response?.status === 403) continue;
      }
    }

    if (!html) {
      if (lastError?.response?.status === 403) {
        throw new Error('Access denied. TikTok Shop may require authentication.');
      }
      if (lastError?.response?.status === 404) {
        throw new Error('Product not found. Please check the URL.');
      }
      throw new Error(`Failed to scrape TikTok Shop: ${lastError?.message || 'unreachable'}`);
    }

    const $ = cheerio.load(html);
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    const ogDesc = $('meta[property="og:description"]').attr('content') || '';
    const homepageFallback =
      this.isTikTokShopHomepageFallback(ogTitle) ||
      this.isTikTokShopHomepageFallback(ogImage) ||
      this.isTikTokShopHomepageFallback(ogDesc);

    const found = this.deepFindTikTokProduct(html) || {};

    let title = (found.title || (!homepageFallback ? ogTitle : '') || '').trim();
    let image = found.image || this.normalizeImageUrl(!homepageFallback ? ogImage : '');
    let description = (found.description || (!homepageFallback ? ogDesc : '') || '').trim();
    let price = found.price || '';
    const rating = found.rating;
    const reviews = found.reviews;
    const store = found.store || 'TikTok Shop';

    if (!title) {
      const h1 = $('h1').first().text().trim();
      if (h1 && h1.length > 2) title = h1;
    }

    if (!image) {
      const ld = $('script[type="application/ld+json"]').html();
      if (ld) {
        try {
          const data = JSON.parse(ld);
          const candidate = Array.isArray(data?.image) ? data.image[0] : data?.image;
          image = this.normalizeImageUrl(candidate);
          if (!title && data?.name) title = String(data.name);
          if (!description && data?.description) description = String(data.description);
        } catch {
          /* ignore */
        }
      }
    }

    if (homepageFallback && !found.title) {
      throw new Error(
        'TikTok Shop returned a region-redirect homepage instead of the product page — try the canonical /shop/pdp/<id> URL, or paste details manually.'
      );
    }

    const images = (found.images && found.images.length ? found.images : image ? [image] : []).slice(0, 5);

    const product: Product = {
      title: title || 'Product',
      description: description || '',
      price: price || '',
      currency: 'SGD',
      image: image || '',
      images,
      rating,
      reviews,
      store,
      url: usedUrl,
    };

    console.log('TikTok Shop product:', {
      title: product.title,
      hasImage: !!product.image,
      price: product.price || '(not in SSR — manual entry needed)',
    });
    return product;
  }

  private async scrapeShopee(url: string): Promise<Product> {
    console.log('Scraping Shopee SG...');

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 15000,
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Shopee uses pre-rendered JSON in script tags
      let productData: any = null;

      $('script').each((i, el) => {
        const content = $(el).html();
        if (content && content.includes('"product"')) {
          try {
            const match = content.match(/"product":\s*({.*?}),/s);
            if (match) {
              productData = JSON.parse(match[1]);
            }
          } catch (e) {
            // Try another pattern
            const scriptMatch = content.match(/window\.__PRODUCT_DETAIL_STATE__\s*=\s*({.*?});/s);
            if (scriptMatch) {
              productData = JSON.parse(scriptMatch[1]);
            }
          }
        }
      });

      // Extract from meta tags
      let title = $('meta[property="og:title"]').attr('content') ||
                  $('meta[name="title"]').attr('content') ||
                  $('h1').first().text().trim();

      let description = $('meta[property="og:description"]').attr('content') || '';

      let image = $('meta[property="og:image"]').attr('content') || '';

      // Try JSON-LD
      const jsonLd = $('script[type="application/ld+json"]').html();
      if (jsonLd) {
        try {
          const data = JSON.parse(jsonLd);
          if (data.name) title = data.name;
          if (data.description) description = data.description;
          if (data.image) image = Array.isArray(data.image) ? data.image[0] : data.image;
        } catch (e) {
          console.log('JSON-LD parsing failed');
        }
      }

      // Extract price
      let price = $('[data-testid="product-price"], .product-price, [class*="price"]').first().text().trim();
      if (!price || price === '') {
        price = $('span:contains("S$"), .price').first().text().trim();
      }
      if (!price) {
        price = 'S$0.00';
      }

      // Extract rating
      let rating: number | undefined;
      const ratingEl = $('[data-testid="rating"], .rating, [class*="rating"]').first();
      const ratingText = ratingEl.text().trim();
      if (ratingText) {
        const match = ratingText.match(/(\d+\.?\d*)/);
        if (match) rating = parseFloat(match[1]);
      }

      // Extract reviews
      let reviews: number | undefined;
      const reviewsEl = $('[data-testid="reviews-count"], .reviews-count, [class*="review-count"]').first();
      const reviewsText = reviewsEl.text().trim();
      if (reviewsText) {
        const match = reviewsText.match(/[\d,]+/);
        if (match) reviews = parseInt(match[0].replace(/,/g, ''));
      }

      // Get additional images
      const images: string[] = [];
      if (image) images.push(image);

      $('img[src*="product"], img[src*="shopee"], .image-gallery img, [class*="product-image"] img').each((i, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src && !images.includes(src) && !src.includes('placeholder')) {
          images.push(src);
        }
        return images.length < 5;
      });

      const product: Product = {
        title: title || 'Product',
        description: description || 'No description available',
        price: price || 'S$0.00',
        currency: 'SGD',
        image: image || '',
        images: images.length > 0 ? images : [image],
        rating,
        reviews,
        store: 'Shopee SG',
        url,
      };

      console.log('Successfully scraped Shopee product:', product.title);
      return product;

    } catch (error: any) {
      console.error('Shopee scraping error:', error.message);

      if (error.response?.status === 403) {
        throw new Error('Access denied. Shopee may require authentication.');
      } else if (error.response?.status === 404) {
        throw new Error('Product not found. Please check the URL.');
      }

      throw new Error(`Failed to scrape Shopee: ${error.message}`);
    }
  }
}

export default new ProductScraper();
