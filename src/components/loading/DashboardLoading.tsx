"use client";

import { motion } from "framer-motion";
import DomTreeAnimation from "@/components/loading/DomTreeAnimation";

const rows = [1, 2, 3, 4, 5, 6];

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(192,132,252,0.18),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(147,74,197,0.14),transparent_24%),#0B0B12] p-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-4 h-16 rounded-2xl border border-[#2A2A40] bg-[#141422] backdrop-blur-xl" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[84px_260px_430px_minmax(0,1fr)]">
          <div className="hidden rounded-2xl border border-[#2A2A40] bg-[#141422] p-4 backdrop-blur-xl lg:block">
            <div className="mb-4 h-10 w-10 rounded-2xl bg-[#1A1A2E]" />
            {rows.slice(0, 5).map((r) => (
              <motion.div
                key={`rail-${r}`}
                className="mb-3 h-12 rounded-2xl bg-[#1A1A2E]"
                animate={{ opacity: [0.35, 0.65, 0.35] }}
                transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, delay: r * 0.06 }}
              />
            ))}
          </div>

          <div className="rounded-2xl border border-[#2A2A40] bg-[#141422] p-4 backdrop-blur-xl">
            <div className="mb-3 h-8 w-28 rounded-md bg-[#1A1A2E]" />
            {rows.slice(0, 4).map((r) => (
              <motion.div
                key={`l-${r}`}
                className="mb-2 h-10 rounded-lg bg-[#1A1A2E]"
                animate={{ opacity: [0.35, 0.65, 0.35] }}
                transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, delay: r * 0.08 }}
              />
            ))}
          </div>

          <div className="rounded-2xl border border-[#2A2A40] bg-[#141422] p-4 backdrop-blur-xl">
            <div className="mb-3 h-8 w-40 rounded-md bg-[#1A1A2E]" />
            {rows.map((r) => (
              <motion.div
                key={`m-${r}`}
                className="mb-3 h-20 rounded-xl bg-[#1A1A2E]"
                animate={{ opacity: [0.35, 0.7, 0.35] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: r * 0.06 }}
              />
            ))}
          </div>

          <div className="rounded-2xl border border-[#2A2A40] bg-[#141422] p-5 backdrop-blur-xl">
            <DomTreeAnimation />
          </div>
        </div>
      </div>
    </div>
  );
}
