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

    type Attempt = {
      url: string;
      status: number;
      length: number;
      ogTitle: string;
      ogImage: string;
      ogDesc: string;
      homepageFallback: boolean;
      title: string;
      image: string;
      description: string;
      price: string;
      images?: string[];
      rating?: number;
      reviews?: number;
      store?: string;
    };

    let best: Attempt | null = null;
    let lastError: any = null;
    const attempts: Array<{ url: string; status?: number; len?: number; err?: string }> = [];

    for (const candidate of candidates) {
      try {
        const response = await axios.get(candidate, {
          headers,
          timeout: 20000,
          maxRedirects: 5,
          validateStatus: (s) => s >= 200 && s < 400,
        });
        const body = String(response.data || '');
        attempts.push({ url: candidate, status: response.status, len: body.length });
        if (!body) continue;

        const $page = cheerio.load(body);
        const ogTitle = $page('meta[property="og:title"]').attr('content') || '';
        const ogImage = $page('meta[property="og:image"]').attr('content') || '';
        const ogDesc = $page('meta[property="og:description"]').attr('content') || '';
        const homepageFallback =
          this.isTikTokShopHomepageFallback(ogTitle) ||
          this.isTikTokShopHomepageFallback(ogImage) ||
          this.isTikTokShopHomepageFallback(ogDesc);

        const found = this.deepFindTikTokProduct(body) || {};

        const title = (found.title || (!homepageFallback ? ogTitle : '') || '').trim();
        const image = found.image || this.normalizeImageUrl(!homepageFallback ? ogImage : '');
        const description = (found.description || (!homepageFallback ? ogDesc : '') || '').trim();
        const price = found.price || '';

        const attempt: Attempt = {
          url: candidate,
          status: response.status,
          length: body.length,
          ogTitle,
          ogImage,
          ogDesc,
          homepageFallback,
          title,
          image,
          description,
          price,
          images: found.images,
          rating: found.rating,
          reviews: found.reviews,
          store: found.store,
        };

        if (title && image && !homepageFallback) {
          best = attempt;
          break;
        }
        if (!best || (attempt.title && !best.title) || (attempt.image && !best.image)) {
          best = attempt;
        }
      } catch (err: any) {
        lastError = err;
        attempts.push({ url: candidate, status: err.response?.status, err: err.message });
      }
    }

    if (!best) {
      console.error('TikTok Shop scrape — no candidate returned a body:', JSON.stringify(attempts));
      if (lastError?.response?.status === 403) {
        throw new Error('Access denied. TikTok Shop may require authentication.');
      }
      if (lastError?.response?.status === 404) {
        throw new Error('Product not found. Please check the URL.');
      }
      throw new Error(`Failed to scrape TikTok Shop: ${lastError?.message || 'unreachable'}`);
    }

    console.log('TikTok Shop scrape attempts:', JSON.stringify(attempts), 'chose:', best.url, 'len:', best.length);

    const usedUrl = best.url;
    const title = best.title;
    const image = best.image;
    const description = best.description;
    const price = best.price;
    const rating = best.rating;
    const reviews = best.reviews;
    const store = best.store || 'TikTok Shop';

    if (best.homepageFallback && !title && !image) {
      throw new Error(
        'TikTok Shop served the regional homepage instead of the product page — likely an IP/region block. Paste the details manually, or hit the backend from a Singapore region.'
      );
    }

    const images = (best.images && best.images.length ? best.images : image ? [image] : []).slice(0, 5);

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

  private extractShopeeIds(url: string): { shopId: string; itemId: string } | null {
    const m = url.match(/-i\.(\d+)\.(\d+)/);
    if (m) return { shopId: m[1], itemId: m[2] };
    const m2 = url.match(/\/product\/(\d+)\/(\d+)/);
    if (m2) return { shopId: m2[1], itemId: m2[2] };
    return null;
  }

  private titleFromShopeeSlug(url: string): string {
    let slug = '';
    try {
      const u = new URL(url);
      const last = u.pathname.split('/').filter(Boolean).pop() || '';
      slug = decodeURIComponent(last);
    } catch {
      slug = decodeURIComponent(url.split('/').filter(Boolean).pop() || '');
    }
    slug = slug.replace(/-i\.\d+\.\d+.*$/i, '');
    slug = slug.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '');
    slug = slug.replace(/-+/g, ' ').replace(/\s+/g, ' ').trim();
    return slug;
  }

  private async tryShopeeItemApi(shopId: string, itemId: string): Promise<any | null> {
    const endpoints = [
      `https://shopee.sg/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`,
      `https://shopee.sg/api/v4/pdp/get_pc?shop_id=${shopId}&item_id=${itemId}`,
    ];
    for (const ep of endpoints) {
      try {
        const r = await axios.get(ep, {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            Accept: 'application/json',
            'Accept-Language': 'en-SG,en;q=0.9',
            Referer: 'https://shopee.sg/',
            'x-api-source': 'pc',
            'x-shopee-language': 'en',
          },
          timeout: 12000,
          validateStatus: (s) => s >= 200 && s < 500,
        });
        if (r.status === 200 && r.data && !r.data.error) return r.data;
      } catch {
        /* try next */
      }
    }
    return null;
  }

  private async scrapeShopee(url: string): Promise<Product> {
    console.log('Scraping Shopee SG:', url);

    const ids = this.extractShopeeIds(url);
    let title = '';
    let description = '';
    let image = '';
    let price = '';
    let rating: number | undefined;
    let reviews: number | undefined;
    const images: string[] = [];

    if (ids) {
      const apiData = await this.tryShopeeItemApi(ids.shopId, ids.itemId);
      const item = apiData?.data?.item || apiData?.item || apiData?.data;
      if (item && typeof item === 'object') {
        title = item.name || item.title || '';
        description = item.description || '';
        if (typeof item.price === 'number') {
          const p = item.price / 100000;
          price = `S$${p.toFixed(2)}`;
        } else if (typeof item.price_min === 'number') {
          const p = item.price_min / 100000;
          price = `S$${p.toFixed(2)}`;
        }
        if (Array.isArray(item.images)) {
          for (const id of item.images.slice(0, 5)) {
            images.push(`https://down-sg.img.susercontent.com/file/${id}`);
          }
          image = images[0] || '';
        }
        const rs = typeof item.item_rating?.rating_star === 'number' ? item.item_rating.rating_star : undefined;
        if (rs && rs > 0) rating = Math.round(rs * 10) / 10;
        const rc = item.cmt_count || item.item_rating?.rating_count?.[0];
        if (typeof rc === 'number' && rc > 0) reviews = rc;
      }
    }

    if (!title) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-SG,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            Connection: 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
          timeout: 12000,
          validateStatus: (s) => s >= 200 && s < 400,
        });
        const $ = cheerio.load(String(response.data || ''));
        const og = $('meta[property="og:title"]').attr('content');
        if (og && !/^shopee\b/i.test(og.trim())) title = og.trim();
        if (!image) {
          const ogImg = $('meta[property="og:image"]').attr('content');
          if (ogImg) image = this.normalizeImageUrl(ogImg);
        }
        if (!description) {
          const ogDesc = $('meta[property="og:description"]').attr('content');
          if (ogDesc) description = ogDesc.trim();
        }
      } catch (err: any) {
        console.log('Shopee HTML fallback failed:', err?.message);
      }
    }

    if (!title) {
      title = this.titleFromShopeeSlug(url);
    }

    const product: Product = {
      title: title || 'Product',
      description: description || '',
      price: price || '',
      currency: 'SGD',
      image: image || '',
      images: images.length ? images : image ? [image] : [],
      rating,
      reviews,
      store: 'Shopee SG',
      url,
    };

    console.log('Shopee SG product:', {
      title: product.title,
      hasImage: !!product.image,
      price: product.price || '(not available — manual entry needed)',
      via: image ? 'api+slug' : 'slug-only',
    });

    return product;
  }
}

export default new ProductScraper();
