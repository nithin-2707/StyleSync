"use client";

import { motion } from "framer-motion";
import { Globe, Clock, RotateCcw } from "lucide-react";
import type { VersionHistoryEntry } from "@/types/tokens";
import { useTokenStore } from "@/store/tokens";

interface SidebarProps {
  url?: string;
  history: VersionHistoryEntry[];
  onRestore: (entry: VersionHistoryEntry) => void;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function Sidebar({ url, history, onRestore }: SidebarProps) {
  const tokens = useTokenStore((state) => state.tokens);
  const lockedKeys = useTokenStore((state) => state.lockedKeys);

  const colorCount = tokens?.colors ? Object.keys(tokens.colors).length : 0;
  const lockedCount = lockedKeys.size;

  const displayUrl = url && url !== "Loading..." ? url.replace(/^https?:\/\//, "") : null;

  return (
    <aside className="glass-dark flex h-full flex-col gap-4 rounded-[28px] p-4 text-[var(--cosmic-text)]">
      {/* Source card */}
      <div className="rounded-2xl border border-[#2A2A40] bg-[#141422] p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#5A5A75]">Active Source</p>
        {displayUrl ? (
          <div className="flex items-start gap-2">
            <Globe className="mt-0.5 h-4 w-4 shrink-0 text-[#934AC5]" />
            <p className="break-all text-sm font-semibold text-white leading-snug">{displayUrl}</p>
          </div>
        ) : (
          <p className="text-sm text-[#5A5A75]">No source loaded</p>
        )}

        {/* Stats */}
        {tokens && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "Colors", value: colorCount },
              { label: "Locked", value: lockedCount },
              { label: "Fonts", value: 2 },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-[#1A1A2E] p-2 text-center">
                <p className="text-base font-bold text-white">{value}</p>
                <p className="text-[10px] text-[#5A5A75]">{label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="rounded-full bg-gradient-to-r from-[#934AC5] to-[#7B3FE4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_0_12px_rgba(147,74,197,0.4)]">
            Active
          </span>
          <span className="text-[10px] text-[#5A5A75]">via StyleSync</span>
        </div>
      </div>

      {/* Version History */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-[#5A5A75]" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5A5A75]">Version History</h3>
        </div>

        <div className="flex-1 space-y-2 overflow-auto pr-1 min-h-0">
          {history.length === 0 && (
            <div className="rounded-xl border border-dashed border-[#2A2A40] bg-[#141422]/50 p-4 text-center">
              <Clock className="mx-auto mb-2 h-5 w-5 text-[#2A2A40]" />
              <p className="text-xs text-[#5A5A75]">No edits yet</p>
              <p className="mt-1 text-[10px] text-[#3A3A5A]">Token changes will appear here</p>
            </div>
          )}

          {history.map((entry, index) => (
            <motion.button
              whileHover={{ y: -1, scale: 1.01 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.3) }}
              key={`${entry.tokenKey}-${entry.timestamp}`}
              type="button"
              onClick={() => onRestore(entry)}
              className="group w-full rounded-xl border border-[#2A2A40] bg-[#141422] p-3 text-left transition hover:border-[#3A3A5A] hover:bg-[#1A1A2E]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="token-mono truncate text-[10px] text-[#5A5A75]">{entry.tokenKey}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    {/* Before swatch */}
                    {entry.valueBefore.startsWith("#") && (
                      <span
                        className="h-4 w-4 shrink-0 rounded-full border border-white/10"
                        style={{ background: entry.valueBefore }}
                        title={`Before: ${entry.valueBefore}`}
                      />
                    )}
                    <span className="text-xs text-[#8A8AA3] line-through truncate">{entry.valueBefore.slice(0, 12)}</span>
                    <span className="text-[10px] text-[#5A5A75]">→</span>
                    {/* After swatch */}
                    {entry.valueAfter.startsWith("#") && (
                      <span
                        className="h-4 w-4 shrink-0 rounded-full border border-white/10"
                        style={{ background: entry.valueAfter }}
                        title={`After: ${entry.valueAfter}`}
                      />
                    )}
                    <span className="text-xs font-medium text-white truncate">{entry.valueAfter.slice(0, 12)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[10px] text-[#5A5A75]">{formatRelativeTime(entry.timestamp)}</span>
                  <RotateCcw className="h-3 w-3 text-[#3A3A5A] opacity-0 transition group-hover:opacity-100 group-hover:text-[#934AC5]" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </aside>
  );
}
