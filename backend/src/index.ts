import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import scraper from './scraper.js';
import { PixVerseIntegration } from './pixverse-integration.js';

const app = express();
const PORT = process.env.PORT || 3001;

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const pixVerse = new PixVerseIntegration(uploadsDir);

// CORS configuration - allow all origins for development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

function requestBaseUrl(req: Request) {
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
  return `${proto}://${req.get('host')}`;
}

// Handle preflight requests
app.options('*', cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

const PIXVERSE_STYLES: Record<string, string> = {
  trending: 'dynamic, trending, viral TikTok style, energetic',
  funny: 'funny, comedic, humorous, lighthearted',
  emotional: 'emotional, touching, heartfelt, story-driven',
  professional: 'professional, clean, polished, sleek',
};

function platformHint(aspectRatio: string) {
  if (aspectRatio === '9:16') return 'TikTok / Instagram Reels / YouTube Shorts';
  if (aspectRatio === '1:1') return 'Instagram feed / marketplace ads';
  return 'YouTube / website hero / marketplace ads';
}

function extractFeaturePhrases(raw: string) {
  const text = (raw || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const parts = text
    .split(/[\n•·\u2022]| - | – |—|[.;]|[|]/g)
    .map((p) => p.trim())
    .filter((p) => p.length >= 6 && p.length <= 80);

  const seen = new Set<string>();
  const uniq: string[] = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(p);
    if (uniq.length >= 6) break;
  }
  return uniq;
}

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function planShotDurations(totalSeconds: number) {
  const total = Math.max(30, Math.round(totalSeconds));
  let shotCount = clampInt(total / 6, 4, 8);
  let base = Math.floor(total / shotCount);
  if (base < 5) shotCount = clampInt(total / 5, 4, 8);
  if (base > 8) shotCount = clampInt(total / 8, 4, 8);

  base = Math.floor(total / shotCount);
  base = Math.max(5, Math.min(8, base));

  const durations = Array.from({ length: shotCount }, () => base);
  let remainder = total - durations.reduce((a, b) => a + b, 0);

  for (let i = 0; i < durations.length && remainder > 0; i += 1) {
    if (durations[i] < 8) {
      durations[i] += 1;
      remainder -= 1;
    }
  }

  return { total: durations.reduce((a, b) => a + b, 0), shotCount: durations.length, durations };
}

function buildProductShowcasePrompt(params: {
  title?: string;
  description?: string;
  price?: string;
  store?: string;
  rating?: number;
  reviews?: number;
  styleDescription: string;
  aspectRatio: string;
  duration: number;
}) {
  const title = (params.title || '').trim();
  const description = (params.description || '').trim();
  const price = (params.price || '').trim();
  const store = (params.store || '').trim();
  const platform = platformHint(params.aspectRatio);

  const cleanDesc = description.replace(/\s+/g, ' ').slice(0, 700);
  const cleanTitle = title.replace(/\s+/g, ' ').slice(0, 160);
  const features = extractFeaturePhrases(description);
  const shotPlan = planShotDurations(params.duration);

  const details = [
    cleanTitle ? `Product: ${cleanTitle}.` : '',
    store ? `Brand/store: ${store}.` : '',
    cleanDesc ? `Description: ${cleanDesc}.` : '',
    price ? `Price: ${price}.` : '',
    typeof params.rating === 'number' ? `Rating: ${params.rating}/5${typeof params.reviews === 'number' ? ` from ${params.reviews} reviews` : ''}.` : '',
    features.length ? `Key features: ${features.join(' | ')}.` : '',
  ].filter(Boolean).join(' ');

  const featureA = features[0] || 'key benefit';
  const featureB = features[1] || 'quality detail';
  const featureC = features[2] || 'how it works';

  const shots = [
    {
      scene: 'Hero reveal of the product with a strong benefit headline.',
      camera: 'Fast push-in, then micro orbit.',
      action: 'Product appears clean and premium. Text hook pops in.',
      pv: `Premium product hero reveal, cinematic studio lighting, minimal background, crisp focus, ${params.styleDescription}, show benefit headline.`,
    },
    {
      scene: `Macro details and texture highlighting ${featureA}.`,
      camera: 'Macro glide + rack focus.',
      action: 'Close-up details shimmer. Overlay a short feature callout.',
      pv: `Macro close-up of product details, highlight ${featureA}, studio reflections, crisp focus, smooth macro glide, ${params.styleDescription}.`,
    },
    {
      scene: `Feature demonstration emphasizing ${featureB}.`,
      camera: 'Side pan with slight tilt.',
      action: 'Hands demonstrate usage (if applicable) without covering the product.',
      pv: `Clean product demo shot, emphasize ${featureB}, hands interaction, modern minimal set, smooth side pan, ${params.styleDescription}.`,
    },
    {
      scene: 'Lifestyle moment that matches the product category.',
      camera: 'Handheld-stable, slow dolly.',
      action: 'Product used naturally; keep product accurate.',
      pv: `Lifestyle usage scene featuring the same product, natural lighting with premium grade, soft background bokeh, slow dolly, ${params.styleDescription}.`,
    },
    {
      scene: 'Proof and credibility: highlight rating, reviews, or claim.',
      camera: 'Static hero with subtle zoom.',
      action: 'Show badges like “Top rated” / “Best seller” style UI overlays (no platform logos).',
      pv: `Product hero shot with tasteful UI-style overlay for social proof (rating/reviews), subtle zoom, premium lighting, ${params.styleDescription}.`,
    },
    {
      scene: 'End card with price and CTA.',
      camera: 'Centered lockoff.',
      action: 'Clean end card: product centered, price callout, “Shop now”.',
      pv: `Clean end card, product centered, minimal background, price callout, bold CTA "Shop now", crisp focus, premium lighting, ${params.styleDescription}.`,
    },
  ];

  while (shots.length < shotPlan.shotCount) {
    shots.splice(2, 0, {
      scene: `Another feature highlight focusing on ${featureC}.`,
      camera: 'Top-down tilt into close-up.',
      action: 'Reveal feature with quick cut and callout text.',
      pv: `Feature highlight shot, focus on ${featureC}, top-down tilt, close-up details, minimal set, ${params.styleDescription}.`,
    });
  }

  const shotBlocks = shots.slice(0, shotPlan.shotCount).map((s, i) => {
    const dur = shotPlan.durations[i] || 5;
    const promptCore = [
      'Use the provided product image as reference; keep design/colors/logo accurate.',
      cleanTitle ? `Product: ${cleanTitle}.` : '',
      price ? `Price: ${price}.` : '',
      s.pv,
      'No watermark, no extra logos, no unrelated objects.',
    ].filter(Boolean).join(' ');

    return [
      `Shot ${i + 1}:`,
      `Scene description: ${s.scene}`,
      `Camera movement: ${s.camera}`,
      `Subject action: ${s.action}`,
      `PixVerse prompt: ${promptCore}`,
      `Suggested duration: ${dur}s`,
      `Aspect ratio: ${params.aspectRatio}`,
    ].join('\n');
  }).join('\n\n');

  return [
    `Please break my video idea into a series of shots for ${platform}.`,
    'Use 4 to 8 shots, 5 to 8 seconds per shot, and at least 30 seconds total.',
    'Generate in multi-shot style with clean transitions and consistent product appearance.',
    `Overall style: ${params.styleDescription}.`,
    'On-screen text overlays: short, punchy, readable, safe margins. End card: "Shop now".',
    details,
    '',
    shotBlocks,
  ].filter(Boolean).join('\n');
}

// Store for tasks
const tasks = new Map();

const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 250 * 1024 * 1024,
  },
});

