import Color from "color";

export function getContrastRatio(foreground: string, background: string): number {
  const fg = Color(foreground).rgb();
  const bg = Color(background).rgb();

  const luminance = (input: number) => {
    const channel = input / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };

  const fgLum =
    0.2126 * luminance(fg.red()) + 0.7152 * luminance(fg.green()) + 0.0722 * luminance(fg.blue());
  const bgLum =
    0.2126 * luminance(bg.red()) + 0.7152 * luminance(bg.green()) + 0.0722 * luminance(bg.blue());

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  return (lighter + 0.05) / (darker + 0.05);
}
