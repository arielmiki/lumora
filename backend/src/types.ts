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
  thumbnailUrl?: string;
  metadata?: {
    generationTime: number;
    trendScore: number;
    suggestions?: string[];
  };
}

export interface GenerateRequest {
  productUrl: string;
  productData: Product;
  style: string;
  duration: number;
  aspectRatio: string;
}
