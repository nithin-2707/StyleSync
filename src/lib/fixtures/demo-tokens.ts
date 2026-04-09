import type { DesignTokens } from "@/types/tokens";

export const DEMO_TOKENS: Record<string, DesignTokens> = {
  "https://stripe.com": {
    colors: {
      primary: "#635BFF",
      secondary: "#0A2540",
      accent: "#00D4FF",
      neutral: "#DDE8F5",
      background: "#FFFFFF",
      text: "#0A2540",
      surface: "#FFFFFF",
      border: "#C2D4EC",
    },
    typography: {
      headingFont: "Sohne",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
      baseSize: "16px",
      scale: ["12px", "14px", "16px", "20px", "28px", "36px"],
      lineHeight: 1.6,
      weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    },
    spacing: { unit: 4, scale: [0, 4, 8, 12, 16, 24, 32, 48, 64] },
    shadows: {
      sm: "0 1px 3px rgba(10,37,64,0.1)",
      md: "0 12px 28px rgba(10,37,64,0.15)",
      lg: "0 20px 50px rgba(10,37,64,0.2)",
    },
    radii: { sm: "4px", md: "8px", lg: "16px", full: "999px" },
  },
  "https://bruno-simon.com": {
    colors: {
      primary: "#FF3D00",
      secondary: "#1A0500",
      accent: "#FFD600",
      neutral: "#3B2B23",
      background: "#0D0D0D",
      text: "#FFFFFF",
      surface: "#171717",
      border: "#4A2A1C",
    },
    typography: {
      headingFont: "Monument Extended",
      bodyFont: "Neue Haas Grotesk",
      monoFont: "JetBrains Mono",
      baseSize: "16px",
      scale: ["12px", "14px", "16px", "22px", "30px", "42px"],
      lineHeight: 1.5,
      weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    },
    spacing: { unit: 8, scale: [0, 8, 16, 24, 32, 48, 64, 96, 128] },
    shadows: {
      sm: "0 2px 8px rgba(0,0,0,0.35)",
      md: "0 8px 30px rgba(0,0,0,0.45)",
      lg: "0 16px 60px rgba(0,0,0,0.55)",
    },
    radii: { sm: "6px", md: "10px", lg: "18px", full: "999px" },
  },
  "https://www.allbirds.com": {
    colors: {
      primary: "#1D3C34",
      secondary: "#8B7355",
      accent: "#E8DDD0",
      neutral: "#D5CCBE",
      background: "#FAF8F5",
      text: "#1D3C34",
      surface: "#FFFFFF",
      border: "#D2C4AF",
    },
    typography: {
      headingFont: "Flanders Art Sans",
      bodyFont: "Helvetica Neue",
      monoFont: "JetBrains Mono",
      baseSize: "16px",
      scale: ["12px", "14px", "16px", "20px", "26px", "34px"],
      lineHeight: 1.65,
      weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    },
    spacing: { unit: 4, scale: [0, 4, 8, 12, 16, 24, 32, 48, 64] },
    shadows: {
      sm: "0 1px 3px rgba(29,60,52,0.08)",
      md: "0 10px 24px rgba(29,60,52,0.12)",
      lg: "0 20px 42px rgba(29,60,52,0.18)",
    },
    radii: { sm: "4px", md: "8px", lg: "16px", full: "999px" },
  },
};

export function isDemoMode(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes("stripe.com") || lower.includes("bruno-simon.com") || lower.includes("allbirds.com");
}

export function getDemoTokens(url: string): DesignTokens | null {
  const lower = url.toLowerCase();
  if (lower.includes("stripe.com")) return DEMO_TOKENS["https://stripe.com"];
  if (lower.includes("bruno-simon.com")) return DEMO_TOKENS["https://bruno-simon.com"];
  if (lower.includes("allbirds.com")) return DEMO_TOKENS["https://www.allbirds.com"];
  return null;
}
