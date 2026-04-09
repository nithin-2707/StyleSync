"use client";

import { ExternalLink, Lock as LockIcon } from "lucide-react";

interface TypographyInspectorProps {
  headingFont: string;
  bodyFont: string;
  baseSize: string;
  lineHeight: number;
  scale?: string[];
  lockedKeys?: Set<string>;
  onLock?: (key: string) => void;
  onChange: (key: string, value: string) => void;
}

const WEIGHT_OPTIONS = [
  { label: "Thin", value: "100" },
  { label: "Light", value: "300" },
  { label: "Regular", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semibold", value: "600" },
  { label: "Bold", value: "700" },
  { label: "Black", value: "900" },
];

export default function TypographyInspector({
  headingFont,
  bodyFont,
  baseSize,
  lineHeight,
  scale,
  lockedKeys,
  onLock,
  onChange,
}: TypographyInspectorProps) {
  const basePx = Number.parseFloat(baseSize) || 15;
  const googleFontsUrl = `https://fonts.google.com/specimen/${encodeURIComponent(headingFont.split(",")[0]?.trim() ?? "")}`;

  // Package props for the render closure so `props.lockedKeys` resolving works
  const props = { lockedKeys, onLock };

  return (
    <div className="space-y-4">
      {/* Font families */}
      <div className="rounded-2xl border border-[#2A2A40] bg-[#141422] p-4 space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5A5A75]">Font Families</p>

        <label className="block">
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#C9C9D4]">Heading</span>
              <button 
                type="button" 
                onClick={() => props.onLock?.("typography.headingFont")}
                className={`p-1 rounded transition ${props.lockedKeys?.has("typography.headingFont") ? 'text-emerald-400 bg-emerald-400/10' : 'text-[#5A5A75] hover:text-[#C9C9D4]'}`}
              >
                <LockIcon className="h-3 w-3" />
              </button>
            </div>
            <a href={googleFontsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-[#5A5A75] hover:text-[#c084fc] transition">
              Google Fonts <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
          <input list="font-list" value={headingFont} onChange={(e) => onChange("typography.headingFont", e.target.value)} className="w-full rounded-xl border border-[#2A2A40] bg-[#0F0F1A] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#934AC5]" placeholder="e.g. Inter, Sohne" />
        </label>

        <label className="block">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold text-[#C9C9D4]">Body</span>
            <button 
              type="button" 
              onClick={() => props.onLock?.("typography.bodyFont")}
              className={`p-1 rounded transition ${props.lockedKeys?.has("typography.bodyFont") ? 'text-emerald-400 bg-emerald-400/10' : 'text-[#5A5A75] hover:text-[#C9C9D4]'}`}
            >
              <LockIcon className="h-3 w-3" />
            </button>
          </div>
          <input list="font-list" value={bodyFont} onChange={(e) => onChange("typography.bodyFont", e.target.value)} className="w-full rounded-xl border border-[#2A2A40] bg-[#0F0F1A] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#934AC5]" placeholder="e.g. Inter, Helvetica" />
        </label>

        <datalist id="font-list">
          <option value="Inter" /><option value="Plus Jakarta Sans" /><option value="Outfit" /><option value="Roboto" /><option value="Poppins" /><option value="Montserrat" /><option value="Geist" /><option value="Lato" /><option value="Playfair Display" /><option value="Merriweather" /><option value="system-ui, -apple-system" /><option value="Helvetica Neue, Helvetica, Arial" />
        </datalist>
      </div>

      {/* Size & line-height */}
      <div className="rounded-2xl border border-[#2A2A40] bg-[#141422] p-4 space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5A5A75]">Scale & Metrics</p>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-xs font-semibold text-[#C9C9D4]">Base Size</span>
              <button 
                type="button" 
                onClick={() => props.onLock?.("typography.baseSize")}
                className={`p-1 rounded transition ${props.lockedKeys?.has("typography.baseSize") ? 'text-emerald-400 bg-emerald-400/10' : 'text-[#5A5A75] hover:text-[#C9C9D4]'}`}
              >
                <LockIcon className="h-3 w-3" />
              </button>
            </div>
            <input value={baseSize} onChange={(e) => onChange("typography.baseSize", e.target.value)} className="token-mono w-full rounded-xl border border-[#2A2A40] bg-[#0F0F1A] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#934AC5]" placeholder="16px" />
          </label>
          <label className="block">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-xs font-semibold text-[#C9C9D4]">Line Height</span>
              <button 
                type="button" 
                onClick={() => props.onLock?.("typography.lineHeight")}
                className={`p-1 rounded transition ${props.lockedKeys?.has("typography.lineHeight") ? 'text-emerald-400 bg-emerald-400/10' : 'text-[#5A5A75] hover:text-[#C9C9D4]'}`}
              >
                <LockIcon className="h-3 w-3" />
              </button>
            </div>
            <input type="number" step="0.05" min="1" max="3" value={lineHeight} onChange={(e) => onChange("typography.lineHeight", e.target.value)} className="token-mono w-full rounded-xl border border-[#2A2A40] bg-[#0F0F1A] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#934AC5]" />
          </label>
        </div>
      </div>

      {/* Type scale visual */}
      {scale && scale.length > 0 && (
        <div className="rounded-2xl border border-[#2A2A40] bg-[#141422] p-4">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[#5A5A75]">Detected Scale</p>
          <div className="space-y-1">
            {scale.slice().reverse().map((size) => (
              <div key={size} className="flex items-center gap-3">
                <span className="token-mono w-10 shrink-0 text-right text-[10px] text-[#5A5A75]">{size}</span>
                <span
                  className="text-white leading-tight truncate"
                  style={{ fontFamily: headingFont, fontSize: size }}
                >
                  Aa
                </span>
                <span className="text-[10px] text-[#3A3A5A]">
                  {Math.round(Number.parseFloat(size) / basePx * 10) / 10}em
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live specimen */}
      <div className="rounded-2xl border border-[#2A2A40] bg-[#141422] p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#5A5A75]">Live Specimen</p>
        <h3
          style={{ fontFamily: headingFont, fontSize: `calc(${baseSize} * 1.5)`, lineHeight: 1.2 }}
          className="font-bold text-white mb-2"
        >
          The quick brown fox
        </h3>
        <p
          style={{ fontFamily: bodyFont, fontSize: baseSize, lineHeight }}
          className="text-[#C9C9D4]"
        >
          Typography updates propagate to every component in the preview grid instantly via CSS custom properties.
        </p>
      </div>
    </div>
  );
}
