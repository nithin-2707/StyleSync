import { scrapeWithPlaywright } from "@/lib/scraper/playwright";
import { scrapeWithCheerio } from "@/lib/scraper/cheerio-fallback";
import type { RawScrapedData } from "@/types/tokens";

function createSeedRawData(url: string): RawScrapedData {
  let hostname = "example.com";
  try {
    hostname = new URL(url).hostname;
  } catch {
    // Keep deterministic fallback host.
  }

  const hash = Array.from(hostname).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 360, 0);
  const h1 = hash;
  const h2 = (hash + 35) % 360;
  const h3 = (hash + 210) % 360;

  return {
    rawColors: [
      `hsl(${h1}, 68%, 48%)`,
      `hsl(${h2}, 56%, 42%)`,
      `hsl(${h3}, 72%, 56%)`,
      "#111827",
      "#F9FAFB",
      "#E5E7EB",
    ],
    rawFonts: ["Inter, sans-serif", "system-ui, sans-serif"],
    rawSizes: ["14px", "16px", "18px", "24px", "32px"],
    rawSpacing: ["4px", "8px", "12px", "16px", "24px", "32px", "48px"],
    imageUrls: [],
    cssVars: {},
  };
}

function hasUsableSignal(raw: RawScrapedData): boolean {
  return raw.rawColors.length > 0 || raw.rawFonts.length > 0 || raw.rawSizes.length > 0;
}

export async function scrapeBestEffort(url: string): Promise<RawScrapedData> {
  try {
    const fromPlaywright = await scrapeWithPlaywright(url);
    if (hasUsableSignal(fromPlaywright)) {
      return fromPlaywright;
    }
  } catch {
    // Fall through to static extraction.
  }

  try {
    const fromCheerio = await scrapeWithCheerio(url);
    if (hasUsableSignal(fromCheerio)) {
      return fromCheerio;
    }
  } catch {
    // Fall through to deterministic seed extraction.
  }

  return createSeedRawData(url);
}
