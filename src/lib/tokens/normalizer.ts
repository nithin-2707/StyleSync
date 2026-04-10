import Color from "color";
import chroma from "chroma-js";
import type { DesignTokens, ImagePalette, LockedTokenLike, RawScrapedData } from "@/types/tokens";

const DEFAULT_TOKENS: DesignTokens = {
  colors: {
    primary: "#934AC5",
    secondary: "#6B5F7A",
    accent: "#E8A87C",
    neutral: "#D7CEE4",
    background: "#F0EDF5",
    text: "#1A1025",
    surface: "#FFFFFF",
    border: "#CFC1E0",
  },
  typography: {
    headingFont: "Inter",
    bodyFont: "Inter",
    monoFont: "JetBrains Mono",
    baseSize: "15px",
    scale: ["11px", "13px", "15px", "18px", "24px", "32px"],
    lineHeight: 1.7,
    weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  },
  spacing: {
    unit: 4,
    scale: [0, 4, 8, 12, 16, 24, 32, 48, 64],
  },
  shadows: {
    sm: "0 2px 8px rgba(26, 16, 37, 0.08)",
    md: "0 4px 24px rgba(26, 16, 37, 0.12)",
    lg: "0 10px 40px rgba(26, 16, 37, 0.16)",
  },
  radii: {
    sm: "4px",
    md: "8px",
    lg: "16px",
    full: "999px",
  },
};

const SYSTEM_FONT_MARKERS = ["system-ui", "sans-serif", "serif", "monospace", "ui-sans-serif", "arial"];

function normalizeColor(input: string): string | null {
  const value = input.trim().toLowerCase();
  if (!value || value === "transparent") {
    return null;
  }

  if (value.startsWith("rgba(")) {
    const parts = value
      .replace("rgba(", "")
      .replace(")", "")
      .split(",")
      .map((part) => part.trim());
    const alpha = Number.parseFloat(parts[3] ?? "1");
    if (Number.isFinite(alpha) && alpha <= 0) {
      return null;
    }
  }

  try {
    return Color(value).hex().toUpperCase();
  } catch {
    return null;
  }
}

function getSaturation(color: string): number {
  const s = chroma(color).get("hsl.s");
  return Number.isFinite(s) ? s : 0;
}

function getBorderColor(background: string, text: string, candidates: string[]): string {
  const subtle = candidates.find((color) => {
    const sat = getSaturation(color);
    const contrast = chroma.contrast(color, background);
    return sat < 0.3 && contrast >= 1.15 && contrast <= 2.8;
  });

  if (subtle) {
    return subtle;
  }

  const bgLum = chroma(background).luminance();
  const ratio = bgLum > 0.5 ? 0.18 : 0.26;
  return chroma.mix(background, text, ratio, "lab").hex().toUpperCase();
}

function countColors(items: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }
  return counts;
}

function pickBackgroundFromSignal(sortedColors: string[], counts: Map<string, number>): string | null {
  const neutralCandidates = sortedColors.filter((color) => getSaturation(color) <= 0.25);
  if (!neutralCandidates.length) {
    return null;
  }

  const darkScore = neutralCandidates
    .filter((color) => chroma(color).luminance() < 0.2)
    .reduce((sum, color) => sum + (counts.get(color) ?? 0), 0);
  const lightScore = neutralCandidates
    .filter((color) => chroma(color).luminance() > 0.78)
    .reduce((sum, color) => sum + (counts.get(color) ?? 0), 0);

  if (darkScore > lightScore * 1.15) {
    return neutralCandidates.find((color) => chroma(color).luminance() < 0.2) ?? null;
  }

  if (lightScore > darkScore * 1.15) {
    return neutralCandidates.find((color) => chroma(color).luminance() > 0.78) ?? null;
  }

  return neutralCandidates.find((color) => chroma(color).luminance() > 0.78) ?? neutralCandidates[0] ?? null;
}

function pickTextForBackground(background: string, sortedColors: string[]): string {
  const isDarkBg = chroma(background).luminance() < 0.45;
  const candidatePool = sortedColors.filter((color) =>
    isDarkBg ? chroma(color).luminance() > 0.7 : chroma(color).luminance() < 0.35,
  );

  const contrastSorted = (candidatePool.length ? candidatePool : sortedColors)
    .slice()
    .sort((a, b) => chroma.contrast(b, background) - chroma.contrast(a, background));

  return contrastSorted[0] ?? (isDarkBg ? "#FFFFFF" : "#111111");
}

