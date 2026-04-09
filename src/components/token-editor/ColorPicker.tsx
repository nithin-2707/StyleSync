"use client";

import Color from "color";
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  const rgb = (() => {
    try {
      const parsed = Color(value).rgb();
      return { r: parsed.red(), g: parsed.green(), b: parsed.blue() };
    } catch {
      return { r: 147, g: 74, b: 197 };
    }
  })();

  const updateFromRgb = (nextRgb: { r: number; g: number; b: number }) => {
    try {
      onChange(Color.rgb(nextRgb.r, nextRgb.g, nextRgb.b).hex());
    } catch {
      onChange(value);
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-[#2A2A40] bg-[#141422] p-3">
      <div className="rounded-2xl border border-[#2A2A40] bg-[#1A1A2E] p-2">
        <HexColorPicker color={value} onChange={onChange} className="!h-[180px] !w-full" />
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C9C9D4]">Hex</span>
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            className="token-mono w-full rounded-xl border border-[#2A2A40] bg-[#0F0F1A] px-3 py-2 text-sm text-white outline-none transition focus:border-[#934AC5] focus:ring-2 focus:ring-[rgba(147,74,197,0.4)]"
          />
        </label>
        <div className="flex items-end gap-2 pb-[2px]">
          <div className="h-10 w-10 rounded-xl border border-white/15 shadow-[0_0_20px_rgba(147,74,197,0.35)]" style={{ background: value }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(["r", "g", "b"] as const).map((channel) => (
          <label key={channel} className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C9C9D4]">{channel.toUpperCase()}</span>
            <input
              type="number"
              min={0}
              max={255}
              value={rgb[channel]}
              onChange={(event) => updateFromRgb({ ...rgb, [channel]: Number(event.target.value) || 0 })}
              disabled={disabled}
              className="token-mono w-full rounded-xl border border-[#2A2A40] bg-[#0F0F1A] px-3 py-2 text-sm text-white outline-none transition focus:border-[#934AC5] focus:ring-2 focus:ring-[rgba(147,74,197,0.4)]"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