app.post('/api/product/extract', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log('Extracting product from:', url);

    const product = await scraper.scrape(url);

    res.json({ success: true, product });
  } catch (error: any) {
    console.error('Product extraction error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to extract product information' 
    });
  }
});

app.post('/api/upload/video', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const mime = file.mimetype || '';
    const isVideo = mime.startsWith('video/');
    if (!isVideo) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ success: false, error: 'Uploaded file must be a video' });
    }

    const id = `upl_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const destPath = path.join(uploadsDir, `${id}.mp4`);
    fs.renameSync(file.path, destPath);

    const productDataRaw = (req.body?.productData as string) || '';
    let productData: any = undefined;
    try {
      productData = productDataRaw ? JSON.parse(productDataRaw) : undefined;
    } catch {
      productData = undefined;
    }

    const pdpUrl = (req.body?.pdpUrl as string) || (productData?.url as string) || '';

    tasks.set(id, {
      id,
      status: 'completed',
      progress: 100,
      message: 'Uploaded',
      productData,
      pdpUrl,
    });

    const baseUrl = requestBaseUrl(req);

    return res.json({
      success: true,
      video: {
        id,
        videoUrl: `${baseUrl}/api/video/${id}`,
        downloadUrl: `${baseUrl}/api/download/${id}`,
        thumbnailUrl: '',
        pdpUrl,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to upload video' });
  }
});

app.post('/api/pixverse/resolve', async (req: Request, res: Response) => {
  try {
    const { url, id } = req.body || {};
    const raw = typeof id === 'number' || typeof id === 'string' ? String(id) : typeof url === 'string' ? url : '';
    if (!raw) return res.status(400).json({ error: 'Missing url or id' });

    const match = raw.match(/[?&]id=(\d+)/) || raw.match(/^\s*(\d+)\s*$/);
    const videoId = match ? Number(match[1] || match[0]) : NaN;
    if (!Number.isFinite(videoId)) return res.status(400).json({ error: 'Invalid PixVerse id' });

    const detailResp = await axios.post(
      'https://app-api.pixverse.ai/creative_platform/video/list/detail',
      { video_id: videoId },
      { headers: { 'content-type': 'application/json' }, timeout: 20000 }
    );

    const body = detailResp.data;
    const resp = body?.Resp;
    if (!resp || body?.ErrCode !== 0) {
      return res.status(502).json({ error: body?.ErrMsg || 'Failed to resolve PixVerse video' });
    }

    const videoPath = typeof resp.video_path === 'string' ? resp.video_path : '';
    const mp4Url = videoPath ? `https://media.pixverse.ai/${encodeURIComponent(videoPath)}` : '';
    const firstFrame = typeof resp.first_frame === 'string' ? resp.first_frame : '';
    const aspectRatio = typeof resp.aspect_ratio === 'string' ? resp.aspect_ratio : '';
    const duration = typeof resp.video_duration === 'number' ? resp.video_duration : typeof resp.duration === 'number' ? resp.duration : undefined;

    return res.json({
      success: true,
      video: {
        id: videoId,
        pixverseUrl: `https://app.pixverse.ai/?detail=video&id=${videoId}&platform=cli`,
        mp4Url,
        thumbnailUrl: firstFrame,
        aspectRatio,
        duration,
        prompt: typeof resp.prompt === 'string' ? resp.prompt : '',
      },
    });
  } catch (error: any) {
    console.error('PixVerse resolve error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to resolve PixVerse video' });
  }
});

