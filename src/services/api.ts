import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
    const formData = new FormData();
    formData.append('file', file);
    if (productData) formData.append('productData', JSON.stringify(productData));
    if (pdpUrl) formData.append('pdpUrl', pdpUrl);

    const response = await api.post('/api/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.error || 'Failed to upload video');
    }

    return response.data.video as UploadedVideo;
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
