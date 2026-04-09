import * as cheerio from "cheerio";
import { ScrapeError, isBlockedResponse } from "@/lib/scraper/detect-blocks";
import type { RawScrapedData } from "@/types/tokens";

export async function scrapeWithCheerio(url: string): Promise<RawScrapedData> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  });

  const html = await response.text();
  if (!response.ok || isBlockedResponse(response.status, html)) {
    throw new ScrapeError("BLOCKED", "Blocked while attempting static fallback scrape");
  }

  const $ = cheerio.load(html);
  const rawFonts: string[] = [];
  const rawSizes: string[] = [];
  const rawColors: string[] = [];
  const rawSpacing: string[] = [];

  $("h1,h2,h3,p,body,a,button,input,div,section").each((_, element) => {
    const style = $(element).attr("style") ?? "";
    if (style.includes("font-family")) {
      rawFonts.push(style);
    }
    if (style.includes("font-size")) {
      rawSizes.push(style);
    }
    if (style.includes("color") || style.includes("background")) {
      rawColors.push(style);
    }
    if (style.includes("margin") || style.includes("padding")) {
      rawSpacing.push(style);
    }
  });

  const imageUrls = $("img")
    .map((_, img) => $(img).attr("src"))
    .get()
    .filter((src): src is string => Boolean(src))
    .slice(0, 5)
    .map((src) => new URL(src, url).toString());

  return {
    rawColors,
    rawFonts,
    rawSizes,
    rawSpacing,
    imageUrls,
    cssVars: {},
  };
}