function getSurfaceColor(background: string, candidates: string[]): string {
  const surfaceCandidate = candidates.find((color) => {
    const contrast = chroma.contrast(color, background);
    return contrast >= 1.03 && contrast <= 1.35;
  });

  if (surfaceCandidate) {
    return surfaceCandidate;
  }

  const bgLum = chroma(background).luminance();
  if (bgLum > 0.6) {
    return "#FFFFFF";
  }
  return chroma.mix(background, "#FFFFFF", 0.08, "lab").hex().toUpperCase();
}

function inferBackgroundFromHints(
  hintedBackground: string | null,
  hintedText: string | null,
  sortedColors: string[],
  darkColors: string[],
  lightColors: string[],
): string {
  if (hintedBackground) {
    return hintedBackground;
  }

  if (hintedText) {
    const textLum = chroma(hintedText).luminance();
    const candidates = sortedColors.slice(0, 10);

    const opposite = candidates.find((color) => {
      const lum = chroma(color).luminance();
      return Math.abs(lum - textLum) >= 0.5;
    });

    if (opposite) {
      return opposite;
    }

    if (textLum > 0.6) {
      return darkColors[0] ?? DEFAULT_TOKENS.colors.text;
    }
    return lightColors[0] ?? DEFAULT_TOKENS.colors.background;
  }

  return lightColors[0] ?? darkColors[0] ?? DEFAULT_TOKENS.colors.background;
}

function chooseByFrequency(items: string[]): string[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([value]) => value);
}

