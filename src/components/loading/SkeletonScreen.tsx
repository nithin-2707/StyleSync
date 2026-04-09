"use client";

import { motion } from "framer-motion";

const bars = Array.from({ length: 7 }, (_, i) => i);

export default function SkeletonScreen() {
  return (
    <div className="panel-card rounded-2xl p-6">
      <p className="mb-4 text-sm font-medium text-[var(--color-text-muted)]">Scraping in progress...</p>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: 0.1 },
          },
        }}
        className="space-y-3"
      >
        {bars.map((bar) => (
          <motion.div
            key={bar}
            className="h-4 rounded-md bg-[var(--color-primary)]/15"
            variants={{
              hidden: { opacity: 0.2 },
              show: {
                opacity: [0.2, 0.6, 0.2],
                transition: { duration: 1.4, repeat: Number.POSITIVE_INFINITY },
              },
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
