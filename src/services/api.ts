import axios from 'axios';
import { upload } from '@vercel/blob/client';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function extractVideoThumbnail(file: File, maxWidth = 720): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      video.load();
    };

    const fail = (msg: string) => {
      cleanup();
      reject(new Error(msg));
    };

    const timeout = window.setTimeout(() => fail('Thumbnail extraction timed out'), 15000);

    video.addEventListener('error', () => fail('Video failed to load'), { once: true });

    video.addEventListener(
      'loadedmetadata',
      () => {
        const seekTo = Math.min(Math.max(video.duration * 0.1, 0.5), 1.2);
        video.currentTime = isFinite(seekTo) ? seekTo : 0;
      },
      { once: true }
    );

    video.addEventListener(
      'seeked',
      () => {
        try {
          const srcW = video.videoWidth || 720;
          const srcH = video.videoHeight || 1280;
          const scale = Math.min(1, maxWidth / srcW);
          const w = Math.round(srcW * scale);
          const h = Math.round(srcH * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) return fail('Canvas 2D context unavailable');
          ctx.drawImage(video, 0, 0, w, h);
          canvas.toBlob(
            (blob) => {
              window.clearTimeout(timeout);
              cleanup();
              if (!blob) return reject(new Error('Canvas returned empty blob'));
              resolve(blob);
            },
            'image/jpeg',
            0.85
          );
        } catch (e) {
          fail((e as Error).message);
        }
      },
      { once: true }
    );
  });
}

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export interface Product {
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

export interface VideoTask {
  id: string;
  status: 'processing' | 'rendering' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  videoUrl?: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  metadata?: {
    generationTime: number;
    trendScore: number;
    suggestions?: string[];
    pixVerseUrl?: string;
    pixVerseId?: string;
  };
}

export interface PixVerseResolvedVideo {
  id: number;
  pixverseUrl: string;
  mp4Url: string;
  thumbnailUrl: string;
  aspectRatio?: string;
  duration?: number;
  prompt?: string;
}

export interface UploadedVideo {
  id: string;
  videoUrl: string;
  downloadUrl: string;
  thumbnailUrl: string;
  pdpUrl?: string;
}

export const apiService = {
  async extractProduct(url: string): Promise<Product> {
    try {
      console.log('Extracting product from:', url);
      const response = await api.post('/api/product/extract', { url });
      
      if (response.data.success) {
        console.log('Product extracted:', response.data.product.title);
        return response.data.product;
      }
      
      throw new Error(response.data.error || 'Failed to extract product');
    } catch (error: any) {
      console.error('Product extraction failed:', error.message);
      throw error;
    }
  },

  async resolvePixVerse(input: string): Promise<PixVerseResolvedVideo> {
    const response = await api.post('/api/pixverse/resolve', { url: input, id: input });
    if (!response.data?.success) {
      throw new Error(response.data?.error || 'Failed to resolve PixVerse video');
    }
    return response.data.video as PixVerseResolvedVideo;
  },

  async uploadVideo(file: File, productData?: Product, pdpUrl?: string): Promise<UploadedVideo> {
    const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
    const safeTitle = (productData?.title || 'lumora-shot')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'lumora-shot';
    const stamp = Date.now();
    const videoPath = `videos/${safeTitle}-${stamp}.${ext}`;

    let thumbBlob: Blob | null = null;
    try {
      thumbBlob = await extractVideoThumbnail(file);
    } catch (e) {
      console.warn('Thumbnail extraction failed; falling back to video URL.', e);
    }

    const [videoUploaded, thumbUploaded] = await Promise.all([
      upload(videoPath, file, {
        access: 'public',
        handleUploadUrl: '/api/upload/video',
        contentType: file.type || 'video/mp4',
      }),
      thumbBlob
        ? upload(`thumbnails/${safeTitle}-${stamp}.jpg`, thumbBlob, {
            access: 'public',
            handleUploadUrl: '/api/upload/thumbnail',
            contentType: 'image/jpeg',
          })
        : Promise.resolve(null),
    ]);

    return {
      id: videoUploaded.pathname,
      videoUrl: videoUploaded.url,
      downloadUrl: videoUploaded.downloadUrl || videoUploaded.url,
      thumbnailUrl: thumbUploaded?.url || videoUploaded.url,
      pdpUrl,
    };
  },

  async getTrends(): Promise<any[]> {
    try {
      const response = await api.get('/api/trends');
      if (response.data.success) {
        return response.data.trends;
      }
      throw new Error('Failed to fetch trends');
    } catch (error: any) {
      console.error('Trends fetch failed:', error.message);
      throw error;
    }
  },

  async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/api/health');
      console.log('Health check:', response.data);
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Health check failed');
      return false;
    }
  },
};

export default api;
