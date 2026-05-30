import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { LayoutGrid, Plus, Video, Search, Sparkles, ArrowUpRight, Clock, TrendingUp } from "lucide-react";
import { useStore } from "../stores/useStore";

function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 5.2 L18.9 9.1 L18.9 14.9 L12 18.8 L5.1 14.9 L5.1 9.1 Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="12" cy="12" r="2.1" fill="currentColor" />
    </svg>
  );
}

const chart = [
  { d: "Mon", reels: 34, tok: 52, short: 18 },
  { d: "Tue", reels: 48, tok: 40, short: 26 },
  { d: "Wed", reels: 60, tok: 55, short: 30 },
  { d: "Thu", reels: 42, tok: 70, short: 22 },
  { d: "Fri", reels: 75, tok: 62, short: 40 },
  { d: "Sat", reels: 90, tok: 80, short: 55 },
  { d: "Sun", reels: 68, tok: 95, short: 48 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { recentProjects } = useStore();
  const [productUrl, setProductUrl] = useState("");
  const [style, setStyle] = useState<"editorial" | "cinematic" | "unboxing" | "testimonial" | "quiet-luxe">("editorial");
  const [ratio, setRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");

  const readyCount = recentProjects.filter((p) => p.status === "ready").length;

  const max = useMemo(() => {
    return Math.max(...chart.map((x) => x.reels + x.tok + x.short));
  }, []);

  const handleGenerate = () => {
    if (!productUrl.trim()) return;
    navigate(`/studio?url=${encodeURIComponent(productUrl)}&style=${encodeURIComponent(style)}&ratio=${encodeURIComponent(ratio)}`);
  };

  const styleToStudio = (s: typeof style) => {
    if (s === "quiet-luxe") return "professional";
    return s;
  };

  return (
    <div className="min-h-screen bg-ink text-bone flex">
      <aside className="hidden lg:flex w-[250px] flex-none bg-ink-2 border-r border-line px-4 py-6 flex-col sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-3 font-display font-semibold tracking-[0.14em] uppercase px-2 pb-6">
          <span className="w-7 h-7 text-gold grid place-items-center">
            <Mark className="w-7 h-7" />
          </span>
          <span className="text-[18px]">Lumora</span>
        </Link>

        <div className="mb-6">
          <div className="px-2 pb-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-2">Studio</div>
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-2 text-bone">
            <LayoutGrid className="w-[18px] h-[18px] text-gold" />
            <span className="text-[14.5px] font-medium">Dashboard</span>
          </Link>
          <Link to="/studio" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-bone-dim hover:text-bone hover:bg-surface transition-colors">
            <Plus className="w-[18px] h-[18px]" />
            <span className="text-[14.5px] font-medium">Create film</span>
          </Link>
          <Link to="/gallery" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-bone-dim hover:text-bone hover:bg-surface transition-colors">
            <Video className="w-[18px] h-[18px]" />
            <span className="text-[14.5px] font-medium">Library</span>
            <span className="ml-auto text-[10px] font-semibold bg-gold text-ink px-2 py-0.5 rounded-full tracking-[0.08em]">
              {readyCount}
            </span>
          </Link>
        </div>

        <div className="mt-auto rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/10 to-surface p-4">
          <div className="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-gold">Studio plan</div>
          <div className="mt-3 h-2 rounded-full bg-surface-3 overflow-hidden">
            <div className="h-full w-[62%] bg-gradient-to-r from-gold to-gold-deep" />
          </div>
          <div className="mt-2 text-[12px] text-muted">93 of 150 renders left</div>
          <button className="btn-primary btn-sm w-full mt-3">Upgrade plan</button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="h-[70px] border-b border-line flex items-center gap-4 px-6 sticky top-0 bg-ink/80 backdrop-blur-xl z-40">
          <div className="hidden sm:flex items-center gap-3 bg-surface border border-line rounded-xl px-4 py-2 text-muted w-full max-w-[430px]">
            <Search className="w-4 h-4" />
            <input
              className="bg-transparent outline-none border-none text-bone placeholder:text-muted w-full text-[14px]"
              placeholder="Search films, directions, products…"
            />
          </div>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-2 text-[13px] tracking-[0.04em] bg-surface border border-line px-4 py-2 rounded-xl font-medium">
            <TrendingUp className="w-4 h-4 text-gold" />
            <span className="text-muted">Credits</span>
            <b className="text-gold">93</b>
          </div>
          <Link to="/studio" className="btn-primary btn-sm">
            + New film
          </Link>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-clay grid place-items-center font-display font-semibold text-ink">
            JD
          </div>
        </div>

        <div className="px-6 py-8 max-w-[1280px]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-display font-medium text-[36px] leading-[1.08]">Welcome back</h1>
                <div className="mt-2 text-[14.5px] text-muted">
                  You&apos;ve composed <b className="text-bone">23 films</b> this week — up 41% from last week.
                </div>
              </div>
              <button className="btn-dark btn-sm">Export report</button>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Video, val: "128", lbl: "Films generated", trend: "↑ 41%", trendTone: "bg-sage/15 text-sage" },
              { icon: TrendingUp, val: "4.6M", lbl: "Total views", trend: "↑ 18%", trendTone: "bg-sage/15 text-sage" },
              { icon: Sparkles, val: "93", lbl: "Credits remaining", trend: "↓ 57", trendTone: "bg-clay/15 text-clay" },
              { icon: Clock, val: "52s", lbl: "Avg. render time", trend: "↑ fast", trendTone: "bg-sage/15 text-sage" },
            ].map((k) => (
              <div key={k.lbl} className="bg-surface border border-line rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl grid place-items-center bg-surface-3 text-gold">
                    <k.icon className="w-[18px] h-[18px]" />
                  </div>
                  <span className={`text-[12px] font-semibold tracking-[0.03em] px-2.5 py-1 rounded-full ${k.trendTone}`}>
                    {k.trend}
                  </span>
                </div>
                <div className="mt-5 font-display font-medium text-[34px] tracking-[-0.02em]">{k.val}</div>
                <div className="mt-1 text-[13px] text-muted">{k.lbl}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-5 mb-6">
            <div className="bg-surface border border-line rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-medium text-[19px]">Compose a new film</h3>
                <span className="text-[12px] uppercase tracking-[0.1em] font-semibold text-gold">Advanced ↗</span>
              </div>

              <div className="mb-5">
                <label className="label">Product link or name</label>
                <div className="flex items-center gap-3 bg-ink-2 border border-line rounded-xl px-4 py-3 focus-within:border-gold/70 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] text-muted" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1" strokeLinecap="round" />
                  </svg>
                  <input
                    className="bg-transparent outline-none border-none text-bone placeholder:text-muted w-full text-[14px]"
                    placeholder="Paste a product URL…"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleGenerate();
                    }}
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="label">Direction</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "editorial" as const, label: "Editorial" },
                    { id: "cinematic" as const, label: "Cinematic" },
                    { id: "unboxing" as const, label: "Unboxing" },
                    { id: "testimonial" as const, label: "Testimonial" },
                    { id: "quiet-luxe" as const, label: "Quiet luxe" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={[
                        "text-[13px] px-4 py-2 rounded-xl border transition-colors",
                        style === s.id ? "bg-gold text-ink border-gold font-semibold" : "bg-ink-2 text-bone-dim border-line hover:border-line2",
                      ].join(" ")}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="label">Aspect ratio</label>
                <div className="flex gap-2">
                  {(["9:16", "1:1", "16:9"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRatio(r)}
                      className={[
                        "flex-1 text-[13px] px-4 py-2 rounded-xl border transition-colors",
                        ratio === r ? "bg-gold text-ink border-gold font-semibold" : "bg-ink-2 text-bone-dim border-line hover:border-line2",
                      ].join(" ")}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleGenerate} disabled={!productUrl.trim()} className="btn-primary w-full mt-2">
                Generate film <ArrowUpRight className="w-4 h-4" />
              </button>

              <div className="mt-4 text-[12px] text-muted">
                Studio direction mapped to: <b className="text-bone">{styleToStudio(style)}</b>
              </div>
            </div>

            <div className="bg-surface border border-line rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-medium text-[19px]">Views this week</h3>
                <span className="text-[12px] uppercase tracking-[0.1em] font-semibold text-gold">7 days ▾</span>
              </div>

              <div className="flex gap-6 mb-3 text-[12.5px] text-muted">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-gold" />
                  Reels
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-clay" />
                  TikTok
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-sage" />
                  Shorts
                </span>
              </div>

              <div className="h-[200px] flex items-end gap-3 pt-2">
                {chart.map((x) => {
                  const stack = x.reels + x.tok + x.short;
                  const scale = (stack / max) * 150;
                  const reelsH = (x.reels / stack) * scale;
                  const tokH = (x.tok / stack) * scale;
                  const shortH = (x.short / stack) * scale;
                  return (
                    <div key={x.d} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
                      <div className="w-full flex flex-col-reverse gap-1 justify-start" style={{ height: "100%" }}>
                        <div className="w-full rounded-t-md" style={{ height: `${reelsH}px`, background: "#e3bd83" }} />
                        <div className="w-full rounded-t-md" style={{ height: `${tokH}px`, background: "#d4957a" }} />
                        <div className="w-full rounded-t-md" style={{ height: `${shortH}px`, background: "#aab991" }} />
                      </div>
                      <span className="text-[11px] tracking-[0.06em] text-muted-2 font-medium">{x.d}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-surface border border-line rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-medium text-[19px]">Recent films</h3>
              <Link to="/gallery" className="text-[12px] uppercase tracking-[0.1em] font-semibold text-gold">
                View library ↗
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="text-muted text-[14px]">No films yet. Paste a product link above to begin.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {recentProjects.slice(0, 6).map((p) => {
                  const statusTone =
                    p.status === "ready"
                      ? "bg-sage/20 text-sage border-sage/30"
                      : p.status === "processing"
                        ? "bg-gold/20 text-gold border-gold/30"
                        : "bg-black/40 text-bone-dim border-line2";

                  const statusLabel = p.status === "ready" ? "● Ready" : p.status === "processing" ? "● Rendering" : "● Failed";

                  return (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/studio?taskId=${encodeURIComponent(p.id)}`)}
                      className="text-left bg-surface-2 border border-line rounded-xl overflow-hidden hover:-translate-y-1 transition-transform"
                    >
                      <div className="relative aspect-[9/16]">
                        <div
                          className="absolute inset-0"
                          style={{
                            background: p.thumbnailUrl
                              ? `url(${p.thumbnailUrl}) center/cover`
                              : "radial-gradient(120% 70% at 70% 15%,rgba(227,189,131,.35),transparent 60%),linear-gradient(160deg,#3a2c1c,#19120b)",
                          }}
                        />
                        <div className="absolute inset-0 p-3 flex flex-col justify-between [background:linear-gradient(180deg,rgba(0,0,0,.28),transparent_45%,rgba(0,0,0,.55))]">
                          <span className={`inline-flex self-start text-[9px] uppercase tracking-[0.14em] font-semibold px-2 py-1 rounded-md border ${statusTone}`}>
                            {statusLabel}
                          </span>
                          <span className="inline-flex self-start text-[9px] uppercase tracking-[0.08em] font-semibold px-2 py-1 rounded-md border border-white/15 bg-black/40 text-white/90 backdrop-blur">
                            {p.aspectRatio}
                          </span>
                        </div>
                      </div>
                      <div className="px-3 py-3">
                        <b className="block font-display font-medium text-[14.5px] truncate">{p.productData?.title || "Untitled film"}</b>
                        <small className="block mt-1 text-[11.5px] text-muted font-medium tracking-[0.04em]">
                          {p.productData?.price || ""} · {p.style}
                        </small>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
