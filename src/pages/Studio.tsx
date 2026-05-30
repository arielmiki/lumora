import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowUpRight, Check, Copy, Download, FileVideo, ImagePlus, Loader2, Pencil, PlusCircle, Sparkles, Terminal, Upload, X } from 'lucide-react';
import { apiService, Product, UploadedVideo } from '../services/api';
import { useStore } from '../stores/useStore';
import { buildPixVerseShotPack, PixVerseStyle } from '../lib/pixversePack';
import { publicImage } from '../lib/utils';

function emptyProduct(): Product {
  return {
    title: '',
    description: '',
    price: '',
    currency: 'SGD',
    image: '',
    images: [],
    store: '',
    url: '',
  };
}

function StepBadge({ n, label, done, active }: { n: number; label: string; done?: boolean; active?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={[
          'w-7 h-7 rounded-full grid place-items-center text-[11.5px] font-semibold border transition-colors',
          done ? 'bg-gold/15 text-gold border-gold/45' : active ? 'bg-gold text-ink border-gold' : 'bg-ink-2 text-bone-dim border-line',
        ].join(' ')}
      >
        {done ? <Check className="w-3.5 h-3.5" /> : n}
      </span>
      <span className="text-[11px] uppercase tracking-[0.22em] font-semibold text-muted">{label}</span>
    </div>
  );
}

