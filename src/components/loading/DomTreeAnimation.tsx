"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const labels = [
  "Parsing HTML structure...",
  "Extracting CSS tokens...",
  "Analyzing color palette...",
  "Building design tokens...",
];

const nodeVariant = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: [0.2, 0.6, 0.2],
    scale: 1,
    transition: {
      duration: 1.6,
      repeat: Number.POSITIVE_INFINITY,
    },
  },
};

export default function DomTreeAnimation() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setIndex((current) => (current + 1) % labels.length), 1800);
    return () => clearInterval(interval);
  }, []);

  const levelOneX = useMemo(() => [80, 200, 320], []);
  const levelTwoX = useMemo(() => [40, 120, 160, 240, 280, 360], []);

  return (
    <div className="panel-card flex w-full items-center justify-center rounded-2xl p-6">
      <div className="w-[400px]">
        <motion.svg width="400" height="260" viewBox="0 0 400 260" initial="hidden" animate="visible">
          <circle cx="200" cy="24" r="10" fill="rgba(147,74,197,0.28)" />

          {levelOneX.map((x, i) => (
            <g key={`l1-${x}`}>
              <line x1="200" y1="34" x2={x} y2="76" stroke="rgba(147,74,197,0.2)" strokeWidth="2" />
              <motion.rect
                x={x - 40}
                y="76"
                rx="8"
                width="80"
                height="28"
                fill="rgba(147,74,197,0.2)"
                variants={nodeVariant}
                transition={{ delay: 0.3 + i * 0.15 }}
              />
            </g>
          ))}

          {levelTwoX.map((x, i) => {
            const parent = levelOneX[Math.floor(i / 2)];
            const y = 148;
            return (
              <g key={`l2-${x}`}>
                <line x1={parent} y1="104" x2={x} y2={y} stroke="rgba(147,74,197,0.2)" strokeWidth="2" />
                <motion.rect
                  x={x - 40}
                  y={y}
                  rx="8"
                  width="80"
                  height="28"
                  fill="rgba(147,74,197,0.2)"
                  variants={nodeVariant}
                  transition={{ delay: 0.75 + i * 0.15 }}
                />
              </g>
            );
          })}
        </motion.svg>

        <motion.p
          key={labels[index]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mt-2 text-center text-sm text-[var(--color-text-muted)]"
        >
          {labels[index]}
        </motion.p>
      </div>
    </div>
  );
}
