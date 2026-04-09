"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { Palette, Type, AlignJustify, Layers, Circle as RadiusIcon, Monitor, History, Download } from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  separator?: boolean;
};

interface NavRailProps {
  activeId?: string;
  onSelect?: (id: string) => void;
}

const items: NavItem[] = [
  { id: "colors", label: "Colors", icon: Palette },
  { id: "typography", label: "Type", icon: Type },
  { id: "spacing", label: "Spacing", icon: AlignJustify },
  { id: "shadows", label: "Shadows", icon: Layers },
  { id: "radii", label: "Radii", icon: RadiusIcon, separator: true },
  { id: "preview", label: "Preview", icon: Monitor, separator: false },
  { id: "history", label: "History", icon: History },
  { id: "export", label: "Export", icon: Download },
];

export default function NavRail({ activeId = "colors", onSelect }: NavRailProps) {
  return (
    <aside className="glass-dark hidden h-full w-[84px] flex-col items-center rounded-[28px] px-2 py-4 text-[var(--cosmic-text)] lg:flex">
      {/* Logo */}
      <div className="mb-6 flex h-[46px] w-[46px] items-center justify-center">
        <img src="/images/logo.png" alt="StyleSync Logo" className="h-full w-full object-contain drop-shadow-[0_0_12px_rgba(147,74,197,0.3)] transition hover:scale-105" />
      </div>

      <div className="flex flex-1 flex-col items-center gap-1.5 w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeId;
          return (
            <div key={item.id} className="w-full">
              {item.separator && (
                <div className="my-2 mx-3 h-px bg-white/8" />
              )}
              <motion.button
                type="button"
                aria-label={item.label}
                onClick={() => onSelect?.(item.id)}
                whileTap={{ scale: 0.94 }}
                className={`group relative flex w-full flex-col items-center justify-center rounded-2xl px-1 py-2.5 transition-all ${
                  isActive
                    ? "text-white"
                    : "text-[#8A8AA3] hover:bg-white/5 hover:text-white"
                }`}
                title={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-bg"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#934AC5]/30 to-[#7B3FE4]/20 border border-[#3A3A5A]"
                    transition={{ type: "spring", stiffness: 340, damping: 30 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-dot"
                    className="absolute -left-0.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[#c084fc]"
                    transition={{ type: "spring", stiffness: 340, damping: 30 }}
                  />
                )}
                <Icon className="relative h-5 w-5" />
                <span className="relative mt-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-inherit leading-tight text-center">
                  {item.label}
                </span>
              </motion.button>
            </div>
          );
        })}
      </div>

      {/* Avatar */}
      <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#2A2A40] bg-[#141422]">
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#934AC5] to-[#7B3FE4]" />
      </div>
    </aside>
  );
}
