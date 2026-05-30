import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import { ArrowUpRight, Check, Copy, Download, Instagram, Play, Share2, X } from "lucide-react";
import Navbar from "../components/Navbar";
import { useMemo, useState } from "react";
import { useStore } from "../stores/useStore";

const platforms = [
  "Instagram Reels",
  "TikTok",
  "YouTube Shorts",
  "Pinterest",
  "Snapchat",
  "Facebook",
  "Shopify",
  "Amazon",
];

const fallbackScenes = [
  "radial-gradient(120% 70% at 70% 15%,rgba(227,189,131,.45),transparent 60%),linear-gradient(160deg,#3a2c1c,#19120b)",
  "radial-gradient(120% 70% at 30% 20%,rgba(189,140,162,.4),transparent 60%),linear-gradient(160deg,#2b1f2a,#140d13)",
  "radial-gradient(120% 70% at 60% 18%,rgba(170,185,145,.4),transparent 60%),linear-gradient(160deg,#222b18,#10140b)",
  "radial-gradient(120% 70% at 40% 22%,rgba(212,149,122,.45),transparent 60%),linear-gradient(160deg,#2e1d16,#140b08)",
];

const TikTokIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

export default function LandingPage() {
  const { recentProjects } = useStore();
  const [selected, setSelected] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const films = useMemo(() => {
    return recentProjects.filter((p) => p.status === "ready" && p.videoUrl).slice(0, 12);
  }, [recentProjects]);

  const handleCopy = async (value: string, id: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const handleShare = (platform: "tiktok" | "instagram", project: any) => {
    if (platform === "tiktok") {
      window.open("https://www.tiktok.com/upload", "_blank", "width=900,height=700");
      return;
    }

    if (platform === "instagram") {
      alert("Instagram Reels uploads must be done in the Instagram app. Download the film first, then upload.");
    }
  };

  return (
    <div className="min-h-screen bg-ink text-bone">
      <Navbar />

      <header className="relative overflow-hidden pt-40 pb-20">
        <div className="pointer-events-none absolute -top-28 -left-28 w-[540px] h-[540px] rounded-full blur-[95px] bg-gold/15" />
        <div className="pointer-events-none absolute top-10 -right-36 w-[480px] h-[480px] rounded-full blur-[95px] bg-plum/15" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                <div className="inline-flex items-center gap-3 text-[11.5px] uppercase tracking-[0.28em] font-semibold text-gold">
                  <span className="w-7 h-px bg-gold/60" />
                  AI video studio for modern commerce
                </div>

                <h1 className="mt-6 font-display font-medium leading-[1.02] tracking-[-0.015em] text-[clamp(46px,6.6vw,90px)]">
                  Cinematic <em className="italic font-medium">product video,</em>
                  <br />
                  generated in <span className="text-transparent [text-stroke:1px_theme(colors.gold.DEFAULT)] [-webkit-text-stroke:1px_theme(colors.gold.DEFAULT)]">seconds</span>.
                </h1>

                <p className="mt-7 text-[clamp(17px,1.6vw,20px)] text-bone-dim max-w-[520px]">
                  Lumora turns a product link into a campaign-grade vertical film — script, scenes, captions and sound — exported for every
                  channel before your coffee cools.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <RouterLink to="/studio" className="btn-primary">
                    Generate your first film <ArrowUpRight className="w-4 h-4" />
                  </RouterLink>
                  <a href="#public" className="btn-outline">
                    <Play className="w-4 h-4" />
                    See generated films
                  </a>
                </div>

                <div className="mt-6 text-[13px] text-muted flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-gold shadow-[0_0_10px_theme(colors.gold.DEFAULT)]" />
                  No card required · 5 complimentary renders · Ready in under a minute
                </div>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
              <div className="relative mx-auto w-[284px]">
                <div className="h-[566px] rounded-[44px] border-[7px] border-[#342b20] bg-gradient-to-br from-[#2a231a] to-ink shadow-card overflow-hidden">
                  <div className="h-full w-full rounded-[37px] bg-black overflow-hidden relative">
                    <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                      <div className="absolute top-4 left-4 right-4 flex gap-1">
                        <span className="h-1 flex-1 rounded bg-white/25 overflow-hidden">
                          <span className="block h-full w-full origin-left animate-[lumoraFill_10s_linear_infinite] bg-white" />
                        </span>
                        <span className="h-1 flex-1 rounded bg-white/25 overflow-hidden">
                          <span className="block h-full w-full origin-left animate-[lumoraFill_10s_linear_infinite] [animation-delay:3.33s] bg-white" />
                        </span>
                        <span className="h-1 flex-1 rounded bg-white/25 overflow-hidden">
                          <span className="block h-full w-full origin-left animate-[lumoraFill_10s_linear_infinite] [animation-delay:6.66s] bg-white" />
                        </span>
                      </div>

                      <span className="mb-auto inline-flex self-start text-[9.5px] uppercase tracking-[0.18em] font-semibold px-3 py-1.5 rounded-md border border-white/20 bg-black/40 backdrop-blur">
                        Auto-directed
                      </span>
                      <h3 className="font-display font-medium text-[27px] leading-[1.06] drop-shadow-[0_2px_14px_rgba(0,0,0,.45)]">
                        The Midnight
                        <br />
                        Renewal Serum
                      </h3>
                      <div className="mt-2 text-[14px] font-semibold tracking-[0.04em] text-gold-soft">$92 · Limited release</div>
                      <div className="mt-3 text-[12px] text-white/80">A quiet ritual for luminous skin by morning.</div>
                    </div>

                    <div className="absolute inset-0 -z-10 animate-[lumoraReel_10s_infinite] [background:radial-gradient(120%_65%_at_70%_18%,rgba(227,189,131,.5),transparent_60%),radial-gradient(120%_80%_at_20%_92%,rgba(189,140,162,.4),transparent_55%),linear-gradient(180deg,#3a2c1c,#1a130c)]" />
                  </div>
                </div>

                <div className="hidden lg:flex absolute top-10 -left-28 items-center gap-3 px-4 py-3 rounded-2xl border border-line2 bg-ink/70 backdrop-blur shadow-card-soft animate-[lumoraBob_5.5s_ease-in-out_infinite]">
                  <span className="w-8 h-8 rounded-xl grid place-items-center text-gold bg-surface-3">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="6" width="13" height="12" rx="2" />
                      <path d="M16 10l5-3v10l-5-3z" />
                    </svg>
                  </span>
                  <span className="text-[12.5px]">
                    <b className="font-semibold text-bone">Script ready</b>
                    <span className="block text-[10.5px] text-muted">hook + 3 scenes</span>
                  </span>
                </div>

                <div className="hidden lg:flex absolute bottom-32 -right-32 items-center gap-3 px-4 py-3 rounded-2xl border border-line2 bg-ink/70 backdrop-blur shadow-card-soft animate-[lumoraBob_5.5s_ease-in-out_infinite] [animation-delay:1.3s]">
                  <span className="w-8 h-8 rounded-xl grid place-items-center text-gold bg-surface-3">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-[12.5px]">
                    <b className="font-semibold text-bone">Rendered 9:16</b>
                    <span className="block text-[10.5px] text-muted">0:42 · 4K HDR</span>
                  </span>
                </div>

                <div className="hidden lg:flex absolute bottom-6 -left-20 items-center gap-3 px-4 py-3 rounded-2xl border border-line2 bg-ink/70 backdrop-blur shadow-card-soft animate-[lumoraBob_5.5s_ease-in-out_infinite] [animation-delay:2.3s]">
                  <span className="w-8 h-8 rounded-xl grid place-items-center text-gold bg-surface-3">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 19V9m5 10V5m5 14v-7m5 7V8" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className="text-[12.5px]">
                    <b className="font-semibold text-bone">+312%</b>
                    <span className="block text-[10.5px] text-muted">est. engagement</span>
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-20 border-y border-line py-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
            <div className="flex gap-16 w-max animate-lumora-marquee">
              {[...platforms, ...platforms].map((p, i) => (
                <div key={`${p}-${i}`} className="flex items-center gap-3 font-display text-[22px] font-medium text-bone-dim/70 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-gold/70" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6">
        <section id="public" className="py-20">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-3 text-[11.5px] uppercase tracking-[0.28em] font-semibold text-gold">
                Public gallery
              </div>
              <h2 className="mt-4 font-display font-medium text-[clamp(30px,4.4vw,52px)]">
                Generated product films
              </h2>
              <p className="mt-3 text-[14.5px] text-bone-dim max-w-xl">
                Your latest renders appear here for preview, download, and quick sharing.
              </p>
            </div>
          </div>

          {films.length === 0 ? (
            <div className="mt-10 card p-10 text-center">
              <div className="font-display font-medium text-[22px]">No films yet</div>
              <div className="mt-2 text-[14px] text-bone-dim max-w-md mx-auto">
                Paste a product link in Studio to generate your first product film.
              </div>
              <div className="mt-6 flex justify-center gap-3">
                <RouterLink to="/studio" className="btn-primary">
                  Open studio <ArrowUpRight className="w-4 h-4" />
                </RouterLink>
              </div>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-5">
              {films.map((p, idx) => {
                const bg = p.thumbnailUrl ? `url(${p.thumbnailUrl}) center/cover` : fallbackScenes[idx % fallbackScenes.length];
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: idx * 0.03 }}
                  >
                    <button
                      onClick={() => setSelected(p)}
                      className="group relative block aspect-[9/16] w-full rounded-2xl overflow-hidden border border-line hover:border-line2 transition-transform duration-200 hover:-translate-y-1 text-left"
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
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-bone text-ink grid place-items-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all">
                        <Share2 className="w-5 h-5" />
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mb-28 rounded-3xl border border-line2 bg-gradient-to-br from-[#241a0e] via-ink to-ink px-8 py-16 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute -top-44 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full blur-[95px] bg-gold/20" />
          <h2 className="relative z-10 font-display font-medium text-[clamp(36px,5.2vw,66px)] leading-[1.04]">
            Your next campaign
            <br />
            is one paste away.
          </h2>
          <p className="relative z-10 mt-5 text-bone-dim max-w-xl mx-auto">
            Join brands turning product pages into films that sell while they sleep.
          </p>
          <div className="relative z-10 mt-8 flex justify-center">
            <RouterLink to="/studio" className="btn-primary">
              Open the studio <ArrowUpRight className="w-4 h-4" />
            </RouterLink>
          </div>
        </section>
      </main>

      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl bg-surface border border-line rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-line flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-display font-medium text-[18px] truncate">{selected.productData?.title || "Untitled film"}</div>
                <div className="mt-1 text-[12.5px] text-bone-dim truncate">{selected.productData?.price || ""}</div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-white/5 transition-colors text-bone-dim hover:text-bone">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid lg:grid-cols-[1fr_380px]">
              <div className="bg-black">
                <div className="aspect-[9/16] max-h-[78vh] mx-auto">
                  <video
                    key={selected.videoUrl || selected.metadata?.pixVerseUrl}
                    src={selected.metadata?.pixVerseMp4Url || selected.videoUrl || selected.metadata?.pixVerseUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                    poster={selected.thumbnailUrl}
                  />
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="text-[11px] uppercase tracking-[0.22em] font-semibold text-muted">Actions</div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={selected.downloadUrl || selected.videoUrl}
                    className="btn-primary btn-sm"
                    download
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                  {(selected.metadata?.pdpUrl || selected.productUrl || selected.productData?.url) && (
                    <a
                      href={selected.metadata?.pdpUrl || selected.productUrl || selected.productData?.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-dark btn-sm"
                    >
                      Checkout <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                  <RouterLink to={`/studio?campaignId=${encodeURIComponent(selected.id)}`} className="btn-outline btn-sm">
                    Open in studio <ArrowUpRight className="w-4 h-4" />
                  </RouterLink>
                </div>

                <div className="pt-2">
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
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-[11px] uppercase tracking-[0.22em] font-semibold text-muted mb-3">Copy download link</div>
                  <div className="flex gap-3">
                    <input value={selected.downloadUrl || selected.videoUrl} readOnly className="input text-[13px]" />
                    <button
                      onClick={() => handleCopy(selected.downloadUrl || selected.videoUrl, selected.id)}
                      className="btn-primary"
                    >
                      {copiedId === selected.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedId === selected.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <footer className="border-t border-line py-16">
        <div className="container mx-auto px-6">
          <div className="grid gap-10 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="font-display font-semibold tracking-[0.14em] uppercase text-[18px]">Lumora</div>
              <p className="mt-4 text-[14px] text-muted max-w-[320px]">
                The AI film studio that turns ecommerce products into cinematic, social-ready video — in seconds, at scale.
              </p>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted mb-4">Product</div>
              <RouterLink className="block text-bone-dim hover:text-gold transition-colors mb-3" to="/studio">
                Studio
              </RouterLink>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted mb-4">Resources</div>
              <a className="block text-bone-dim hover:text-gold transition-colors mb-3" href="#">
                Help center
              </a>
              <a className="block text-bone-dim hover:text-gold transition-colors mb-3" href="#">
                API docs
              </a>
              <a className="block text-bone-dim hover:text-gold transition-colors mb-3" href="#">
                Status
              </a>
            </div>
          </div>

          <div className="mt-12 pt-7 border-t border-line flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted">
            <span>© 2026 Lumora Studio Inc. All rights reserved.</span>
            <span>Privacy · Terms · Cookies</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
