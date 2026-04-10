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