export default function Studio() {
  const [searchParams] = useSearchParams();
  const { addProject, recentProjects } = useStore();

  const [productUrl, setProductUrl] = useState('');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const [style, setStyle] = useState<PixVerseStyle>('trending');
  const [duration, setDuration] = useState(30);
  const [aspectRatio, setAspectRatio] = useState('9:16');

  const [promptPack, setPromptPack] = useState<ReturnType<typeof buildPixVerseShotPack> | null>(null);
  const [pixVerseInput, setPixVerseInput] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeShot, setActiveShot] = useState<number | null>(null);
  const [mode, setMode] = useState<"manual" | "agent">("agent");
  const [draftProjectId, setDraftProjectId] = useState<string>('');
  const [shotRenders, setShotRenders] = useState<Array<{
    index: number;
    pixVerseUrl: string;
    pixVerseId: string;
    mp4Url: string;
    thumbnailUrl: string;
  }>>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateProduct = (patch: Partial<Product>) => {
    setCurrentProduct((prev) => ({ ...(prev || emptyProduct()), ...patch }));
  };

  const hasProductDetails = Boolean(
    currentProduct && (currentProduct.title?.trim() || currentProduct.price?.trim() || currentProduct.image?.trim())
  );

  const campaignId = searchParams.get('campaignId') || '';

  const selectedCampaign = useMemo(() => {
    if (!campaignId) return null;
    return recentProjects.find((p) => p.id === campaignId) || null;
  }, [campaignId, recentProjects]);

  useEffect(() => {
    const url = searchParams.get('url');
    if (url) {
      const decoded = decodeURIComponent(url);
      setProductUrl(decoded);
      handleExtractProduct(decoded);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedCampaign) return;
    setCurrentProduct(selectedCampaign.productData as any);
    setProductUrl(selectedCampaign.productUrl || selectedCampaign.productData?.url || '');
    setStyle((selectedCampaign.style as PixVerseStyle) || 'trending');
    setDuration(Number(selectedCampaign.duration) || 30);
    setAspectRatio(selectedCampaign.aspectRatio || '9:16');
    const pp = selectedCampaign.metadata?.promptPack as any;
    setPromptPack(pp && Array.isArray(pp.shotPrompts) ? pp : null);
    setDraftProjectId(selectedCampaign.id);
    setShotRenders(Array.isArray(selectedCampaign.metadata?.shotRenders) ? (selectedCampaign.metadata?.shotRenders as any) : []);
    setActiveShot(1);
    setUploadFile(null);
    setIsUploading(false);
    setUploadedVideo(null);
  }, [selectedCampaign]);

  const handleExtractProduct = async (url: string) => {
    if (!url) return;
    setIsExtracting(true);
    setError(null);
    setCurrentProduct(null);
    setPromptPack(null);
    setDraftProjectId('');
    setShotRenders([]);
    setActiveShot(null);
    setUploadFile(null);
    setIsUploading(false);
    setUploadedVideo(null);

    try {
      const product = await apiService.extractProduct(url);
      setCurrentProduct(product);
    } catch (err: any) {
      setError(err.message || 'Failed to extract product');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGeneratePack = () => {
    if (!currentProduct) return;
    const next = buildPixVerseShotPack({
      title: currentProduct.title,
      description: currentProduct.description,
      price: currentProduct.price,
      store: currentProduct.store,
      rating: currentProduct.rating,
      reviews: currentProduct.reviews,
      style,
      aspectRatio,
      duration: Math.max(30, duration),
    });
    setPromptPack(next);
    setActiveShot(1);
    setDraftProjectId(`pvpack_${Date.now().toString(36)}`);
    setShotRenders([]);
    setUploadFile(null);
    setIsUploading(false);
    setUploadedVideo(null);
  };

  const handleCopy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1400);
  };

  const handleImportPixVerse = async () => {
    if (!currentProduct || !promptPack) return;
    if (!pixVerseInput.trim()) return;
    setIsResolving(true);
    setError(null);
    try {
      const resolved = await apiService.resolvePixVerse(pixVerseInput.trim());
      const shotIndex = activeShot || 1;
      const render = {
        index: shotIndex,
        pixVerseUrl: resolved.pixverseUrl,
        pixVerseId: String(resolved.id),
        mp4Url: resolved.mp4Url,
        thumbnailUrl: resolved.thumbnailUrl,
      };

      setShotRenders((prev) => {
        const next = [...prev.filter((r) => r.index !== shotIndex), render].sort((a, b) => a.index - b.index);

        const first = next[0] || render;
        const existing = recentProjects.find((p) => p.id === draftProjectId);
        const id = draftProjectId || `pvpack_${Date.now().toString(36)}`;

        addProject({
          id,
          productUrl: currentProduct.url,
          productData: currentProduct,
          style,
          duration: promptPack.plannedDuration,
          aspectRatio,
          status: 'ready',
          videoUrl: first.mp4Url,
          downloadUrl: first.mp4Url,
          thumbnailUrl: first.thumbnailUrl,
          metadata: {
            generationTime: 0,
            trendScore: 0,
            pixVerseUrl: first.pixVerseUrl,
            pixVerseId: first.pixVerseId,
            pixVerseMp4Url: first.mp4Url,
            pdpUrl: currentProduct.url,
            shotRenders: next,
            promptPack: {
              shotPrompts: promptPack.shotPrompts,
              captions: promptPack.captions,
              hashtags: promptPack.hashtags,
              plannedDuration: promptPack.plannedDuration,
              shotCount: promptPack.shotCount,
            },
          },
          isPublic: existing?.isPublic ?? true,
          createdAt: existing?.createdAt ?? new Date(),
        });

        return next;
      });

      setPixVerseInput('');
      setCopied(null);
      setError(null);

      const nextShot = (activeShot || 1) + 1;
      if (promptPack.shotPrompts.some((s) => s.index === nextShot)) {
        setActiveShot(nextShot);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to import PixVerse video');
    } finally {
      setIsResolving(false);
    }
  };

  const handleUploadFinalVideo = async () => {
    if (!currentProduct) return;
    if (!uploadFile) return;
    setIsUploading(true);
    setError(null);
    try {
      const uploaded = await apiService.uploadVideo(uploadFile, currentProduct, currentProduct.url);

      const pack = promptPack;
      const existing = recentProjects.find((p) => p.id === uploaded.id);

      addProject({
        id: uploaded.id,
        productUrl: currentProduct.url,
        productData: currentProduct,
        style,
        duration: pack?.plannedDuration || Math.max(30, duration),
        aspectRatio,
        status: 'ready',
        videoUrl: uploaded.videoUrl,
        downloadUrl: uploaded.downloadUrl,
        thumbnailUrl: uploaded.thumbnailUrl || '',
        metadata: {
          generationTime: 0,
          trendScore: 0,
          pdpUrl: uploaded.pdpUrl || currentProduct.url,
          pixVerseMp4Url: uploaded.videoUrl,
          promptPack: pack
            ? {
                shotPrompts: pack.shotPrompts,
                captions: pack.captions,
                hashtags: pack.hashtags,
                plannedDuration: pack.plannedDuration,
                shotCount: pack.shotCount,
              }
            : undefined,
          shotRenders: shotRenders.length ? shotRenders : undefined,
        },
        isPublic: existing?.isPublic ?? true,
        createdAt: existing?.createdAt ?? new Date(),
      });

      setUploadedVideo(uploaded);
      setUploadFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const styles = [
    { id: 'trending', name: 'Trending', desc: 'Fast, social-first pacing' },
    { id: 'funny', name: 'Funny', desc: 'Playful, meme-ready beats' },
    { id: 'emotional', name: 'Emotional', desc: 'Story-driven, warm tone' },
    { id: 'professional', name: 'Professional', desc: 'Clean, premium, polished' },
  ] as const;

  const durations = [30, 45, 60];
  const ratios = [
    { id: '9:16', name: 'TikTok' },
    { id: '1:1', name: 'Instagram' },
    { id: '16:9', name: 'YouTube' },
  ];

  const importedMp4Url = selectedCampaign?.metadata?.pixVerseMp4Url || selectedCampaign?.videoUrl || '';
  const importedPixVerseUrl = selectedCampaign?.metadata?.pixVerseUrl || '';
  const pdpUrl = selectedCampaign?.metadata?.pdpUrl || selectedCampaign?.productUrl || selectedCampaign?.productData?.url || '';
  const activeShotIndex = activeShot || 1;
  const activeShotPrompt = promptPack?.shotPrompts.find((s) => s.index === activeShotIndex) || null;
  const importedCount = shotRenders.length;
  const activeShotImported = shotRenders.find((r) => r.index === activeShotIndex) || null;

  return (
    <div className="min-h-screen bg-ink text-bone">
      <div className="h-[70px] border-b border-line flex items-center px-6 sticky top-0 bg-ink/80 backdrop-blur-xl z-40">
        <Link to="/" className="flex items-center gap-3 text-bone-dim hover:text-bone transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" />
          Home
        </Link>
        <div className="flex-1" />
        <div className="font-display font-medium tracking-[0.08em] uppercase text-[12px] text-gold hidden sm:block">
          Studio
        </div>
        <div className="flex-1" />
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-6 pt-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-[#2a1714] border border-[#5a2a22] rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-clay flex-shrink-0" />
              <p className="text-bone-dim flex-1">{error}</p>
              <button onClick={() => setError(null)} className="text-bone-dim hover:text-bone transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <StepBadge n={1} label="Product" active={!hasProductDetails} done={hasProductDetails} />
                  <span className="text-[11px] uppercase tracking-[0.22em] font-semibold text-muted">Paste, or fill it in</span>
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="Paste TikTok Shop or Shopee URL…"
                    className="input flex-1"
                  />
                  <button onClick={() => handleExtractProduct(productUrl)} disabled={!productUrl.trim() || isExtracting} className="btn-primary">
                    {isExtracting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Extracting
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Extract
                      </>
                    )}
                  </button>
                </div>

                {!currentProduct && !isExtracting && (
                  <button
                    onClick={() => setCurrentProduct(emptyProduct())}
                    className="mt-4 w-full rounded-2xl border border-dashed border-line2 bg-ink-2 hover:border-gold/50 hover:bg-ink/60 transition-colors px-4 py-3.5 flex items-center justify-center gap-2 text-[13px] text-bone-dim"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Or add product details manually
                  </button>
                )}

                {currentProduct && !isExtracting && (
                  <div className="mt-5 rounded-2xl border border-line bg-ink-2 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-semibold text-muted">
                        <Pencil className="w-3.5 h-3.5" />
                        Details (editable)
                      </div>
                      <button
                        onClick={() => {
                          setCurrentProduct(null);
                          setProductUrl('');
                          setPromptPack(null);
                          setShotRenders([]);
                        }}
                        className="text-[11px] text-muted hover:text-bone transition-colors"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="flex gap-4">
                      {currentProduct.image ? (
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 group">
                          <img src={publicImage(currentProduct.image)} alt={currentProduct.title || 'Product'} className="w-full h-full object-cover bg-ink" />
                          <button
                            onClick={() => updateProduct({ image: '' })}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center text-white text-[10.5px] uppercase tracking-[0.18em] font-semibold"
                          >
                            Replace
                          </button>
                        </div>
                      ) : (
                        <label className="w-24 h-24 rounded-xl border border-dashed border-line2 hover:border-gold/50 bg-ink flex flex-col items-center justify-center text-[10px] uppercase tracking-[0.18em] text-muted flex-shrink-0 cursor-text gap-1">
                          <ImagePlus className="w-4 h-4" />
                          Paste URL ↓
                        </label>
                      )}
                      <div className="flex-1 min-w-0 space-y-2">
                        <input
                          value={currentProduct.title}
                          onChange={(e) => updateProduct({ title: e.target.value })}
                          placeholder="Product name (e.g. Work to Wine Midi Skirt)"
                          className="input text-[14px] font-display font-medium"
                        />
                        <div className="flex gap-2">
                          <input
                            value={currentProduct.price}
                            onChange={(e) => updateProduct({ price: e.target.value })}
                            placeholder="Price · S$48.90"
                            className="input text-[13px]"
                          />
                          <input
                            value={currentProduct.store || ''}
                            onChange={(e) => updateProduct({ store: e.target.value })}
                            placeholder="Store · Hollyhoque"
                            className="input text-[13px]"
                          />
                        </div>
                      </div>
                    </div>

                    {!currentProduct.image && (
                      <input
                        value={currentProduct.image}
                        onChange={(e) => updateProduct({ image: e.target.value.trim() })}
                        placeholder="Paste a product image URL (TikTok / Shopee / Imgur)…"
                        className="input text-[12.5px]"
                      />
                    )}

                    <textarea
                      value={currentProduct.description}
                      onChange={(e) => updateProduct({ description: e.target.value })}
                      placeholder="Short description or key features (used to tailor every shot prompt)"
                      className="input min-h-[68px] text-[12.5px] leading-[1.45]"
                    />

                    {(currentProduct.rating || currentProduct.reviews) && (
                      <div className="text-[11.5px] text-gold">
                        ★ {currentProduct.rating || '—'}{currentProduct.reviews ? ` · ${currentProduct.reviews} reviews` : ''}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <StepBadge n={2} label="Direction" active={hasProductDetails && !promptPack} done={Boolean(promptPack)} />
                  <span className="text-[11px] uppercase tracking-[0.22em] font-semibold text-muted">Tone, length, ratio</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {styles.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      disabled={!hasProductDetails}
                      className={[
                        "rounded-xl border px-4 py-3 text-left transition-colors",
                        style === s.id ? "bg-gold text-ink border-gold font-semibold" : "bg-ink-2 text-bone-dim border-line hover:border-line2",
                        !hasProductDetails ? "opacity-50 cursor-not-allowed" : "",
                      ].join(" ")}
                    >
                      <div className="text-[14px]">{s.name}</div>
                      <div className={style === s.id ? "text-[12px] text-ink/70" : "text-[12px] text-muted"}>{s.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] font-semibold text-muted mb-2">Duration</div>
                    <div className="flex gap-2">
                      {durations.map((d) => (
                        <button
                          key={d}
                          onClick={() => setDuration(d)}
                          disabled={!hasProductDetails}
                          className={[
                            "flex-1 rounded-xl border px-3 py-2 text-[13px] transition-colors",
                            duration === d ? "bg-gold text-ink border-gold font-semibold" : "bg-ink-2 text-bone-dim border-line hover:border-line2",
                            !hasProductDetails ? "opacity-50 cursor-not-allowed" : "",
                          ].join(" ")}
                        >
                          {d}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] font-semibold text-muted mb-2">Aspect ratio</div>
                    <div className="flex gap-2">
                      {ratios.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setAspectRatio(r.id)}
                          disabled={!hasProductDetails}
                          className={[
                            "flex-1 rounded-xl border px-3 py-2 text-[12.5px] transition-colors",
                            aspectRatio === r.id ? "bg-gold text-ink border-gold font-semibold" : "bg-ink-2 text-bone-dim border-line hover:border-line2",
                            !hasProductDetails ? "opacity-50 cursor-not-allowed" : "",
                          ].join(" ")}
                        >
                          <div className="font-semibold">{r.id}</div>
                          <div className={aspectRatio === r.id ? "text-[10.5px] text-ink/70 mt-0.5" : "text-[10.5px] text-muted mt-0.5"}>{r.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5 flex items-center gap-4">
                <StepBadge n={3} label={promptPack ? 'Shot pack ready' : 'Build prompt'} active={hasProductDetails && !promptPack} done={Boolean(promptPack)} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] text-bone-dim">
                    {hasProductDetails ? (
                      <>
                        <span className="text-bone font-medium">{(promptPack?.shotCount || Math.round(duration / 6)) + ' shots'}</span>
                        <span> · {(promptPack?.plannedDuration || duration)}s total</span>
                        <span> · {style}</span>
                        <span> · {aspectRatio}</span>
                      </>
                    ) : (
                      <span>Fill product details to unlock.</span>
                    )}
                  </div>
                </div>
                <button onClick={handleGeneratePack} disabled={!hasProductDetails} className="btn-primary flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                  {promptPack ? 'Rebuild' : 'Build pack'}
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-medium text-[19px]">PixVerse</h2>
                  {importedMp4Url ? <span className="badge-accent">Imported</span> : promptPack ? <span className="badge-primary">Prompt ready</span> : null}
                </div>

                <div className="flex gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setMode("agent")}
                    className={["flex-1 rounded-xl border px-4 py-2 text-[13px] transition-colors", mode === "agent" ? "bg-gold text-ink border-gold font-semibold" : "bg-ink-2 text-bone-dim border-line hover:border-line2"].join(" ")}
                  >
                    Agent (CLI prompt)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("manual")}
                    className={["flex-1 rounded-xl border px-4 py-2 text-[13px] transition-colors", mode === "manual" ? "bg-gold text-ink border-gold font-semibold" : "bg-ink-2 text-bone-dim border-line hover:border-line2"].join(" ")}
                  >
                    Manual (Web)
                  </button>
                </div>

                {mode === "agent" && (() => {
                  const agentPrompt = promptPack
                    ? [
                        "You are running in a local dev environment with PixVerse CLI installed.",
                        "Goal: generate a product promo as multiple shots (one shot per PixVerse generation), then stitch into one MP4.",
                        "",
                        "Constraints:",
                        "- Use 9:16 unless otherwise specified.",
                        "- 5–8s per shot, 4–8 shots, total >= 30s.",
                        "- Use the provided product image as reference input for every shot (upload or --image URL).",
                        "- Keep product appearance consistent across shots.",
                        "",
                        currentProduct?.image ? `Product image URL: ${publicImage(currentProduct.image)}` : "Product image URL: (not provided)",
                        pdpUrl ? `Product page (PDP): ${pdpUrl}` : "Product page (PDP): (not provided)",
                        "",
                        "Shot prompts (run each as its own PixVerse generation):",
                        ...promptPack.shotPrompts.map((s) => `\n[SHOT ${s.index}] (${s.suggestedDuration}s, ${s.aspectRatio})\n${s.pixVersePrompt}`),
                        "",
                        "After generating all shots:",
                        "- Pick best take(s) per shot (seed0 is fine for draft).",
                        "- Stitch in order with simple cuts (or light transitions) using ffmpeg into final.mp4.",
                        "- Return: (1) final.mp4 local path or public URL, (2) list of shot mp4 URLs, (3) the exact commands used.",
                      ].join("\n")
                    : "";
                  return (
                    <div className="rounded-2xl border border-line bg-ink-2 p-5">
                      {!promptPack ? (
                        <div className="rounded-xl border border-dashed border-line2 bg-ink p-6 text-center text-[13px] text-bone-dim">
                          <Terminal className="w-5 h-5 mx-auto mb-2 text-muted" />
                          Build a shot pack first — the agent-ready prompt will land here.
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <div className="font-display font-medium text-[15.5px] flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-gold" />
                                Agent runner prompt
                              </div>
                              <div className="mt-1 text-[12.5px] text-bone-dim max-w-md">
                                Paste into Claude Code (or any coding agent) — it'll run each shot through the PixVerse CLI and stitch a final.mp4.
                              </div>
                            </div>
                            <button onClick={() => handleCopy(agentPrompt, "agent")} className="btn-primary btn-sm flex-shrink-0">
                              {copied === "agent" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              {copied === "agent" ? "Copied" : "Copy"}
                            </button>
                          </div>

                          <div className="relative rounded-xl border border-line bg-[#0f0a06] overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-line bg-black/30">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/70" />
                              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/70" />
                              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/70" />
                              <span className="ml-2 text-[10.5px] uppercase tracking-[0.2em] text-muted font-mono">claude_code · pixverse</span>
                            </div>
                            <pre className="max-h-[320px] overflow-auto px-4 py-3 text-[12px] leading-[1.55] text-bone-dim font-mono whitespace-pre-wrap">
{agentPrompt}
                            </pre>
                          </div>

                          <div className="mt-3 grid sm:grid-cols-3 gap-2 text-[11.5px] text-bone-dim">
                            <div className="rounded-xl border border-line bg-ink p-3">
                              <div className="text-gold font-semibold mb-0.5">1 · Copy</div>
                              The full prompt above — image URL is baked in.
                            </div>
                            <div className="rounded-xl border border-line bg-ink p-3">
                              <div className="text-gold font-semibold mb-0.5">2 · Run</div>
                              Paste into Claude Code; it generates + stitches.
                            </div>
                            <div className="rounded-xl border border-line bg-ink p-3">
                              <div className="text-gold font-semibold mb-0.5">3 · Upload</div>
                              Drop the final.mp4 into Step 5 to publish.
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}

                {mode === "manual" && promptPack && (
                  <div className="mt-6 rounded-2xl border border-line bg-ink-2 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="font-display font-medium text-[18px]">Manual workflow</div>
                      <span className="badge-primary">{importedCount}/{promptPack.shotCount} saved</span>
                    </div>

                    {currentProduct?.image && (
                      <div className="rounded-2xl border border-line bg-ink p-4">
                        <div className="text-[11px] uppercase tracking-[0.22em] font-semibold text-muted mb-3">Reference image</div>
                        <div className="flex items-center gap-4">
                          <img src={publicImage(currentProduct.image)} alt={currentProduct.title} className="w-14 h-14 rounded-xl object-cover border border-line flex-shrink-0 bg-ink" />
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => handleCopy(publicImage(currentProduct.image), 'image')} className="btn-primary btn-sm">
                              {copied === 'image' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              {copied === 'image' ? 'Copied' : 'Copy image URL'}
                            </button>
                            <a href={publicImage(currentProduct.image)} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                              Open image <ArrowUpRight className="w-4 h-4" />
                            </a>
                            <a href={publicImage(currentProduct.image)} className="btn-outline btn-sm" download>
                              Download image <Download className="w-4 h-4" />
                            </a>
                            <a href="https://app.pixverse.ai/" target="_blank" rel="noreferrer" className="btn-dark btn-sm">
                              Open PixVerse <ArrowUpRight className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-[11px] uppercase tracking-[0.22em] font-semibold text-muted mb-3">Shot</div>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: promptPack.shotCount }).map((_, idx) => {
                          const n = idx + 1;
                          const allowedMax = Math.min(importedCount + 1, promptPack.shotCount);
                          const isAllowed = n <= allowedMax;
                          const isSaved = Boolean(shotRenders.find((r) => r.index === n));
                          const isActive = n === activeShotIndex;
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => {
                                if (!isAllowed) return;
                                setActiveShot(n);
                              }}
                              disabled={!isAllowed}
                              className={[
                                "rounded-full border px-3 py-1 text-[12px] transition-colors flex items-center gap-2",
                                isActive ? "bg-gold text-ink border-gold font-semibold" : "bg-ink text-bone-dim border-line hover:border-line2",
                                !isAllowed ? "opacity-50 cursor-not-allowed hover:border-line" : "",
                              ].join(" ")}
                            >
                              <span>Shot {n}</span>
                              {isSaved && <Check className="w-4 h-4" />}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-4 rounded-2xl border border-line bg-ink p-4">
                        {activeShotPrompt && (
                          <div>
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="font-display font-medium text-[15px]">Shot {activeShotPrompt.index}</div>
                                <div className="mt-1 text-[12px] text-muted">
                                  {activeShotPrompt.suggestedDuration}s · {activeShotPrompt.aspectRatio}
                                  {activeShotImported ? " · Saved" : " · Save to continue"}
                                </div>
                              </div>
                              <button onClick={() => handleCopy(activeShotPrompt.pixVersePrompt, `shot-${activeShotPrompt.index}`)} className="btn-primary btn-sm">
                                {copied === `shot-${activeShotPrompt.index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied === `shot-${activeShotPrompt.index}` ? 'Copied' : 'Copy prompt'}
                              </button>
                            </div>
                            <div className="grid gap-2 text-[12.5px] text-bone-dim">
                              <div><span className="text-muted">Scene:</span> {activeShotPrompt.sceneDescription}</div>
                              <div><span className="text-muted">Camera:</span> {activeShotPrompt.cameraMovement}</div>
                              <div><span className="text-muted">Action:</span> {activeShotPrompt.subjectAction}</div>
                            </div>
                            <textarea value={activeShotPrompt.pixVersePrompt} readOnly className="mt-3 input min-h-[120px] text-[13px] leading-[1.45]" />
                            {activeShotImported?.pixVerseUrl && (
                              <div className="mt-3">
                                <a href={activeShotImported.pixVerseUrl} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                                  Open saved shot <ArrowUpRight className="w-4 h-4" />
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleCopy(promptPack.captions.join('\n'), 'captions')} className="btn-outline btn-sm">
                        {copied === 'captions' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied === 'captions' ? 'Copied' : 'Copy captions'}
                      </button>
                      <button onClick={() => handleCopy(promptPack.hashtags.join(' '), 'tags')} className="btn-outline btn-sm">
                        {copied === 'tags' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied === 'tags' ? 'Copied' : 'Copy hashtags'}
                      </button>
                      {pdpUrl && (
                        <a href={pdpUrl} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                          Product page <ArrowUpRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <div className="pt-2">
                      <div className="text-[11px] uppercase tracking-[0.22em] font-semibold text-muted mb-2">
                        Import result (shot {activeShotIndex})
                      </div>
                      <div className="flex gap-3">
                        <input
                          value={pixVerseInput}
                          onChange={(e) => setPixVerseInput(e.target.value)}
                          placeholder="Paste PixVerse link or video id…"
                          className="input flex-1"
                        />
                        <button onClick={handleImportPixVerse} disabled={isResolving || !pixVerseInput.trim()} className="btn-primary">
                          {isResolving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Importing
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Save shot
                            </>
                          )}
                        </button>
                      </div>
                      <div className="mt-3 text-[12px] text-muted">
                        Save this shot to unlock the next one.
                      </div>
                    </div>
                  </div>
                )}

                {importedMp4Url && (
                  <div className="mt-6 rounded-2xl border border-line bg-ink-2 p-5">
                    <div className="text-[11px] uppercase tracking-[0.22em] font-semibold text-muted mb-3">Imported video</div>
                    <div className="flex flex-wrap gap-2">
                      {importedPixVerseUrl && (
                        <a href={importedPixVerseUrl} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                          Open PixVerse <ArrowUpRight className="w-4 h-4" />
                        </a>
                      )}
                      <a href={importedMp4Url} target="_blank" rel="noreferrer" className="btn-primary btn-sm">
                        Open MP4 <ArrowUpRight className="w-4 h-4" />
                      </a>
                      {pdpUrl && (
                        <a href={pdpUrl} target="_blank" rel="noreferrer" className="btn-dark btn-sm">
                          Checkout <ArrowUpRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {promptPack && (
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <StepBadge n={5} label="Publish" active={!uploadedVideo} done={Boolean(uploadedVideo)} />
                    <span className="text-[11px] uppercase tracking-[0.22em] font-semibold text-muted">Final MP4 → showcase</span>
                  </div>

                  {!uploadedVideo ? (
                    <>
                      <label
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingFile(true);
                        }}
                        onDragLeave={() => setIsDraggingFile(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingFile(false);
                          const f = e.dataTransfer.files?.[0];
                          if (f && f.type.startsWith('video/')) setUploadFile(f);
                        }}
                        className={[
                          'block rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors',
                          isDraggingFile ? 'border-gold bg-gold/10' : 'border-line2 bg-ink-2 hover:border-gold/40 hover:bg-ink/80',
                        ].join(' ')}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/mp4,video/quicktime,video/*"
                          className="hidden"
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        />
                        {uploadFile ? (
                          <div className="flex items-center gap-3 text-left">
                            <div className="w-12 h-12 rounded-xl bg-gold/15 text-gold grid place-items-center flex-shrink-0">
                              <FileVideo className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-bone truncate">{uploadFile.name}</div>
                              <div className="text-[12px] text-muted">
                                {(uploadFile.size / 1024 / 1024).toFixed(1)} MB · {uploadFile.type || 'video/mp4'}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setUploadFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                              }}
                              className="text-[11.5px] text-muted hover:text-bone transition-colors flex-shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="w-12 h-12 rounded-2xl bg-ink border border-line2 grid place-items-center mx-auto mb-3 text-bone-dim">
                              <Upload className="w-5 h-5" />
                            </div>
                            <div className="font-display font-medium text-[15px]">Drop your final.mp4 here</div>
                            <div className="mt-1 text-[12.5px] text-muted">or click to browse · up to 250 MB · MP4 / MOV / WebM</div>
                          </div>
                        )}
                      </label>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="text-[11.5px] text-muted">
                          Lives on Vercel Blob · auto-thumbnail generated on upload.
                        </div>
                        <button
                          onClick={handleUploadFinalVideo}
                          disabled={!uploadFile || isUploading || !currentProduct}
                          className="btn-primary btn-sm flex-shrink-0"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Uploading
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Publish to showcase
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-gold/30 bg-gold/[0.04] p-4">
                      <div className="flex gap-4">
                        {uploadedVideo.thumbnailUrl && uploadedVideo.thumbnailUrl !== uploadedVideo.videoUrl ? (
                          <img
                            src={uploadedVideo.thumbnailUrl}
                            alt="Uploaded film thumbnail"
                            className="w-20 h-[120px] rounded-xl object-cover border border-line bg-ink flex-shrink-0"
                          />
                        ) : (
                          <video
                            src={uploadedVideo.videoUrl}
                            className="w-20 h-[120px] rounded-xl object-cover border border-line bg-ink flex-shrink-0"
                            muted
                            playsInline
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-gold text-[12px] font-semibold">
                            <Check className="w-4 h-4" />
                            Published
                          </div>
                          <div className="mt-1 font-display font-medium text-[14.5px] truncate">
                            {currentProduct?.title || 'Final film'}
                          </div>
                          <div className="text-[12px] text-muted truncate">{uploadedVideo.videoUrl}</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link to="/#public" className="btn-primary btn-sm">
                              View in showcase <ArrowUpRight className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleCopy(uploadedVideo.videoUrl, 'final-url')} className="btn-outline btn-sm">
                              {copied === 'final-url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              {copied === 'final-url' ? 'Copied' : 'Copy URL'}
                            </button>
                            <a href={uploadedVideo.downloadUrl || uploadedVideo.videoUrl} download className="btn-outline btn-sm">
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                            <button
                              onClick={() => {
                                setUploadedVideo(null);
                                setUploadFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                              }}
                              className="btn-ghost btn-sm"
                            >
                              Upload another
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!promptPack && currentProduct && (
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-medium text-[19px]">Direction notes</h3>
                    <button
                      onClick={() => {
                        setPromptPack(null);
                        setError(null);
                      }}
                      className="btn-ghost btn-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      Reset
                    </button>
                  </div>
                  <ul className="space-y-3 text-[13px] text-bone-dim">
                    <li className="flex gap-3">
                      <span className="text-gold">•</span>
                      Keep films 30–60s with clear, distinct shots for performance on TikTok and Reels.
                    </li>
                    <li className="flex gap-3">
                      <span className="text-gold">•</span>
                      Choose a single hook and let the product do the talking.
                    </li>
                    <li className="flex gap-3">
                      <span className="text-gold">•</span>
                      If the listing images are sparse, use a premium studio look and strong typography overlays.
                    </li>
                  </ul>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
