"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LockButton from "@/components/ui/LockButton";
import Badge from "@/components/ui/Badge";
import ColorPicker from "@/components/token-editor/ColorPicker";
import { RotateCcw, Copy, Check } from "lucide-react";

interface TokenCardProps {
  tokenKey: string;
  value: string;
  label: string;
  type: "color" | "typography" | "spacing" | "shadow" | "radius";
  isLocked: boolean;
  state: "extracted" | "locked" | "computed";
  onLock: () => void;
  onUnlock: () => void;
  onChange: (value: string) => void;
  onReset?: () => void;
  flashTokenKey?: string | null;
}

export default function TokenCard({
  tokenKey,
  value,
  label,
  type,
  isLocked,
  state,
  onLock,
  onUnlock,
  onChange,
  onReset,
  flashTokenKey,
}: TokenCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const isFlashActive = flashTokenKey === tokenKey;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Radius preview
  const radiusPreview = type === "radius" ? (
    <div
      className="h-8 w-full border-2 border-[#3A3A5A] bg-[#1A1A2E] transition-all"
      style={{ borderRadius: value }}
    />
  ) : null;

  // Shadow preview
  const shadowPreview = type === "shadow" ? (
    <div
      className="h-8 w-full bg-[#1A1A2E] rounded-xl transition-all"
      style={{ boxShadow: value }}
    />
  ) : null;

  return (
    <motion.div
      className="relative rounded-2xl border bg-[#141422] p-4 text-[var(--cosmic-text)]"
      initial={false}
      animate={{
        borderColor: isFlashActive
          ? "#50D18D"
          : isLocked
            ? "#934AC5"
            : "#2A2A40",
        boxShadow: isFlashActive
          ? "0 0 0 3px rgba(80,209,141,0.22), 0 8px 32px rgba(0,0,0,0.3)"
          : isLocked
            ? "0 0 0 2px rgba(147,74,197,0.2), 0 8px 32px rgba(0,0,0,0.28)"
            : "0 4px 20px rgba(0,0,0,0.22)",
        y: isFlashActive ? -2 : 0,
      }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
    >
      {/* Header row */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold capitalize text-white">{label}</p>
          <p className="token-mono truncate text-[10px] text-[#5A5A75]">{tokenKey}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge state={state} />
          {onReset && state !== "extracted" && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={onReset}
              title="Reset to extracted"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#2A2A40] bg-[#1A1A2E] text-[#5A5A75] transition hover:border-[#3A3A5A] hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
            </motion.button>
          )}
          <LockButton isLocked={isLocked} onClick={isLocked ? onUnlock : onLock} />
        </div>
      </div>

      {/* Color type */}
      {type === "color" && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setIsExpanded((c) => !c)}
            className="flex w-full items-center gap-3 rounded-xl border border-[#2A2A40] bg-[#1A1A2E] px-3 py-2.5 text-left transition hover:border-[#3A3A5A]"
          >
            <motion.span
              className="h-9 w-9 shrink-0 rounded-xl border border-white/15 shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
              style={{ background: value }}
              animate={{ scale: isExpanded ? 1.06 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
            <span className="min-w-0 flex-1">
              <span className="token-mono block text-sm font-semibold text-white">{value.toUpperCase()}</span>
            </span>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#5A5A75] transition hover:text-white"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </motion.button>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A5A75]">
                {isExpanded ? "▲" : "▼"}
              </span>
            </div>
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <ColorPicker value={value} onChange={onChange} disabled={isLocked} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Radius type */}
      {type === "radius" && (
        <div className="space-y-2">
          {radiusPreview}
          <input
            value={value}
            disabled={isLocked}
            onChange={(e) => onChange(e.target.value)}
            className="token-mono w-full rounded-xl border border-[#2A2A40] bg-[#0F0F1A] px-3 py-2 text-sm text-white outline-none transition focus:border-[#934AC5] focus:ring-2 focus:ring-[rgba(147,74,197,0.3)] disabled:opacity-50"
          />
        </div>
      )}

      {/* Shadow type */}
      {type === "shadow" && (
        <div className="space-y-2">
          {shadowPreview}
          <input
            value={value}
            disabled={isLocked}
            onChange={(e) => onChange(e.target.value)}
            className="token-mono w-full rounded-xl border border-[#2A2A40] bg-[#0F0F1A] px-3 py-2 text-sm text-white outline-none transition focus:border-[#934AC5] focus:ring-2 focus:ring-[rgba(147,74,197,0.3)] disabled:opacity-50"
          />
        </div>
      )}

      {/* Other types */}
      {type !== "color" && type !== "radius" && type !== "shadow" && (
        <input
          value={value}
          disabled={isLocked}
          onChange={(e) => onChange(e.target.value)}
          className="token-mono w-full rounded-xl border border-[#2A2A40] bg-[#0F0F1A] px-3 py-2 text-sm text-white outline-none transition focus:border-[#934AC5] focus:ring-2 focus:ring-[rgba(147,74,197,0.3)] disabled:opacity-50"
        />
      )}
    </motion.div>
  );
}
