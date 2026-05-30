import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Check, Copy, Download, Grid, List, Play, Share2, X, Instagram, Facebook, Twitter } from "lucide-react";
import { useStore } from "../stores/useStore";

const TikTokIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const fallbackScenes = [
  "radial-gradient(120% 70% at 70% 15%,rgba(227,189,131,.45),transparent 60%),linear-gradient(160deg,#3a2c1c,#19120b)",
  "radial-gradient(120% 70% at 30% 20%,rgba(189,140,162,.4),transparent 60%),linear-gradient(160deg,#2b1f2a,#140d13)",
  "radial-gradient(120% 70% at 60% 18%,rgba(170,185,145,.4),transparent 60%),linear-gradient(160deg,#222b18,#10140b)",
  "radial-gradient(120% 70% at 40% 22%,rgba(212,149,122,.45),transparent 60%),linear-gradient(160deg,#2e1d16,#140b08)",
];

export default function Gallery() {
  const navigate = useNavigate();
  const { recentProjects, setProjectPublic } = useStore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const films = useMemo(() => {
    return recentProjects.filter((p) => p.status === "ready" && p.videoUrl);
  }, [recentProjects]);

  const handleCopy = async (value: string, id: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const handleShare = (platform: string, project: any) => {
    const url = project.metadata?.pixVerseUrl || project.videoUrl;
    const text = `Cinematic product film, generated with Lumora — ${project.productData?.title || "Untitled film"}.`;

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    };

    if (platform === "tiktok") {
      window.open("https://www.tiktok.com/upload", "_blank", "width=900,height=700");
      return;
    }

    if (platform === "instagram") {
      alert("Instagram Reels uploads must be done in the Instagram app. Download the film first, then upload.");
      return;
    }

    window.open(shareUrls[platform], "_blank", "width=900,height=700");
  };

  return (
    <div className="min-h-screen bg-ink text-bone">
      <div className="h-[70px] border-b border-line flex items-center px-6 sticky top-0 bg-ink/80 backdrop-blur-xl z-40">
        <Link to="/studio" className="btn-outline btn-sm">
          New film
        </Link>
        <div className="flex-1" />
        <div className="font-display font-medium tracking-[0.08em] uppercase text-[12px] text-gold hidden sm:block">
          Library
        </div>
        <div className="flex-1" />
        <Link to="/" className="btn-dark btn-sm">
          Home
        </Link>
      </div>

      <div className="container mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display font-medium text-[36px] leading-[1.08]">Recent films</h1>
              <p className="mt-2 text-[14.5px] text-muted">Browse, download and share.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={["p-2.5 rounded-xl border transition-colors", viewMode === "grid" ? "bg-gold text-ink border-gold" : "bg-surface text-bone-dim border-line hover:border-line2"].join(" ")}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={["p-2.5 rounded-xl border transition-colors", viewMode === "list" ? "bg-gold text-ink border-gold" : "bg-surface text-bone-dim border-line hover:border-line2"].join(" ")}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {films.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-2 border border-line grid place-items-center mx-auto mb-5 text-bone-dim">
              <Play className="w-7 h-7" />
            </div>
            <div className="font-display font-medium text-[22px]">No films yet</div>
            <div className="mt-2 text-[14px] text-bone-dim max-w-md mx-auto">
              Generate your first film from a product link. The library stays here for quick browsing and sharing.
            </div>
            <div className="mt-6 flex justify-center">
              <Link to="/studio" className="btn-primary">
                Create a film
              </Link>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {films.map((p: any, idx: number) => {
              const bg = p.thumbnailUrl
                ? `url(${p.thumbnailUrl}) center/cover`
                : fallbackScenes[idx % fallbackScenes.length];

              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className="group relative aspect-[9/16] rounded-2xl overflow-hidden border border-line hover:border-line2 transition-transform hover:-translate-y-1 text-left"
                >
                  <div className="absolute inset-0" style={{ background: bg }} />
                  <div className="absolute inset-0 p-4 flex flex-col justify-between [background:linear-gradient(180deg,rgba(0,0,0,.32),transparent_30%,transparent_58%,rgba(0,0,0,.60))]">
                    <span className="self-start text-[9px] uppercase tracking-[0.16em] font-semibold px-2.5 py-1 rounded-md border border-white/20 bg-black/40 backdrop-blur">
                      {p.style}
                    </span>
                    <div>
                      <b className="block font-display font-medium text-[16px] text-white line-clamp-2">
                        {p.productData?.title || "Untitled film"}
                      </b>
                      <small className="text-[11px] text-white/75">{p.productData?.price || ""}</small>
                    </div>
                  </div>
                  {p.isPublic && (
                    <div className="absolute top-3 right-3 text-[9px] uppercase tracking-[0.16em] font-semibold px-2.5 py-1 rounded-md border border-white/20 bg-black/40 backdrop-blur text-white/90">
                      Public
                    </div>
                  )}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-bone text-ink grid place-items-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all">
                    <Share2 className="w-5 h-5" />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {films.map((p: any, idx: number) => {
              const bg = p.thumbnailUrl
                ? `url(${p.thumbnailUrl}) center/cover`
                : fallbackScenes[idx % fallbackScenes.length];

              return (
                <div key={p.id} className="card p-6">
                  <div className="flex gap-5">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden border border-line flex-shrink-0 relative">
                      <div className="absolute inset-0" style={{ background: bg }} />
                      <div className="absolute inset-0 [background:linear-gradient(180deg,rgba(0,0,0,.20),rgba(0,0,0,.55))]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-display font-medium text-[18px] truncate">{p.productData?.title || "Untitled film"}</div>
                          <div className="mt-1 text-[13px] text-bone-dim">
                            {p.productData?.price || ""} · {p.style} · {p.aspectRatio}
                          </div>
                        </div>
                        <button onClick={() => setSelected(p)} className="btn-primary btn-sm">
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <a href={p.videoUrl} className="btn-outline btn-sm" download>
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                        {p.metadata?.pixVerseUrl && (
                          <a href={p.metadata.pixVerseUrl} className="btn-dark btn-sm" target="_blank" rel="noreferrer">
                            PixVerse link
                          </a>
                        )}
                        <button
                          onClick={() => handleCopy(p.videoUrl, p.id)}
                          className="btn-dark btn-sm"
                        >
                          {copiedId === p.id ? <Check className="w-4 h-4 text-sage" /> : <Copy className="w-4 h-4" />}
                          {copiedId === p.id ? "Copied" : "Copy download"}
                        </button>
                        <button
                          onClick={() => navigate(`/studio?taskId=${encodeURIComponent(p.id)}`)}
                          className="btn-ghost btn-sm"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl bg-surface border border-line rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="font-display font-medium text-[22px]">Share film</div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-white/5 transition-colors text-bone-dim hover:text-bone">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-line bg-ink-2 p-4 mb-6">
              <div className="font-display font-medium text-[18px]">{selected.productData?.title || "Untitled film"}</div>
              <div className="mt-1 text-[13px] text-bone-dim">{selected.productData?.price || ""}</div>
            </div>

            <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-line bg-ink-2 p-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] font-semibold text-muted">Landing page</div>
                <div className="mt-1 text-[14px] text-bone">{selected.isPublic ? "Public" : "Private"}</div>
              </div>
              <button
                onClick={() => {
                  const next = !selected.isPublic;
                  setProjectPublic(selected.id, next);
                  setSelected({ ...selected, isPublic: next });
                }}
                className={selected.isPublic ? "btn-dark btn-sm" : "btn-primary btn-sm"}
              >
                {selected.isPublic ? "Make private" : "Make public"}
              </button>
            </div>

            <div className="mb-6">
              <div className="text-[11px] uppercase tracking-[0.22em] font-semibold text-muted mb-3">Share</div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleShare("tiktok", selected)} className="flex items-center gap-3 p-4 rounded-2xl border border-line bg-ink-2 hover:border-line2 transition-colors">
                  <span className="w-10 h-10 rounded-xl bg-black text-white grid place-items-center">
                    <TikTokIcon className="w-5 h-5" />
                  </span>
                  <span className="font-medium">TikTok</span>
                </button>
                <button onClick={() => handleShare("instagram", selected)} className="flex items-center gap-3 p-4 rounded-2xl border border-line bg-ink-2 hover:border-line2 transition-colors">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6d28d9] via-[#db2777] to-[#f59e0b] text-white grid place-items-center">
                    <Instagram className="w-5 h-5" />
                  </span>
                  <span className="font-medium">Instagram</span>
                </button>
                <button onClick={() => handleShare("facebook", selected)} className="flex items-center gap-3 p-4 rounded-2xl border border-line bg-ink-2 hover:border-line2 transition-colors">
                  <span className="w-10 h-10 rounded-xl bg-[#1877F2] text-white grid place-items-center">
                    <Facebook className="w-5 h-5" />
                  </span>
                  <span className="font-medium">Facebook</span>
                </button>
                <button onClick={() => handleShare("twitter", selected)} className="flex items-center gap-3 p-4 rounded-2xl border border-line bg-ink-2 hover:border-line2 transition-colors">
                  <span className="w-10 h-10 rounded-xl bg-[#0ea5e9] text-white grid place-items-center">
                    <Twitter className="w-5 h-5" />
                  </span>
                  <span className="font-medium">Twitter</span>
                </button>
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] font-semibold text-muted mb-3">Copy link</div>
              <div className="flex gap-3">
                <input
                  value={selected.metadata?.pixVerseUrl || selected.videoUrl}
                  readOnly
                  className="input text-[13px]"
                />
                <button
                  onClick={() => handleCopy(selected.metadata?.pixVerseUrl || selected.videoUrl, selected.id)}
                  className="btn-primary"
                >
                  {copiedId === selected.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedId === selected.id ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
