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

    // Detect platform
    if (url.includes('tiktok.com') || url.includes('shop.tiktok')) {
      return this.scrapeTikTokShop(url);
    } else if (url.includes('shopee.sg')) {
      return this.scrapeShopee(url);
    }

    throw new Error('Unsupported marketplace. Please use TikTok Shop or Shopee SG URLs.');
  }

  private async scrapeTikTokShop(url: string): Promise<Product> {
    console.log('Scraping TikTok Shop...');

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

      // Try to extract from meta tags first (most reliable)
      let title = $('meta[property="og:title"]').attr('content') ||
                  $('meta[name="title"]').attr('content') ||
                  $('h1').first().text().trim();

      let description = $('meta[property="og:description"]').attr('content') ||
                       $('meta[name="description"]').attr('content') ||
                       '';

      let image = $('meta[property="og:image"]').attr('content') || '';

      // Try JSON-LD structured data
      const jsonLd = $('script[type="application/ld+json"]').html();
      if (jsonLd) {
        try {
          const data = JSON.parse(jsonLd);
          if (data.name) title = data.name;
          if (data.description) description = data.description;
          if (data.image) image = Array.isArray(data.image) ? data.image[0] : data.image;
        } catch (e) {
          console.log('JSON-LD parsing failed:', e);
        }
      }

      // Try to extract from page content
      if (!title || title === '') {
        title = $('[data-testid="product-title"], .product-title, h1').first().text().trim() || 'Product';
      }

      if (!description) {
        description = $('[data-testid="product-description"], .description, p').first().text().trim() ||
                      'High-quality product';
      }

      // Extract price - TikTok Shop format
      let price = $('[data-testid="product-price"], .price, [class*="price"]').first().text().trim();
      if (!price) {
        price = $('span:contains("S$"), span:contains("$")').first().text().trim() || 'S$0.00';
      }

      // Extract rating
      let rating: number | undefined;
      const ratingText = $('[data-testid="rating"], .rating, [class*="rating"]').first().text().trim();
      if (ratingText) {
        const match = ratingText.match(/(\d+\.?\d*)/);
        if (match) rating = parseFloat(match[1]);
      }

      // Extract reviews count
      let reviews: number | undefined;
      const reviewsText = $('[data-testid="reviews"], .reviews, [class*="review"]').first().text().trim();
      if (reviewsText) {
        const match = reviewsText.match(/(\d+)/);
        if (match) reviews = parseInt(match[1]);
      }

      // Try to get additional images
      const images: string[] = [];
      if (image) images.push(image);

      $('img[src*="product"], img[src*="item"], .product-image img, [class*="gallery"] img').each((i, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src && !images.includes(src)) {
          images.push(src);
        }
        return images.length < 5; // Limit to 5 images
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
        store: 'TikTok Shop',
        url,
      };

      console.log('Successfully scraped TikTok Shop product:', product.title);
      return product;

    } catch (error: any) {
      console.error('TikTok Shop scraping error:', error.message);
      
      // If scraping fails, try to return partial data
      if (error.response?.status === 403) {
        throw new Error('Access denied. TikTok Shop may require authentication.');
      } else if (error.response?.status === 404) {
        throw new Error('Product not found. Please check the URL.');
      }

      throw new Error(`Failed to scrape TikTok Shop: ${error.message}`);
    }
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
