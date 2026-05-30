export type PixVerseStyle = "trending" | "funny" | "emotional" | "professional";

const STYLE_MAP: Record<PixVerseStyle, string> = {
  trending: "dynamic, trending, viral TikTok style, energetic",
  funny: "funny, comedic, humorous, lighthearted",
  emotional: "emotional, touching, heartfelt, story-driven",
  professional: "professional, clean, polished, sleek",
};

function platformHint(aspectRatio: string) {
  if (aspectRatio === "9:16") return "TikTok / Instagram Reels / YouTube Shorts";
  if (aspectRatio === "1:1") return "Instagram feed / marketplace ads";
  return "YouTube / website hero / marketplace ads";
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

function extractFeaturePhrases(raw: string) {
  const text = (raw || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
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

export function buildPixVerseShotPack(params: {
  title?: string;
  description?: string;
  price?: string;
  store?: string;
  rating?: number;
  reviews?: number;
  style: PixVerseStyle;
  aspectRatio: string;
  duration: number;
}) {
  const title = (params.title || "").trim();
  const description = (params.description || "").trim();
  const price = (params.price || "").trim();
  const store = (params.store || "").trim();
  const platform = platformHint(params.aspectRatio);
  const styleDescription = STYLE_MAP[params.style] || STYLE_MAP.trending;

  const cleanDesc = description.replace(/\s+/g, " ").slice(0, 700);
  const cleanTitle = title.replace(/\s+/g, " ").slice(0, 160);
  const features = extractFeaturePhrases(description);
  const shotPlan = planShotDurations(params.duration);

  const details = [
    cleanTitle ? `Product: ${cleanTitle}.` : "",
    store ? `Brand/store: ${store}.` : "",
    cleanDesc ? `Description: ${cleanDesc}.` : "",
    price ? `Price: ${price}.` : "",
    typeof params.rating === "number"
      ? `Rating: ${params.rating}/5${typeof params.reviews === "number" ? ` from ${params.reviews} reviews` : ""}.`
      : "",
    features.length ? `Key features: ${features.join(" | ")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const featureA = features[0] || "key benefit";
  const featureB = features[1] || "quality detail";
  const featureC = features[2] || "how it works";

  const shots = [
    {
      scene: "Hero reveal of the product with a strong benefit headline.",
      camera: "Fast push-in, then micro orbit.",
      action: "Product appears clean and premium. Text hook pops in.",
      pv: `Premium product hero reveal, cinematic studio lighting, minimal background, crisp focus, ${styleDescription}, show benefit headline.`,
    },
    {
      scene: `Macro details and texture highlighting ${featureA}.`,
      camera: "Macro glide + rack focus.",
      action: "Close-up details shimmer. Overlay a short feature callout.",
      pv: `Macro close-up of product details, highlight ${featureA}, studio reflections, crisp focus, smooth macro glide, ${styleDescription}.`,
    },
    {
      scene: `Feature demonstration emphasizing ${featureB}.`,
      camera: "Side pan with slight tilt.",
      action: "Hands demonstrate usage (if applicable) without covering the product.",
      pv: `Clean product demo shot, emphasize ${featureB}, hands interaction, modern minimal set, smooth side pan, ${styleDescription}.`,
    },
    {
      scene: "Lifestyle moment that matches the product category.",
      camera: "Handheld-stable, slow dolly.",
      action: "Product used naturally; keep product accurate.",
      pv: `Lifestyle usage scene featuring the same product, natural lighting with premium grade, soft background bokeh, slow dolly, ${styleDescription}.`,
    },
    {
      scene: "Proof and credibility: highlight rating, reviews, or claim.",
      camera: "Static hero with subtle zoom.",
      action: "Show badges like “Top rated” / “Best seller” style UI overlays (no platform logos).",
      pv: `Product hero shot with tasteful UI-style overlay for social proof (rating/reviews), subtle zoom, premium lighting, ${styleDescription}.`,
    },
    {
      scene: "End card with price and CTA.",
      camera: "Centered lockoff.",
      action: "Clean end card: product centered, price callout, “Shop now”.",
      pv: `Clean end card, product centered, minimal background, price callout, bold CTA "Shop now", crisp focus, premium lighting, ${styleDescription}.`,
    },
  ];

  while (shots.length < shotPlan.shotCount) {
    shots.splice(2, 0, {
      scene: `Another feature highlight focusing on ${featureC}.`,
      camera: "Top-down tilt into close-up.",
      action: "Reveal feature with quick cut and callout text.",
      pv: `Feature highlight shot, focus on ${featureC}, top-down tilt, close-up details, minimal set, ${styleDescription}.`,
    });
  }

  const shotPrompts = shots.slice(0, shotPlan.shotCount).map((s, i) => {
    const dur = shotPlan.durations[i] || 5;
    const prompt = [
      "Use the provided product image as reference; keep design/colors/logo accurate.",
      cleanTitle ? `Product: ${cleanTitle}.` : "",
      price ? `Price: ${price}.` : "",
      s.pv,
      "No watermark, no extra logos, no unrelated objects.",
    ]
      .filter(Boolean)
      .join(" ");

    return {
      index: i + 1,
      sceneDescription: s.scene,
      cameraMovement: s.camera,
      subjectAction: s.action,
      pixVersePrompt: prompt,
      suggestedDuration: dur,
      aspectRatio: params.aspectRatio,
    };
  });

  const hooks = [
    cleanTitle ? `Stop scrolling: ${cleanTitle} in action.` : "Stop scrolling: the upgrade you needed.",
    features[0] ? `One product. Big difference: ${features[0]}.` : "One product. Big difference.",
    price ? `Worth it at ${price}. Here’s why.` : "Here’s why everyone wants this.",
  ];

  const hashtags = [
    "#tiktokshop",
    "#productreview",
    "#founditonTikTok",
    "#amazonfinds",
    "#smallbusiness",
    "#viralproducts",
    "#reels",
    "#shopnow",
  ];

  const captions = [
    hooks[0],
    `${hooks[1]} ${features[1] ? `(${features[1]})` : ""}`.trim(),
    `${hooks[2]} ${features[2] ? `(${features[2]})` : ""}`.trim(),
    "Quick demo, real results. Shop now.",
    "Which feature sold you? Comment below.",
  ];

  return {
    shotPrompts,
    captions,
    hashtags,
    plannedDuration: shotPlan.total,
    shotCount: shotPlan.shotCount,
  };
}