function pickFont(fonts: string[], fallback: string): string {
  for (const raw of fonts) {
    const options = raw
      .split(",")
      .map((font) => font.replace(/['\"]/g, "").trim())
      .filter(Boolean);
    const choice = options.find((font) => !SYSTEM_FONT_MARKERS.some((marker) => font.toLowerCase().includes(marker)));
    if (choice) {
      return choice;
    }
  }
  return fallback;
}

function normalizeSizes(rawSizes: string[]): string[] {
  const pxValues = rawSizes
    .flatMap((size) => {
      const found = size.match(/\d+(\.\d+)?px/g);
      return found ?? [];
    })
    .map((size) => Number.parseFloat(size.replace("px", "")))
    .filter((value) => Number.isFinite(value) && value > 0)
    .map((value) => Math.round(value * 2) / 2);

  const uniqueSorted = Array.from(new Set(pxValues)).sort((a, b) => a - b);
  if (!uniqueSorted.length) {
    return DEFAULT_TOKENS.typography.scale;
  }
  return uniqueSorted.slice(0, 8).map((value) => `${value}px`);
}

function normalizeSpacing(rawSpacing: string[]): { unit: number; scale: number[] } {
  const values = rawSpacing
    .flatMap((item) => item.match(/\d+(\.\d+)?px/g) ?? [])
    .map((item) => Number.parseFloat(item.replace("px", "")))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!values.length) {
    return DEFAULT_TOKENS.spacing;
  }

  const baseCounts = new Map<number, number>([
    [4, 0],
    [8, 0],
  ]);

  for (const value of values) {
    for (const base of [4, 8]) {
      if (Math.round(value) % base === 0) {
        baseCounts.set(base, (baseCounts.get(base) ?? 0) + 1);
      }
    }
  }

  const unit = (baseCounts.get(8) ?? 0) > (baseCounts.get(4) ?? 0) ? 8 : 4;
  const multipliers = [0, 1, 2, 3, 4, 6, 8, 12, 16];

  return {
    unit,
    scale: multipliers.map((m) => m * unit),
  };
}

function setNestedToken(tokens: DesignTokens, tokenKey: string, value: string): void {
  const [group, key] = tokenKey.split(".");
  if (!group || !key) {
    return;
  }
  if (group === "colors") {
    switch (key) {
      case "primary":
      case "secondary":
      case "accent":
      case "neutral":
      case "background":
      case "text":
      case "surface":
      case "border":
        tokens.colors[key] = value;
    }
  }
  if (group === "typography") {
    if (key === "headingFont") tokens.typography.headingFont = value;
    if (key === "bodyFont") tokens.typography.bodyFont = value;
    if (key === "monoFont") tokens.typography.monoFont = value;
    if (key === "baseSize") tokens.typography.baseSize = value;
    if (key === "lineHeight") tokens.typography.lineHeight = Number.parseFloat(value) || tokens.typography.lineHeight;
  }
  if (group === "radii") {
    if (key === "sm") tokens.radii.sm = value;
    if (key === "md") tokens.radii.md = value;
    if (key === "lg") tokens.radii.lg = value;
    if (key === "full") tokens.radii.full = value;
  }
  if (group === "shadows") {
    if (key === "sm") tokens.shadows.sm = value;
    if (key === "md") tokens.shadows.md = value;
    if (key === "lg") tokens.shadows.lg = value;
  }
}

export function normalizeTokens(
  raw: RawScrapedData,
  locked: LockedTokenLike[],
  imagePalette: ImagePalette | null,
): DesignTokens {
  const normalizedColors = raw.rawColors.map(normalizeColor).filter((value): value is string => Boolean(value));
  const colorCounts = countColors(normalizedColors);
  const sortedColors = chooseByFrequency(normalizedColors);

  const hintedBackground = normalizeColor(raw.cssVars.__page_bg ?? "");
  const hintedText = normalizeColor(raw.cssVars.__page_text ?? "");

  const darkColors = sortedColors.filter((color) => chroma(color).luminance() < 0.35);
  const lightColors = sortedColors.filter((color) => chroma(color).luminance() > 0.75);
  const brandCandidates = sortedColors.filter((color) => {
    const lum = chroma(color).luminance();
    const sat = getSaturation(color);
    return lum > 0.12 && lum < 0.82 && sat > 0.16;
  });

  const inferredBackground = pickBackgroundFromSignal(sortedColors, colorCounts);
  const background = hintedBackground ?? inferredBackground ?? lightColors[0] ?? DEFAULT_TOKENS.colors.background;

  const hintedTextUsable =
    hintedText && chroma.contrast(hintedText, background) >= 3 ? hintedText : null;
  const text = hintedTextUsable ?? pickTextForBackground(background, sortedColors) ?? DEFAULT_TOKENS.colors.text;

  const primary = imagePalette?.primary ?? brandCandidates[0] ?? darkColors[0] ?? DEFAULT_TOKENS.colors.primary;
  const secondary =
    imagePalette?.secondary ??
    brandCandidates.find((color) => color !== primary) ??
    chroma.mix(primary, background, 0.45, "lab").hex().toUpperCase();
  const accent =
    imagePalette?.accent ??
    brandCandidates.find((color) => color !== primary && color !== secondary) ??
    chroma.mix(primary, "#FFFFFF", 0.2, "lab").hex().toUpperCase();

  const neutral =
    imagePalette?.neutral ??
    sortedColors.find((color) => getSaturation(color) < 0.18 && chroma(color).luminance() > 0.45) ??
    lightColors[1] ??
    DEFAULT_TOKENS.colors.neutral;

  const border = getBorderColor(background, text, sortedColors);
  const surface = getSurfaceColor(background, sortedColors);

  const colors = {
    ...DEFAULT_TOKENS.colors,
    text,
    background,
    primary,
    secondary,
    accent,
    neutral,
    surface,
    border,
  };

  const scale = normalizeSizes(raw.rawSizes);
  const baseSize = scale.find((size) => size === "15px" || size === "16px") ?? scale[0] ?? "15px";

  const tokens: DesignTokens = {
    ...DEFAULT_TOKENS,
    colors,
    typography: {
      ...DEFAULT_TOKENS.typography,
      headingFont: pickFont(raw.rawFonts, DEFAULT_TOKENS.typography.headingFont),
      bodyFont: pickFont(raw.rawFonts.slice().reverse(), DEFAULT_TOKENS.typography.bodyFont),
      baseSize,
      scale,
    },
    spacing: normalizeSpacing(raw.rawSpacing),
  };

  for (const lockedToken of locked) {
    setNestedToken(tokens, lockedToken.tokenKey, lockedToken.lockedValue);
  }

  return tokens;
}
