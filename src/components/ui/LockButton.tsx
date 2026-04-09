"use client";

import { motion } from "framer-motion";

interface LockButtonProps {
  isLocked: boolean;
  onClick: () => void;
}

export default function LockButton({ isLocked, onClick }: LockButtonProps) {
  return (
    <motion.button
      type="button"
      title={isLocked ? "Unlock token" : "Lock token"}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white"
      aria-label={isLocked ? "Unlock token" : "Lock token"}
    >
      <motion.svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <motion.path
          d="M7 11V8.8C7 6.1 9 4 12 4C15 4 17 6.1 17 8.8"
          stroke={isLocked ? "#934AC5" : "#9E93AE"}
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={{
            d: isLocked
              ? "M7 11V8.8C7 6.1 9 4 12 4C15 4 17 6.1 17 8.8"
              : "M7 11V7.8C7 5.8 8.8 4.4 11.3 4.4C13.2 4.4 14.8 5.2 15.8 6.8",
            rotate: isLocked ? 0 : -20,
            translateY: isLocked ? 0 : -4,
            transformOrigin: "12px 8px",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
        <motion.rect
          x="5"
          y="10"
          width="14"
          height="10"
          rx="2"
          stroke={isLocked ? "#934AC5" : "#9E93AE"}
          strokeWidth="2"
          initial={false}
          animate={{ scale: isLocked ? 1 : 0.9, transformOrigin: "12px 15px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </motion.svg>
    </motion.button>
  );
}