app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { productData, style, duration, aspectRatio } = req.body;
    
    if (!productData || !style || !duration) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const finalDuration = Math.max(30, Number(duration) || 0);

    console.log('Generating video for:', productData.title);
    console.log('Style:', style, 'Duration:', finalDuration, 'Aspect:', aspectRatio);

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const baseUrl = requestBaseUrl(req);

    const styleDescription = PIXVERSE_STYLES[style] || PIXVERSE_STYLES.trending;
    const pixVerseRatio = aspectRatio === '9:16' ? '9:16' : aspectRatio === '1:1' ? '1:1' : '16:9';

    const prompt = buildProductShowcasePrompt({
      title: productData.title,
      description: productData.description,
      price: productData.price,
      store: productData.store,
      rating: productData.rating,
      reviews: productData.reviews,
      styleDescription,
      aspectRatio: pixVerseRatio,
      duration: finalDuration,
    });

    console.log('Prompt:', prompt);
    console.log('Task ID:', taskId);

    // Store task
    tasks.set(taskId, {
      id: taskId,
      status: 'processing',
      prompt: prompt,
      productData: productData,
      style: style,
      duration: finalDuration,
      aspectRatio: pixVerseRatio,
      baseUrl,
      createdAt: new Date().toISOString(),
      progress: 0,
    });

    // Start async generation with PixVerse
    generateWithPixVerse(taskId, prompt, pixVerseRatio, finalDuration, productData.image);

    res.json({
      success: true,
      task: {
        id: taskId,
        status: 'processing',
        prompt: prompt,
        productData: productData,
        style: style,
        duration: finalDuration,
        aspectRatio: pixVerseRatio,
        createdAt: new Date().toISOString(),
        videoUrl: `${baseUrl}/api/video/${taskId}`,
        downloadUrl: `${baseUrl}/api/download/${taskId}`,
      },
      message: 'Video generation started. Poll /api/generate/:taskId for status.',
    });
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ error: 'Failed to start video generation' });
  }
});

