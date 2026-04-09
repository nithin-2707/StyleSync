import type { DesignTokens } from "@/types/tokens";

export function tokensToCss(tokens: DesignTokens): string {
  const lines = [
    `  --token-color-primary: ${tokens.colors.primary};`,
    `  --token-color-secondary: ${tokens.colors.secondary};`,
    `  --token-color-accent: ${tokens.colors.accent};`,
    `  --token-color-neutral: ${tokens.colors.neutral};`,
    `  --token-color-background: ${tokens.colors.background};`,
    `  --token-color-text: ${tokens.colors.text};`,
    `  --token-color-surface: ${tokens.colors.surface};`,
    `  --token-color-border: ${tokens.colors.border};`,
    `  --token-font-heading: ${tokens.typography.headingFont};`,
    `  --token-font-body: ${tokens.typography.bodyFont};`,
    `  --token-font-mono: ${tokens.typography.monoFont};`,
    `  --token-font-size-base: ${tokens.typography.baseSize};`,
    `  --token-line-height: ${tokens.typography.lineHeight};`,
    `  --token-radius-sm: ${tokens.radii.sm};`,
    `  --token-radius-md: ${tokens.radii.md};`,
    `  --token-radius-lg: ${tokens.radii.lg};`,
    `  --token-radius-full: ${tokens.radii.full};`,
    `  --token-shadow-sm: ${tokens.shadows.sm};`,
    `  --token-shadow-md: ${tokens.shadows.md};`,
    `  --token-shadow-lg: ${tokens.shadows.lg};`,
    `  --token-spacing-unit: ${tokens.spacing.unit}px;`,
  ];

  return `:root {\n${lines.join("\n")}\n}`;
}

export function tokensToJson(tokens: DesignTokens): string {
  return JSON.stringify(tokens, null, 2);
}

export function tokensToTailwind(tokens: DesignTokens): string {
  return `module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "${tokens.colors.primary}",
        secondary: "${tokens.colors.secondary}",
        accent: "${tokens.colors.accent}",
        neutral: "${tokens.colors.neutral}",
        background: "${tokens.colors.background}",
        text: "${tokens.colors.text}",
      },
      borderRadius: {
        sm: "${tokens.radii.sm}",
        md: "${tokens.radii.md}",
        lg: "${tokens.radii.lg}",
        full: "${tokens.radii.full}",
      },
      boxShadow: {
        sm: "${tokens.shadows.sm}",
        md: "${tokens.shadows.md}",
        lg: "${tokens.shadows.lg}",
      },
      fontFamily: {
        heading: ["${tokens.typography.headingFont}"],
        body: ["${tokens.typography.bodyFont}"],
        mono: ["${tokens.typography.monoFont}"],
      },
      fontSize: {
        base: "${tokens.typography.baseSize}",
      },
      lineHeight: {
        normal: "${tokens.typography.lineHeight}",
      },
      spacing: {
        unit: "${tokens.spacing.unit}px",
      },
    },
  },
};`;
}
