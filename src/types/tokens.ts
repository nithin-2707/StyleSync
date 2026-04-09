export interface ColorTokens {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  background: string;
  text: string;
  surface: string;
  border: string;
}

export interface TypographyTokens {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  baseSize: string;
  scale: string[];
  lineHeight: number;
  weights: {
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

export interface SpacingTokens {
  unit: number;
  scale: number[];
}

export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
}

export interface RadiusTokens {
  sm: string;
  md: string;
  lg: string;
  full: string;
}

export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  shadows: ShadowTokens;
  radii: RadiusTokens;
}

export type TokenState = "extracted" | "locked" | "computed";

export interface TokenEntry<T> {
  value: T;
  state: TokenState;
  key: string;
}

export interface ScrapeResult {
  siteId: string;
  url: string;
  tokens: DesignTokens;
  status: "queued" | "running" | "done" | "failed";
  error?: string;
}

export interface RawScrapedData {
  rawColors: string[];
  rawFonts: string[];
  rawSizes: string[];
  rawSpacing: string[];
  imageUrls: string[];
  cssVars: Record<string, string>;
}

export interface ImagePalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
}

export interface LockedTokenLike {
  tokenKey: string;
  lockedValue: string;
}

export interface VersionHistoryEntry {
  tokenKey: string;
  valueBefore: string;
  valueAfter: string;
  timestamp: string;
}