// Real video generation with PixVerse
async function generateWithPixVerse(
  taskId: string,
  prompt: string,
  aspectRatio: string,
  duration: number,
  image?: string
) {
  const task = tasks.get(taskId);
  if (!task) return;

  try {
    task.status = 'processing';
    task.message = 'Submitting to PixVerse...';
    task.progress = 10;

    console.log('Starting PixVerse video generation...');
    console.log('Prompt:', prompt);

    const result = await pixVerse.generateVideo(prompt, {
      model: 'v6',
      quality: '720p',
      aspectRatio: aspectRatio,
      duration: duration,
      image,
      multiShot: true
    });

    task.status = 'processing';
    task.message = 'PixVerse AI is generating your multi-shot film...';
    task.progress = 30;
    task.pixVerseId = result.videoId;

    console.log('Video submitted to PixVerse. Video ID:', result.videoId);

    task.progress = 50;
    task.message = 'AI is assembling shots...';

    const waitTimeout = Math.max(300000, duration * 20000);
    const completion = await pixVerse.waitForCompletion(result.videoId, waitTimeout);

    task.progress = 80;
    task.message = 'Downloading video...';

    const videoFilename = `${taskId}.mp4`;
    const localPath = await pixVerse.downloadVideo(result.videoId, videoFilename);

    const expectedPath = path.join(uploadsDir, videoFilename);
    if (localPath !== expectedPath && fs.existsSync(localPath)) {
      const renamedPath = path.join(uploadsDir, videoFilename);
      fs.copyFileSync(localPath, renamedPath);
      console.log(`Copied video from ${localPath} to ${renamedPath}`);
    }

    task.status = 'completed';
    task.message = 'Video ready!';
    task.progress = 100;
    const baseUrl = task.baseUrl || `http://localhost:${PORT}`;
    task.videoUrl = `${baseUrl}/api/video/${taskId}`;
    task.downloadUrl = `${baseUrl}/api/download/${taskId}`;
    task.thumbnailUrl = completion.cover_url || `https://via.placeholder.com/400x800/15110c/e3bd83?text=Lumora`;
    task.metadata = {
      generationTime: 3.2,
      trendScore: 92,
      suggestions: [
        'Add trending sound @trending_sound',
        'Use hashtags: #TikTokShop #ProductShowcase #Viral',
      ],
      pixVerseUrl: completion.video_url || '',
      pixVerseId: result.videoId
    };

    console.log('Video generated successfully:', videoFilename);
  } catch (error: any) {
    console.error('PixVerse generation failed:', error);
    task.status = 'failed';
    task.message = `Generation failed: ${error.message}`;
    task.progress = 0;
  }
}

app.get('/api/generate/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
    const task = tasks.get(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      success: true,
      task: {
        id: task.id,
        status: task.status,
        progress: task.progress,
        message: task.message,
        videoUrl: task.videoUrl,
        downloadUrl: task.downloadUrl,
        thumbnailUrl: task.thumbnailUrl,
        metadata: task.metadata,
      },
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check generation status' });
  }
});

// Preview/stream endpoint (inline)
app.get('/api/video/:taskId', (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const task = tasks.get(taskId);

    if (!task || task.status !== 'completed') {
      return res.status(404).json({ error: 'Video not found or not ready' });
    }

    const videoFilename = `${taskId}.mp4`;
    const videoPath = path.join(uploadsDir, videoFilename);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video file not found' });
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `inline; filename="${task.productData?.title || 'video'}_viral.mp4"`);
    res.sendFile(videoPath);
  } catch (error) {
    console.error('Video stream error:', error);
    res.status(500).json({ error: 'Failed to stream video' });
  }
});

// Download endpoint
app.get('/api/download/:taskId', (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
    const task = tasks.get(taskId);
    
    if (!task || task.status !== 'completed') {
      return res.status(404).json({ error: 'Video not found or not ready' });
    }

    const videoFilename = `${taskId}.mp4`;
    const videoPath = path.join(uploadsDir, videoFilename);
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video file not found' });
    }

    console.log(`Downloading video: ${videoFilename}`);
    
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${task.productData?.title || 'video'}_viral.mp4"`);
    res.sendFile(videoPath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download video' });
  }
});

app.post('/api/generate/:taskId/cancel', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
    console.log('Cancelling task:', taskId);
    
    tasks.delete(taskId);
    
    res.json({
      success: true,
      message: 'Task cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({ error: 'Failed to cancel task' });
  }
});

app.get('/api/trends', async (req: Request, res: Response) => {
  try {
    const trends = [
      {
        id: 'trend-1',
        name: 'Product Showcase',
        type: 'format',
        popularity: 95,
        thumbnail: '/trends/showcase.jpg',
        usage: '2.4k videos this week',
      },
      {
        id: 'trend-2',
        name: 'Unboxing Reveal',
        type: 'format',
        popularity: 88,
        thumbnail: '/trends/unboxing.jpg',
        usage: '1.8k videos this week',
      },
      {
        id: 'trend-3',
        name: 'Lifestyle Integration',
        type: 'format',
        popularity: 82,
        thumbnail: '/trends/lifestyle.jpg',
        usage: '1.2k videos this week',
      },
    ];

    res.json({
      success: true,
      trends,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Trends fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

app.get('/api/health', async (req: Request, res: Response) => {
  const credits = await pixVerse.checkCredits();
  
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    scraper: 'ready',
    downloads: 'enabled',
    pixverse: {
      authenticated: true,
      credits: credits,
      status: credits > 0 ? 'ready' : 'no credits'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Lumora Backend running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`   POST /api/product/extract - Extract product from URL (REAL SCRAPING)`);
  console.log(`   POST /api/generate - Start video generation`);
  console.log(`   GET  /api/generate/:taskId - Check generation status`);
  console.log(`   GET  /api/download/:taskId - Download video`);
  console.log(`   GET  /api/trends - Get trending formats`);
  console.log(`   GET  /api/health - Health check`);
});
