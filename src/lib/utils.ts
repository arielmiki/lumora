import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Many product CDNs (TikTok, Shopee, Lazada) block hotlinking by Referer.
// Route through images.weserv.nl so the URL is publicly fetchable for the
// frontend preview AND for PixVerse `--image`.
export function publicImage(src?: string | null): string {
  if (!src) return ""
  const trimmed = src.trim()
  if (!trimmed) return ""
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed
  if (trimmed.includes("images.weserv.nl")) return trimmed
  const stripped = trimmed.replace(/^https?:\/\//, "")
  return `https://images.weserv.nl/?url=${encodeURIComponent(stripped)}`
}
