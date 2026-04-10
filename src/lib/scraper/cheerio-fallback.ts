import * as cheerio from "cheerio";
import type { RawScrapedData } from "@/types/tokens";

const CSS_COLOR_RE = /#(?:[0-9a-fA-F]{3,8})\b|rgba?\([^\)]+\)|hsla?\([^\)]+\)/g;
const CSS_FONT_FAMILY_RE = /font-family\s*:\s*[^;]+/g;
const CSS_FONT_SIZE_RE = /font-size\s*:\s*[^;]+/g;
const CSS_SPACING_RE = /(?:margin|padding|gap)\s*:\s*[^;]+/g;

function extractCssSignals(css: string): {
  colors: string[];
  fonts: string[];
  sizes: string[];
  spacing: string[];
} {
  return {
    colors: css.match(CSS_COLOR_RE) ?? [],
    fonts: css.match(CSS_FONT_FAMILY_RE) ?? [],
    sizes: css.match(CSS_FONT_SIZE_RE) ?? [],
    spacing: css.match(CSS_SPACING_RE) ?? [],
  };
}

async function fetchStylesheetSignals(stylesheetUrls: string[]): Promise<{
  colors: string[];
  fonts: string[];
  sizes: string[];
  spacing: string[];
}> {
  const colors: string[] = [];
  const fonts: string[] = [];
  const sizes: string[] = [];
  const spacing: string[] = [];

  const selected = stylesheetUrls.slice(0, 6);
  for (const stylesheetUrl of selected) {
    try {
      const cssResponse = await fetch(stylesheetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      });

      if (!cssResponse.ok) {
        continue;
      }

      const cssText = await cssResponse.text();
      if (!cssText) {
        continue;
      }

      const signals = extractCssSignals(cssText);
      colors.push(...signals.colors);
      fonts.push(...signals.fonts);
      sizes.push(...signals.sizes);
      spacing.push(...signals.spacing);
    } catch {
      continue;
    }
  }

  return { colors, fonts, sizes, spacing };
}

export async function scrapeWithCheerio(url: string): Promise<RawScrapedData> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  });

  const html = await response.text();

  const $ = cheerio.load(html);
  const rawFonts: string[] = [];
  const rawSizes: string[] = [];
  const rawColors: string[] = [];
  const rawSpacing: string[] = [];
  const cssVars: Record<string, string> = {};

  const themeColor = $("meta[name='theme-color']").attr("content");
  if (themeColor) {
    rawColors.push(themeColor);
    cssVars.__theme_color = themeColor;
  }

  const bodyStyleAttr = $("body").attr("style") ?? "";
  const bgFromBodyStyle = bodyStyleAttr.match(/background(?:-color)?\s*:\s*([^;]+)/i)?.[1]?.trim();
  const textFromBodyStyle = bodyStyleAttr.match(/color\s*:\s*([^;]+)/i)?.[1]?.trim();
  if (bgFromBodyStyle) {
    cssVars.__page_bg = bgFromBodyStyle;
    rawColors.push(bgFromBodyStyle);
  }
  if (textFromBodyStyle) {
    cssVars.__page_text = textFromBodyStyle;
    rawColors.push(textFromBodyStyle);
  }

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

  // Include inline stylesheet content to capture sites with CSS-in-HEAD patterns.
  $("style").each((_, styleTag) => {
    const css = $(styleTag).html() ?? "";
    if (!css) {
      return;
    }

    const signals = extractCssSignals(css);
    rawColors.push(...signals.colors);
    rawFonts.push(...signals.fonts);
    rawSizes.push(...signals.sizes);
    rawSpacing.push(...signals.spacing);
  });

  // Pull external stylesheets for modern sites that keep most tokens in linked CSS files.
  const stylesheetUrls = $("link[rel='stylesheet']")
    .map((_, link) => $(link).attr("href"))
    .get()
    .filter((href): href is string => Boolean(href))
    .map((href) => {
      try {
        return new URL(href, url).toString();
      } catch {
        return null;
      }
    })
    .filter((href): href is string => Boolean(href));

  if (stylesheetUrls.length) {
    const externalSignals = await fetchStylesheetSignals(stylesheetUrls);
    rawColors.push(...externalSignals.colors);
    rawFonts.push(...externalSignals.fonts);
    rawSizes.push(...externalSignals.sizes);
    rawSpacing.push(...externalSignals.spacing);
  }

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
    cssVars,
  };
}
