"use client";

import * as Slider from "@radix-ui/react-slider";
import { motion } from "framer-motion";
import { Lock as LockIcon } from "lucide-react";

interface SpacingVisualizerProps {
  unit: number;
  scale?: number[];
  lockedKeys?: Set<string>;
  onLock?: (key: string) => void;
  onChange: (unit: number) => void;
}

const MULTIPLIERS = [1, 2, 3, 4, 6, 8, 12, 16];

export default function SpacingVisualizer({ unit, scale, lockedKeys, onLock, onChange }: SpacingVisualizerProps) {
  const displayScale = scale ?? MULTIPLIERS.map((m) => m * unit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#2A2A40] bg-[#141422] p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white">Base Unit</p>
              <button 
                type="button" 
                onClick={() => onLock?.("spacing.unit")}
                className={`p-1 rounded transition ${lockedKeys?.has("spacing.unit") ? 'text-emerald-400 bg-emerald-400/10' : 'text-[#5A5A75] hover:text-[#C9C9D4]'}`}
              >
                <LockIcon className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-[#5A5A75]">All spacing derives from this value</p>
          </div>
          <div className="rounded-xl border border-[#3A3A5A] bg-[#1A1A2E] px-4 py-2 text-center">
            <p className="token-mono text-xl font-bold text-[#c084fc]">{unit}</p>
            <p className="text-[10px] text-[#5A5A75]">px</p>
          </div>
        </div>

        <Slider.Root
          value={[unit]}
          min={2}
          max={16}
          step={1}
          onValueChange={(values) => onChange(values[0] ?? 4)}
          className="relative flex h-6 w-full touch-none select-none items-center"
        >
          <Slider.Track className="relative h-2 grow overflow-hidden rounded-full bg-[#202036]">
            <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-[#934AC5] to-[#7B3FE4]" />
          </Slider.Track>
          <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-[#c084fc] bg-white shadow-[0_0_12px_rgba(147,74,197,0.5)] outline-none cursor-grab active:cursor-grabbing" />
        </Slider.Root>

        <div className="mt-2 flex justify-between text-[10px] text-[#5A5A75]">
          <span>2px</span>
          <span>8px</span>
          <span>16px</span>
        </div>
      </div>

      {/* Scale visualization */}
      <div className="rounded-2xl border border-[#2A2A40] bg-[#141422] p-4">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[#5A5A75]">Spacing Scale</p>
        <div className="space-y-3">
          {MULTIPLIERS.map((multiplier, i) => {
            const px = unit * multiplier;
            return (
              <div key={multiplier} className="flex items-center gap-4">
                <span className="token-mono w-16 shrink-0 text-right text-xs text-[#5A5A75]">
                  {multiplier}× = {px}px
                </span>
                <div className="flex-1">
                  <motion.div
                    className="h-5 rounded bg-gradient-to-r from-[#934AC5]/50 to-[#7B3FE4]/40"
                    animate={{ width: `${Math.min((px / (16 * 16)) * 100, 100)}%` }}
                    transition={{ type: "spring", stiffness: 180, damping: 22, delay: i * 0.02 }}
                    style={{ minWidth: 4 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid preview */}
      <div className="rounded-2xl border border-[#2A2A40] bg-[#141422] p-4">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[#5A5A75]">Visual Grid</p>
        <div className="flex flex-wrap gap-1">
          {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((step) => (
            <motion.div
              key={step}
              className="rounded bg-gradient-to-br from-[#934AC5]/40 to-[#7B3FE4]/25 text-center"
              animate={{
                width: unit * step,
                height: unit * step,
              }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              title={`${unit * step}px`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
