import type { DesignTokens } from "@/types/tokens";

export function tokenKeyToCssVar(key: string): string {
  const map: Record<string, string> = {
    "colors.primary": "--token-color-primary",
    "colors.secondary": "--token-color-secondary",
    "colors.accent": "--token-color-accent",
    "colors.neutral": "--token-color-neutral",
    "colors.background": "--token-color-background",
    "colors.text": "--token-color-text",
    "colors.surface": "--token-color-surface",
    "colors.border": "--token-color-border",
    "typography.headingFont": "--token-font-heading",
    "typography.bodyFont": "--token-font-body",
    "typography.monoFont": "--token-font-mono",
    "typography.baseSize": "--token-font-size-base",
    "typography.lineHeight": "--token-line-height",
    "radii.sm": "--token-radius-sm",
    "radii.md": "--token-radius-md",
    "radii.lg": "--token-radius-lg",
    "radii.full": "--token-radius-full",
    "shadows.sm": "--token-shadow-sm",
    "shadows.md": "--token-shadow-md",
    "shadows.lg": "--token-shadow-lg",
    "spacing.unit": "--token-spacing-unit",
  };

  return map[key] ?? `--token-${key.replace(/\./g, "-")}`;
}

export function injectTokenValue(key: string, value: string): void {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.style.setProperty(tokenKeyToCssVar(key), value);
}

export function injectAllTokens(tokens: DesignTokens): void {
  const pairs: Array<[string, string]> = [
    ["colors.primary", tokens.colors.primary],
    ["colors.secondary", tokens.colors.secondary],
    ["colors.accent", tokens.colors.accent],
    ["colors.neutral", tokens.colors.neutral],
    ["colors.background", tokens.colors.background],
    ["colors.text", tokens.colors.text],
    ["colors.surface", tokens.colors.surface],
    ["colors.border", tokens.colors.border],
    ["typography.headingFont", tokens.typography.headingFont],
    ["typography.bodyFont", tokens.typography.bodyFont],
    ["typography.monoFont", tokens.typography.monoFont],
    ["typography.baseSize", tokens.typography.baseSize],
    ["typography.lineHeight", String(tokens.typography.lineHeight)],
    ["radii.sm", tokens.radii.sm],
    ["radii.md", tokens.radii.md],
    ["radii.lg", tokens.radii.lg],
    ["radii.full", tokens.radii.full],
    ["shadows.sm", tokens.shadows.sm],
    ["shadows.md", tokens.shadows.md],
    ["shadows.lg", tokens.shadows.lg],
    ["spacing.unit", `${tokens.spacing.unit}px`],
  ];

  for (const [key, value] of pairs) {
    injectTokenValue(key, value);
  }
}
