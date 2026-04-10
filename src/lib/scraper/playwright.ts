import { chromium } from "playwright";
import { ScrapeError } from "@/lib/scraper/detect-blocks";
import type { RawScrapedData } from "@/types/tokens";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export async function scrapeWithPlaywright(url: string): Promise<RawScrapedData> {
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({ userAgent: UA });
    const page = await context.newPage();

    await page.goto(url, { timeout: 15000, waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    const result = await page.evaluate(() => {
      const parseRgb = (value: string): [number, number, number, number] | null => {
        const match = value.match(/rgba?\(([^\)]+)\)/i);
        if (!match) {
          return null;
        }
        const parts = match[1].split(",").map((p) => Number.parseFloat(p.trim()));
        if (parts.length < 3 || parts.some((v, i) => i < 3 && !Number.isFinite(v))) {
          return null;
        }
        return [parts[0], parts[1], parts[2], Number.isFinite(parts[3]) ? parts[3] : 1];
      };

      const colorSaturation = (value: string) => {
        const rgb = parseRgb(value);
        if (!rgb) {
          return 0;
        }
        const [r, g, b] = rgb;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        if (max === 0) {
          return 0;
        }
        return (max - min) / max;
      };

      const luminance = (value: string) => {
        const rgb = parseRgb(value);
        if (!rgb) {
          return 0.5;
        }
        const [r, g, b] = rgb;
        return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      };

      const validColor = (value: string) => {
        const v = value.trim().toLowerCase();
        if (!v || v === "transparent") {
          return false;
        }
        if (v.startsWith("rgba(")) {
          const parts = v
            .replace("rgba(", "")
            .replace(")", "")
            .split(",")
            .map((p) => p.trim());
          const alpha = Number.parseFloat(parts[3] ?? "1");
          return Number.isFinite(alpha) && alpha > 0;
        }
        return true;
      };

      const pickBrandTextColor = (colors: string[]) => {
        const counts = new Map<string, number>();
        for (const color of colors) {
          if (!validColor(color)) {
            continue;
          }
          counts.set(color, (counts.get(color) ?? 0) + 1);
        }

        const ranked = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
        const chromatic = ranked.find(([color]) => {
          const lum = luminance(color);
          const sat = colorSaturation(color);
          return lum > 0.08 && lum < 0.92 && sat > 0.16;
        });
        if (chromatic) {
          return chromatic[0];
        }

        const readable = ranked.find(([color]) => {
          const lum = luminance(color);
          return lum > 0.08 && lum < 0.92;
        });
        return readable?.[0] ?? null;
      };

      const getComputed = (selector: string, styleProp: keyof CSSStyleDeclaration) => {
        return Array.from(document.querySelectorAll(selector))
          .map((el) => window.getComputedStyle(el)[styleProp])
          .filter(Boolean)
          .map((v) => String(v));
      };

      const colorSelectors = ["body", "h1", "h2", "h3", "a", "button", "input", "p"].join(",");
      const colors = Array.from(document.querySelectorAll(colorSelectors)).flatMap((el) => {
        const style = window.getComputedStyle(el);
        return [style.color, style.backgroundColor, style.borderColor].filter(Boolean);
      });

      const rootStyle = window.getComputedStyle(document.documentElement);
      const bodyStyle = window.getComputedStyle(document.body);
      const cssVars: Record<string, string> = {};
      for (const name of Array.from(rootStyle)) {
        if (name.startsWith("--")) {
          cssVars[name] = rootStyle.getPropertyValue(name).trim();
        }
      }

      const pageBgCandidates = [bodyStyle.backgroundColor, rootStyle.backgroundColor]
        .map((v) => String(v))
        .filter(validColor);

      if (!pageBgCandidates.length) {
        const areaCandidates = Array.from(document.querySelectorAll("body,main,section,div,header,footer"))
          .slice(0, 500)
          .map((el) => {
            const style = window.getComputedStyle(el);
            const bg = String(style.backgroundColor);
            if (!validColor(bg)) {
              return null;
            }
            const rect = el.getBoundingClientRect();
            const area = Math.max(0, rect.width) * Math.max(0, rect.height);
            return { bg, area };
          })
          .filter((item): item is { bg: string; area: number } => Boolean(item))
          .sort((a, b) => b.area - a.area);

        if (areaCandidates.length) {
          pageBgCandidates.push(areaCandidates[0].bg);
        }
      }

      if (pageBgCandidates.length) {
        cssVars.__page_bg = pageBgCandidates[0];
      }

      const pageTextCandidates = [bodyStyle.color, rootStyle.color]
        .map((v) => String(v))
        .filter(validColor);
      if (pageTextCandidates.length) {
        cssVars.__page_text = pageTextCandidates[0];
      }

      const textSignalColors = Array.from(
        document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,a,button,label,span,li,strong"),
      )
        .slice(0, 500)
        .map((el) => window.getComputedStyle(el).color)
        .map((v) => String(v))
        .filter(validColor);

      const brandText = pickBrandTextColor(textSignalColors);
      if (brandText) {
        cssVars.__brand_text = brandText;
      }

      const buttons = Array.from(document.querySelectorAll("button, a[class*='btn'], a[class*='button']"));
      const solidButton = buttons.find((el) => {
        const bg = window.getComputedStyle(el).backgroundColor;
        if (!validColor(bg)) return false;
        const lum = luminance(String(bg));
        const sat = colorSaturation(String(bg));
        return lum > 0.05 && lum < 0.95 && sat > 0.1;
      });
      if (solidButton) {
        cssVars.__button_bg = window.getComputedStyle(solidButton).backgroundColor;
      }

      const solidHeading = Array.from(document.querySelectorAll("h1, h2, h3")).find((el) => {
        const color = window.getComputedStyle(el).color;
        return validColor(color);
      });
      if (solidHeading) {
        cssVars.__heading_color = window.getComputedStyle(solidHeading).color;
      }

      const spacingValues = Array.from(document.querySelectorAll("div,section,article,main,header,footer,button,input,li"))
        .slice(0, 300)
        .flatMap((el) => {
          const style = window.getComputedStyle(el);
          return [
            style.marginTop,
            style.marginRight,
            style.marginBottom,
            style.marginLeft,
            style.paddingTop,
            style.paddingRight,
            style.paddingBottom,
            style.paddingLeft,
            style.gap,
          ].filter(Boolean);
        });

      const imageUrls = Array.from(document.querySelectorAll("img"))
        .map((img) => img.getAttribute("src"))
        .filter((src): src is string => Boolean(src))
        .slice(0, 5)
        .map((src) => new URL(src, window.location.href).toString());

      return {
        rawColors: colors.map((value) => String(value).trim()),
        rawFonts: getComputed("h1,h2,h3,p,body", "fontFamily"),
        rawSizes: getComputed("h1,h2,h3,h4,h5,h6,p,body", "fontSize"),
        rawSpacing: spacingValues.map((value) => String(value).trim()),
        imageUrls,
        cssVars,
      };
    });

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "unknown scrape error";
    if (message.includes("timeout")) {
      throw new ScrapeError("TIMEOUT", "Navigation timeout while scraping website");
    }
    if (message.includes("net::") || message.includes("navigation")) {
      throw new ScrapeError("NAVIGATION_ERROR", "Unable to navigate to target URL");
    }
    throw new ScrapeError("BLOCKED", "The website blocked automated scraping");
  } finally {
    await browser.close();
  }
}
