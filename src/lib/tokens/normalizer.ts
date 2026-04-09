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
  try {
    return Color(input).hex().toUpperCase();
  } catch {
    return null;
  }
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
  const sortedColors = chooseByFrequency(normalizedColors);

  const darkColors = sortedColors.filter((color) => chroma(color).luminance() < 0.35);
  const lightColors = sortedColors.filter((color) => chroma(color).luminance() > 0.7);
  const saturated = [...sortedColors].sort((a, b) => chroma(b).saturate().get("hsl.s") - chroma(a).saturate().get("hsl.s"));

  const colors = {
    ...DEFAULT_TOKENS.colors,
    text: darkColors[0] ?? DEFAULT_TOKENS.colors.text,
    background: lightColors[0] ?? DEFAULT_TOKENS.colors.background,
    primary: imagePalette?.primary ?? saturated[0] ?? DEFAULT_TOKENS.colors.primary,
    secondary: imagePalette?.secondary ?? saturated[1] ?? DEFAULT_TOKENS.colors.secondary,
    accent: imagePalette?.accent ?? saturated[2] ?? DEFAULT_TOKENS.colors.accent,
    neutral: imagePalette?.neutral ?? lightColors[1] ?? DEFAULT_TOKENS.colors.neutral,
    surface: lightColors[2] ?? "#FFFFFF",
    border: saturated[3] ?? DEFAULT_TOKENS.colors.border,
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
