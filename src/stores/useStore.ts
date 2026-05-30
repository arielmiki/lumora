import { create } from 'zustand';

export interface Product {
  title: string;
  description: string;
  price: string;
  image: string;
  rating?: number;
  reviews?: number;
  store?: string;
  url: string;
}

export interface VideoProject {
  id: string;
  productUrl: string;
  productData: Product;
  style: string;
  duration: number;
  aspectRatio: string;
  templateId?: string;
  status: 'processing' | 'ready' | 'failed';
  videoUrl: string;
  downloadUrl?: string;
  thumbnailUrl: string;
  metadata: {
    generationTime: number;
    trendScore: number;
    suggestions?: string[];
    pixVerseUrl?: string;
    pixVerseId?: string;
    pixVerseMp4Url?: string;
    pdpUrl?: string;
    shotRenders?: Array<{
      index: number;
      pixVerseUrl: string;
      pixVerseId: string;
      mp4Url: string;
      thumbnailUrl: string;
    }>;
    promptPack?: {
      shotPrompts: Array<{
        index: number;
        sceneDescription: string;
        cameraMovement: string;
        subjectAction: string;
        pixVersePrompt: string;
        suggestedDuration: number;
        aspectRatio: string;
      }>;
      captions: string[];
      hashtags: string[];
      plannedDuration: number;
      shotCount: number;
    };
  };
  isPublic: boolean;
  createdAt: Date;
}

export interface Template {
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

interface StoreState {
  recentProjects: VideoProject[];
  templates: Template[];
  currentProduct: Product | null;
  isGenerating: boolean;
  generationProgress: number;
  
  addProject: (project: VideoProject) => void;
  setProjectPublic: (projectId: string, isPublic: boolean) => void;
  setCurrentProduct: (product: Product | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  loadTemplates: () => void;
}

const STORAGE_KEY = 'lumora_recentProjects_v1';

function loadRecentProjects(): VideoProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Omit<VideoProject, 'createdAt'> & { createdAt: string }>;
    return parsed.map((p) => ({ ...p, isPublic: Boolean(p.isPublic), createdAt: new Date(p.createdAt) }));
  } catch {
    return [];
  }
}

function persistRecentProjects(projects: VideoProject[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        projects.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
        })),
      ),
    );
  } catch {
  }
}

export const useStore = create<StoreState>((set, get) => ({
  recentProjects: typeof window === 'undefined' ? [] : loadRecentProjects(),
  templates: [],
  currentProduct: null,
  isGenerating: false,
  generationProgress: 0,

  addProject: (project) => {
    set((state) => {
      const next = [project, ...state.recentProjects.filter((p) => p.id !== project.id)].slice(0, 50);
      persistRecentProjects(next);
      return { recentProjects: next };
    });
  },

  setProjectPublic: (projectId, isPublic) => {
    set((state) => {
      const next = state.recentProjects.map((p) => (p.id === projectId ? { ...p, isPublic } : p));
      persistRecentProjects(next);
      return { recentProjects: next };
    });
  },

  setCurrentProduct: (product) => {
    set({ currentProduct: product });
  },

  setIsGenerating: (isGenerating) => {
    set({ isGenerating });
  },

  setGenerationProgress: (progress) => {
    set({ generationProgress: progress });
  },

  loadTemplates: () => {
    const mockTemplates: Template[] = [
      {
        id: '1',
        name: 'Trending Showcase',
        description: 'Perfect for highlighting product features with dynamic animations',
        category: 'trending',
        thumbnail: '/templates/trending.jpg',
        preview: '/templates/trending-preview.mp4',
        config: {
          defaultDuration: 15,
          defaultStyle: 'trending',
          effects: ['zoom', 'fade', 'slide'],
          music: 'upbeat-pop',
        },
        popularity: 2400,
        isPremium: false,
      },
      {
        id: '2',
        name: 'Unboxing Reveal',
        description: 'Exciting unboxing experience with suspenseful reveals',
        category: 'unboxing',
        thumbnail: '/templates/unboxing.jpg',
        preview: '/templates/unboxing-preview.mp4',
        config: {
          defaultDuration: 30,
          defaultStyle: 'emotional',
          effects: ['tear', 'reveal', 'spotlight'],
          music: 'mystery-unbox',
        },
        popularity: 1800,
        isPremium: false,
      },
      {
        id: '3',
        name: 'Lifestyle Integration',
        description: 'Show products in real-life scenarios and settings',
        category: 'lifestyle',
        thumbnail: '/templates/lifestyle.jpg',
        preview: '/templates/lifestyle-preview.mp4',
        config: {
          defaultDuration: 15,
          defaultStyle: 'professional',
          effects: ['pan', 'smooth', 'cinematic'],
          music: 'chill-lifestyle',
        },
        popularity: 1200,
        isPremium: false,
      },
      {
        id: '4',
        name: 'Product Demo',
        description: 'Detailed product demonstration with key features highlighted',
        category: 'demo',
        thumbnail: '/templates/demo.jpg',
        preview: '/templates/demo-preview.mp4',
        config: {
          defaultDuration: 30,
          defaultStyle: 'professional',
          effects: ['zoom', 'highlight', 'pointer'],
          music: 'corporate-tech',
        },
        popularity: 950,
        isPremium: false,
      },
      {
        id: '5',
        name: 'Transformation Magic',
        description: 'Show dramatic before/after transformations',
        category: 'transformation',
        thumbnail: '/templates/transformation.jpg',
        preview: '/templates/transformation-preview.mp4',
        config: {
          defaultDuration: 15,
          defaultStyle: 'emotional',
          effects: ['morph', 'glow', 'flash'],
          music: 'epic-buildup',
        },
        popularity: 890,
        isPremium: true,
      },
    ];
    set({ templates: mockTemplates });
  },
}));
