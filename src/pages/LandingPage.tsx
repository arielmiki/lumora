import { motion, AnimatePresence } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import { ArrowUpRight, Check, Copy, Download, Instagram, Play, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import Navbar from "../components/Navbar";
import { useEffect, useMemo, useRef, useState } from "react";
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

const styleFilters = ["All", "Trending", "Funny", "Emotional", "Professional"] as const;

const sampleShowcase = [
  { title: "Midnight Renewal Serum", price: "$92", style: "Professional", duration: 30, aspectRatio: "9:16", store: "Hollyhoque", tag: "Limited release" },
  { title: "Cloud Cashmere Cardigan", price: "S$118", style: "Trending", duration: 45, aspectRatio: "9:16", store: "TikTok Shop", tag: "+312% engagement" },
  { title: "Wildgrove Coffee Beans", price: "$24", style: "Emotional", duration: 30, aspectRatio: "9:16", store: "Shopee SG", tag: "Single origin" },
  { title: "Glow Phone Stand", price: "S$28", style: "Funny", duration: 30, aspectRatio: "9:16", store: "TikTok Shop", tag: "Viral pick" },
];

function FilmCard({
  film,
  idx,
  onSelect,
}: {
  film: any;
  idx: number;
  onSelect: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const videoSrc: string | undefined = film.metadata?.pixVerseMp4Url || film.videoUrl;
  const poster: string | undefined = film.thumbnailUrl;
  const gradient = fallbackScenes[idx % fallbackScenes.length];
  const styleLabel = (film.style as string) || "Trending";

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (hovered) {
      v.currentTime = 0;
      void v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [hovered]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: Math.min(idx * 0.04, 0.32) }}
    >
      <button
        onClick={onSelect}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative block aspect-[9/16] w-full rounded-2xl overflow-hidden border border-line text-left transition-all duration-300 hover:border-gold/60 hover:-translate-y-1 hover:shadow-[0_22px_60px_-30px_rgba(227,189,131,0.45)] focus:outline-none focus:border-gold"
      >
        <div className="absolute inset-0" style={{ background: poster ? `url(${poster}) center/cover` : gradient }} />
        {videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={poster}
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          />
        )}
        <div className="absolute inset-0 pointer-events-none [background:linear-gradient(180deg,rgba(0,0,0,.42)_0%,rgba(0,0,0,0)_22%,rgba(0,0,0,0)_55%,rgba(0,0,0,.72)_100%)]" />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span className="text-[9.5px] uppercase tracking-[0.16em] font-semibold px-2.5 py-1 rounded-md border border-white/25 bg-black/45 backdrop-blur text-white">
            {styleLabel}
          </span>
          <span className="text-[10px] font-mono text-white/85 px-2 py-1 rounded-md bg-black/45 border border-white/15 backdrop-blur">
            {(film.duration || 30) + "s · " + (film.aspectRatio || "9:16")}
          </span>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-bone/85 text-ink grid place-items-center transition-all duration-300 opacity-90 group-hover:opacity-0 group-hover:scale-75 shadow-card">
          <Play className="w-4 h-4 fill-current" />
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <b className="block font-display font-medium text-[15.5px] leading-[1.18] line-clamp-2 drop-shadow-[0_2px_10px_rgba(0,0,0,.55)]">
            {film.productData?.title || "Untitled film"}
          </b>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-white/80">
            <span>{film.productData?.price || ""}</span>
            {film.productData?.store && <span className="opacity-60">·</span>}
            {film.productData?.store && <span className="opacity-80 truncate">{film.productData.store}</span>}
          </div>
        </div>
      </button>
    </motion.div>
  );
}

function SampleFilmCard({ film, idx }: { film: typeof sampleShowcase[number]; idx: number }) {
  const gradient = fallbackScenes[idx % fallbackScenes.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: Math.min(idx * 0.05, 0.3) }}
    >
      <RouterLink
        to="/studio"
        className="group relative block aspect-[9/16] w-full rounded-2xl overflow-hidden border border-dashed border-line2 text-left transition-all duration-300 hover:border-gold/60 hover:-translate-y-1"
      >
        <div className="absolute inset-0" style={{ background: gradient }} />
        <div className="absolute inset-0 pointer-events-none [background:linear-gradient(180deg,rgba(0,0,0,.32)_0%,rgba(0,0,0,0)_28%,rgba(0,0,0,0)_55%,rgba(0,0,0,.72)_100%)]" />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span className="text-[9.5px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-md border border-gold/40 bg-gold/10 text-gold backdrop-blur">
            Sample
          </span>
          <span className="text-[10px] font-mono text-white/80 px-2 py-1 rounded-md bg-black/40 border border-white/15 backdrop-blur">
            {film.duration}s · {film.aspectRatio}
          </span>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="w-12 h-12 rounded-full bg-gold text-ink grid place-items-center shadow-card">
            <Sparkles className="w-5 h-5" />
          </span>
          <span className="text-[11px] uppercase tracking-[0.22em] font-semibold">Build like this</span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <b className="block font-display font-medium text-[15.5px] leading-[1.18] drop-shadow-[0_2px_10px_rgba(0,0,0,.55)]">
            {film.title}
          </b>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-white/80">
            <span>{film.price}</span>
            <span className="opacity-60">·</span>
            <span className="opacity-80 truncate">{film.store}</span>
          </div>
          <div className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-gold/80">{film.tag}</div>
        </div>
      </RouterLink>
    </motion.div>
  );
}

const TikTokIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

export default function LandingPage() {
  const { recentProjects } = useStore();
  const [selected, setSelected] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [styleFilter, setStyleFilter] = useState<(typeof styleFilters)[number]>("All");
  const [modalMuted, setModalMuted] = useState(true);

  const allFilms = useMemo(() => {
    return recentProjects.filter((p) => p.status === "ready" && p.videoUrl).slice(0, 12);
  }, [recentProjects]);

  const films = useMemo(() => {
    if (styleFilter === "All") return allFilms;
    const q = styleFilter.toLowerCase();
    return allFilms.filter((f) => (f.style || "").toLowerCase() === q);
  }, [allFilms, styleFilter]);

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
                  PixVerse prompt builder · Marketplace showcase
                </div>

                <h1 className="mt-6 font-display font-medium leading-[1.02] tracking-[-0.015em] text-[clamp(46px,6.6vw,90px)]">
                  PixVerse <em className="italic font-medium">prompts,</em>
                  <br />
                  shot-ready in <span className="text-transparent [text-stroke:1px_theme(colors.gold.DEFAULT)] [-webkit-text-stroke:1px_theme(colors.gold.DEFAULT)]">seconds</span>.
                </h1>

                <p className="mt-7 text-[clamp(17px,1.6vw,20px)] text-bone-dim max-w-[520px]">
                  Lumora turns any TikTok Shop or Shopee link into a ready-to-run PixVerse shot pack — prompts, captions and reference images for every scene — then showcases the finished films in a public marketplace.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <RouterLink to="/studio" className="btn-primary">
                    Build a PixVerse shot pack <ArrowUpRight className="w-4 h-4" />
                  </RouterLink>
                  <a href="#public" className="btn-outline">
                    <Play className="w-4 h-4" />
                    Browse the showcase
                  </a>
                </div>

                <div className="mt-6 text-[13px] text-muted flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-gold shadow-[0_0_10px_theme(colors.gold.DEFAULT)]" />
                  Powered by PixVerse · Prompts ready in under a minute · Showcase your final films
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
                Marketplace showcase
                {allFilms.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md border border-gold/40 bg-gold/10 text-gold tracking-[0.18em] text-[10px] normal-case">
                    {allFilms.length} live
                  </span>
                )}
              </div>
              <h2 className="mt-4 font-display font-medium text-[clamp(30px,4.4vw,52px)]">
                PixVerse films from the community
              </h2>
              <p className="mt-3 text-[14.5px] text-bone-dim max-w-xl">
                Browse, preview, and remix PixVerse renders other creators have published from TikTok Shop and Shopee product pages.
              </p>
            </div>

            {allFilms.length >= 3 && (
              <div className="flex flex-wrap gap-2">
                {styleFilters.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyleFilter(s)}
                    className={[
                      "px-3.5 py-1.5 rounded-full text-[12px] font-medium tracking-[0.02em] transition-colors border",
                      styleFilter === s
                        ? "bg-gold text-ink border-gold"
                        : "bg-ink-2 text-bone-dim border-line hover:border-line2 hover:text-bone",
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {allFilms.length === 0 ? (
            <>
              <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-5">
                {sampleShowcase.map((film, idx) => (
                  <SampleFilmCard key={film.title} film={film} idx={idx} />
                ))}
              </div>
              <div className="mt-10 card p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                <div>
                  <div className="font-display font-medium text-[20px]">Showcase your first render</div>
                  <div className="mt-1.5 text-[14px] text-bone-dim max-w-lg">
                    These are samples. Drop a TikTok Shop or Shopee link in Studio and your real film lands here, ready for the community to remix.
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <RouterLink to="/studio" className="btn-primary">
                    Open prompt builder <ArrowUpRight className="w-4 h-4" />
                  </RouterLink>
                </div>
              </div>
            </>
          ) : films.length === 0 ? (
            <div className="mt-12 card p-10 text-center">
              <div className="font-display font-medium text-[20px]">No {styleFilter.toLowerCase()} films yet</div>
              <div className="mt-2 text-[14px] text-bone-dim max-w-md mx-auto">
                Pick a different style filter or build the first one yourself.
              </div>
              <div className="mt-6 flex justify-center gap-3">
                <button onClick={() => setStyleFilter("All")} className="btn-outline">
                  Show all
                </button>
                <RouterLink to="/studio" className="btn-primary">
                  Open prompt builder <ArrowUpRight className="w-4 h-4" />
                </RouterLink>
              </div>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-5">
              {films.map((p, idx) => (
                <FilmCard key={p.id} film={p} idx={idx} onSelect={() => setSelected(p)} />
              ))}
            </div>
          )}
        </section>

        <section className="mb-28 rounded-3xl border border-line2 bg-gradient-to-br from-[#241a0e] via-ink to-ink px-8 py-16 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute -top-44 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full blur-[95px] bg-gold/20" />
          <h2 className="relative z-10 font-display font-medium text-[clamp(36px,5.2vw,66px)] leading-[1.04]">
            Drop a product link.
            <br />
            Get a PixVerse shot pack.
          </h2>
          <p className="relative z-10 mt-5 text-bone-dim max-w-xl mx-auto">
            Build prompts, generate cinematic shots, publish to the marketplace showcase — all in one place.
          </p>
          <div className="relative z-10 mt-8 flex justify-center">
            <RouterLink to="/studio" className="btn-primary">
              Open the prompt builder <ArrowUpRight className="w-4 h-4" />
            </RouterLink>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selected && (
          <motion.div
            key="film-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl bg-surface border border-line rounded-3xl overflow-hidden shadow-[0_30px_120px_-20px_rgba(0,0,0,0.6)]"
            >
              <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                <div className="relative bg-black">
                  <div className="aspect-[9/16] max-h-[82vh] mx-auto relative">
                    <video
                      key={selected.videoUrl || selected.metadata?.pixVerseUrl}
                      src={selected.metadata?.pixVerseMp4Url || selected.videoUrl || selected.metadata?.pixVerseUrl}
                      controls
                      autoPlay
                      muted={modalMuted}
                      playsInline
                      className="w-full h-full object-cover"
                      poster={selected.thumbnailUrl}
                    />
                    <button
                      onClick={() => setModalMuted((m) => !m)}
                      className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/55 backdrop-blur border border-white/15 text-white grid place-items-center hover:bg-black/75 transition-colors"
                      aria-label={modalMuted ? "Unmute" : "Mute"}
                    >
                      {modalMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col max-h-[82vh]">
                  <div className="p-5 border-b border-line flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9.5px] uppercase tracking-[0.18em] font-semibold px-2 py-0.5 rounded-md border border-gold/40 bg-gold/10 text-gold">
                          {selected.style || "Trending"}
                        </span>
                        <span className="text-[10.5px] font-mono text-bone-dim px-2 py-0.5 rounded-md border border-line bg-ink-2">
                          {(selected.duration || 30) + "s · " + (selected.aspectRatio || "9:16")}
                        </span>
                      </div>
                      <div className="font-display font-medium text-[20px] leading-tight">{selected.productData?.title || "Untitled film"}</div>
                      <div className="mt-1 text-[13px] text-bone-dim truncate">
                        {selected.productData?.price || ""}
                        {selected.productData?.store && <span className="opacity-60"> · {selected.productData.store}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="p-2 rounded-xl hover:bg-white/5 transition-colors text-bone-dim hover:text-bone flex-shrink-0"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-5 space-y-5 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={selected.downloadUrl || selected.videoUrl}
                        className="btn-primary btn-sm"
                        download
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                      <RouterLink to={`/studio?campaignId=${encodeURIComponent(selected.id)}`} className="btn-dark btn-sm">
                        <Sparkles className="w-4 h-4" />
                        Remix in studio
                      </RouterLink>
                      {(selected.metadata?.pdpUrl || selected.productUrl || selected.productData?.url) && (
                        <a
                          href={selected.metadata?.pdpUrl || selected.productUrl || selected.productData?.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-outline btn-sm"
                        >
                          Product page <ArrowUpRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <div>
                      <div className="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-muted mb-2.5">Share</div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button onClick={() => handleShare("tiktok", selected)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-line bg-ink-2 hover:border-line2 transition-colors">
                          <span className="w-8 h-8 rounded-lg bg-black text-white grid place-items-center">
                            <TikTokIcon className="w-4 h-4" />
                          </span>
                          <span className="font-medium text-[13px]">TikTok</span>
                        </button>
                        <button onClick={() => handleShare("instagram", selected)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-line bg-ink-2 hover:border-line2 transition-colors">
                          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6d28d9] via-[#db2777] to-[#f59e0b] text-white grid place-items-center">
                            <Instagram className="w-4 h-4" />
                          </span>
                          <span className="font-medium text-[13px]">Instagram</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-muted mb-2.5">Copy download link</div>
                      <div className="flex gap-2">
                        <input value={selected.downloadUrl || selected.videoUrl} readOnly className="input text-[12.5px]" />
                        <button
                          onClick={() => handleCopy(selected.downloadUrl || selected.videoUrl, selected.id)}
                          className="btn-primary btn-sm flex-shrink-0"
                        >
                          {copiedId === selected.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copiedId === selected.id ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-line py-16">
        <div className="container mx-auto px-6">
          <div className="grid gap-10 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="font-display font-semibold tracking-[0.14em] uppercase text-[18px]">Lumora</div>
              <p className="mt-4 text-[14px] text-muted max-w-[320px]">
                The PixVerse prompt builder for ecommerce — drop in any marketplace link, get a shot-ready prompt pack, and publish to the community showcase.
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
