import { motion } from "framer-motion";
import { Clock, RotateCcw } from "lucide-react";
import type { VersionHistoryEntry } from "@/types/tokens";

interface HistoryPanelProps {
  history: VersionHistoryEntry[];
  onRestore: (entry: VersionHistoryEntry) => void;
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}

export default function HistoryPanel({ history, onRestore }: HistoryPanelProps) {
  return (
    <div className="glass-dark flex h-full flex-col rounded-2xl border border-[#2A2A40] bg-[#141422] p-6 text-[var(--cosmic-text)] overflow-hidden">
      <div className="mb-6 flex items-end justify-between border-b border-[#2A2A40] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
             <Clock className="h-6 w-6 text-[#934AC5]" />
             Token History
          </h2>
          <p className="mt-1 text-sm text-[#8A8AA3]">Every token edit is tracked. Restore to previous values instantly.</p>
        </div>
        <div className="rounded-lg bg-[#202036] px-3 py-1.5 text-xs font-semibold text-white">
          {history.length} Edits Logged
        </div>
      </div>

      <div className="flex-1 overflow-auto pr-2 space-y-3">
        {history.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-[#5A5A75]">
             <Clock className="mb-3 h-10 w-10 opacity-50" />
             <p className="font-semibold text-[#8A8AA3]">No edits yet</p>
             <p className="text-xs">Your token modifications will appear here.</p>
          </div>
        ) : (
          history.map((entry, index) => (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={`${entry.tokenKey}-${entry.timestamp}`}
              className="flex items-center justify-between rounded-2xl border border-[#2A2A40] bg-[#1A1A2E] p-4 transition-colors hover:border-[#3A3A5A]"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-8">
                 {/* Timestamp */}
                 <div className="w-32 shrink-0">
                    <p className="text-xs font-semibold text-white">{formatTime(entry.timestamp)}</p>
                    <p className="text-[10px] text-[#8A8AA3]">Automated save</p>
                 </div>

                 {/* Change Token */}
                 <div className="w-48 shrink-0">
                    <span className="token-mono rounded-lg bg-[#202036] px-2.5 py-1 text-xs text-[#c084fc]">
                       {entry.tokenKey}
                    </span>
                 </div>

                 {/* Diff */}
                 <div className="flex min-w-0 flex-1 items-center gap-4">
                    {/* Before */}
                    <div className="flex w-32 items-center gap-2 line-through opacity-60">
                      {entry.valueBefore.startsWith("#") && (
                        <span className="h-4 w-4 shrink-0 rounded-md border border-white/20" style={{ background: entry.valueBefore }} />
                      )}
                      <span className="token-mono truncate text-xs text-white">{entry.valueBefore}</span>
                    </div>

                    <span className="text-[#5A5A75] font-bold">→</span>

                    {/* After */}
                    <div className="flex w-32 items-center gap-2 font-medium">
                      {entry.valueAfter.startsWith("#") && (
                        <span className="h-5 w-5 shrink-0 rounded-md border border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.1)]" style={{ background: entry.valueAfter }} />
                      )}
                      <span className="token-mono truncate text-sm text-white">{entry.valueAfter}</span>
                    </div>
                 </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={() => onRestore(entry)}
                className="group flex h-10 items-center gap-2 rounded-xl border border-[#3A3A5A] bg-[#202036] px-4 text-xs font-semibold text-white transition hover:border-[#934AC5] hover:bg-[#934AC5]/10"
              >
                 <RotateCcw className="h-3.5 w-3.5 transition group-hover:text-[#c084fc]" />
                 Restore
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
