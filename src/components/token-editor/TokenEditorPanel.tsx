"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TokenCard from "@/components/token-editor/TokenCard";
import TypographyInspector from "@/components/token-editor/TypographyInspector";
import SpacingVisualizer from "@/components/token-editor/SpacingVisualizer";
import { useTokenStore } from "@/store/tokens";

type Tab = "colors" | "typography" | "spacing" | "shadows" | "radii";

const TABS: { id: Tab; label: string }[] = [
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Type" },
  { id: "spacing", label: "Spacing" },
  { id: "shadows", label: "Shadows" },
  { id: "radii", label: "Radii" },
];

interface TokenEditorPanelProps {
  flashTokenKey?: string | null;
  activeTab?: string;
  onActiveTabChange?: (tab: string) => void;
}

function resolveTab(activeTab: string | undefined): Tab {
  const valid: Tab[] = ["colors", "typography", "spacing", "shadows", "radii"];
  if (activeTab && valid.includes(activeTab as Tab)) return activeTab as Tab;
  return "colors";
}

export default function TokenEditorPanel({ flashTokenKey, activeTab, onActiveTabChange }: TokenEditorPanelProps) {
  const [internalTab, setInternalTab] = useState<Tab>("colors");
  const tab = resolveTab(activeTab) ?? internalTab;

  const { tokens, lockedKeys, tokenStates, updateToken, lockToken, unlockToken, resetToExtracted } = useTokenStore();

  const colorEntries = useMemo(() => {
    if (!tokens) return [];
    return Object.entries(tokens.colors);
  }, [tokens]);

  const shadowEntries = useMemo(() => {
    if (!tokens) return [];
    return Object.entries(tokens.shadows);
  }, [tokens]);

  const radiiEntries = useMemo(() => {
    if (!tokens) return [];
    return Object.entries(tokens.radii);
  }, [tokens]);

  if (!tokens) {
    return (
      <div className="glass-dark flex h-full flex-col items-center justify-center rounded-2xl p-8 text-center">
        <div className="mb-4 h-16 w-16 rounded-2xl bg-[#1A1A2E] border border-[#2A2A40] flex items-center justify-center">
          <svg className="h-7 w-7 text-[#5A5A75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-[#8A8AA3]">No tokens loaded yet</p>
        <p className="mt-1 text-xs text-[#5A5A75]">Scrape a site to begin editing</p>
      </div>
    );
  }

  const lockedCount = Array.from(lockedKeys).length;

  return (
    <div className="glass-dark flex h-full flex-col rounded-2xl text-[var(--cosmic-text)]">
      {/* Header */}
      <div className="shrink-0 border-b border-[#2A2A40] px-4 pt-4 pb-3">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Token Editor</h2>
            <p className="mt-0.5 text-xs text-[#5A5A75]">
              {lockedCount} locked · {colorEntries.length} colors · real-time preview
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">Live</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setInternalTab(t.id);
                onActiveTabChange?.(t.id);
              }}
              className={`relative flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition ${
                tab === t.id ? "text-white" : "text-[#5A5A75] hover:text-[#C9C9D4]"
              }`}
            >
              {tab === t.id && (
                <motion.span
                  layoutId="active-editor-tab"
                  className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-[#7f43d4] to-[#9d66f3]"
                  transition={{ type: "spring", stiffness: 340, damping: 28 }}
                />
              )}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-3 pb-4"
          >
            {tab === "colors" && colorEntries.map(([key, value]) => {
              const tokenKey = `colors.${key}`;
              const locked = lockedKeys.has(tokenKey);
              return (
                <TokenCard
                  key={tokenKey}
                  tokenKey={tokenKey}
                  label={key}
                  value={value}
                  type="color"
                  isLocked={locked}
                  state={tokenStates[tokenKey] ?? "extracted"}
                  onLock={() => lockToken(tokenKey)}
                  onUnlock={() => unlockToken(tokenKey)}
                  onChange={(next) => updateToken(tokenKey, next)}
                  onReset={() => resetToExtracted(tokenKey)}
                  flashTokenKey={flashTokenKey}
                />
              );
            })}

            {tab === "typography" && (
              <TypographyInspector
                headingFont={tokens.typography.headingFont}
                bodyFont={tokens.typography.bodyFont}
                baseSize={tokens.typography.baseSize}
                lineHeight={tokens.typography.lineHeight}
                scale={tokens.typography.scale}
                lockedKeys={lockedKeys}
                onLock={lockToken}
                onChange={updateToken}
              />
            )}

            {tab === "spacing" && (
              <SpacingVisualizer
                unit={tokens.spacing.unit}
                scale={tokens.spacing.scale}
                lockedKeys={lockedKeys}
                onLock={lockToken}
                onChange={(next) => updateToken("spacing.unit", String(next))}
              />
            )}

            {tab === "shadows" && shadowEntries.map(([key, value]) => (
              <TokenCard
                key={key}
                tokenKey={`shadows.${key}`}
                label={key}
                value={value}
                type="shadow"
                isLocked={lockedKeys.has(`shadows.${key}`)}
                state={tokenStates[`shadows.${key}`] ?? "extracted"}
                onLock={() => lockToken(`shadows.${key}`)}
                onUnlock={() => unlockToken(`shadows.${key}`)}
                onChange={(next) => updateToken(`shadows.${key}`, next)}
                onReset={() => resetToExtracted(`shadows.${key}`)}
                flashTokenKey={flashTokenKey}
              />
            ))}

            {tab === "radii" && radiiEntries.map(([key, value]) => (
              <TokenCard
                key={key}
                tokenKey={`radii.${key}`}
                label={key}
                value={value}
                type="radius"
                isLocked={lockedKeys.has(`radii.${key}`)}
                state={tokenStates[`radii.${key}`] ?? "extracted"}
                onLock={() => lockToken(`radii.${key}`)}
                onUnlock={() => unlockToken(`radii.${key}`)}
                onChange={(next) => updateToken(`radii.${key}`, next)}
                onReset={() => resetToExtracted(`radii.${key}`)}
                flashTokenKey={flashTokenKey}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
