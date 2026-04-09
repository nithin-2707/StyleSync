import { Vibrant } from "node-vibrant/node";
import type { ImagePalette } from "@/types/tokens";

const toHex = (swatchHex?: string): string | null => {
  if (!swatchHex) {
    return null;
  }
  return swatchHex;
};

export async function extractPaletteFromImages(imageUrls: string[]): Promise<ImagePalette | null> {
  const selected = imageUrls.slice(0, 3);

  let paletteCandidate: ImagePalette | null = null;

  for (const imageUrl of selected) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        continue;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const palette = await Vibrant.from(buffer).getPalette();

      const primary = toHex(palette.Vibrant?.hex);
      const secondary = toHex(palette.DarkVibrant?.hex);
      const accent = toHex(palette.LightVibrant?.hex);
      const neutral = toHex(palette.Muted?.hex) ?? toHex(palette.DarkMuted?.hex);

      if (primary && secondary && accent && neutral) {
        paletteCandidate = { primary, secondary, accent, neutral };
        break;
      }
    } catch {
      continue;
    }
  }

  return paletteCandidate;
}
