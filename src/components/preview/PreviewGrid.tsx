"use client";

import { useState } from "react";
import { useTokenStore } from "@/store/tokens";
import ButtonSpecimen from "@/components/preview/specimens/ButtonSpecimen";
import InputSpecimen from "@/components/preview/specimens/InputSpecimen";
import CardSpecimen from "@/components/preview/specimens/CardSpecimen";
import TypeSpecimen from "@/components/preview/specimens/TypeSpecimen";

interface PreviewGridProps {
  fullscreen?: boolean;
}

type Tab = "components" | "colors" | "typography" | "spacing";

export default function PreviewGrid({ fullscreen }: PreviewGridProps) {
  const tokens = useTokenStore((state) => state.tokens);
  const [activeTab, setActiveTab] = useState<Tab>("components");

  if (!tokens) {
    return (
      <div className="glass-dark flex h-full items-center justify-center rounded-2xl p-6 text-[var(--cosmic-text)]">
        <p className="text-[#8A8AA3]">Preview will appear once tokens are loaded.</p>
      </div>
    );
  }

  return (
    <div className={`glass-dark flex flex-col overflow-hidden text-[var(--cosmic-text)] w-full transition-all ${fullscreen ? "h-full rounded-[28px] border border-[#2A2A40]" : "h-full rounded-2xl border border-[#2A2A40]"}`}>
      {/* Header Tabs */}
      <div className="shrink-0 border-b border-[#2A2A40] bg-[#141422] p-4 flex items-center justify-between">
        <div className="flex gap-2">
          {(["components", "colors", "typography", "spacing"] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                activeTab === tab
                  ? "bg-[#202036] text-white shadow-[0_0_12px_rgba(147,74,197,0.2)]"
                  : "text-[#8A8AA3] hover:text-[#C9C9D4]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
           <span className="token-mono rounded-md bg-[#202036] px-2 py-1 text-[10px] text-[#8A8AA3]">
            Live CSS variables
          </span>
        </div>
      </div>

      {/* Content Area uses the extracted token colors for total Canvas fidelity! */}
      <div 
         className="flex-1 overflow-auto p-6 md:p-8 preview-canvas transition-colors"
         style={{
            background: "var(--token-color-background)",
            color: "var(--token-color-text)",
         }}
      >
        {activeTab === "components" && (
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="mb-8 p-6 rounded-[28px]" style={{ background: "var(--token-color-surface)", border: "1px solid var(--token-color-border)" }}>
              <h1 className="mb-2 font-bold" style={{ fontFamily: "var(--token-font-heading)", fontSize: "calc(var(--token-font-size-base) * 2.5)", lineHeight: 1.1 }}>
                Brand Components
              </h1>
              <p className="opacity-80" style={{ fontFamily: "var(--token-font-body)", fontSize: "calc(var(--token-font-size-base) * 1.1)" }}>
                This is how your extracted design tokens assemble into UI components.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <ButtonSpecimen />
              <InputSpecimen />
            </div>
            <CardSpecimen />
          </div>
        )}

        {activeTab === "colors" && (
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 font-bold" style={{ fontFamily: "var(--token-font-heading)", fontSize: "calc(var(--token-font-size-base) * 2)" }}>
              Color System
            </h1>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Object.entries(tokens.colors).map(([key, value]) => (
                <div key={key} className="space-y-3 rounded-2xl border p-4 transition-all hover:scale-[1.02]" style={{ borderColor: "var(--token-color-border)", background: "var(--token-color-surface)" }}>
                  <div
                    className="h-16 w-full rounded-xl shadow-[var(--token-shadow-sm)] border border-[#ffffff10]"
                    style={{ background: String(value) }}
                  />
                  <div>
                    <p className="text-sm font-semibold capitalize">{key}</p>
                    <p className="token-mono text-xs opacity-70">{String(value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "typography" && (
          <div className="mx-auto max-w-4xl">
            <TypeSpecimen />
          </div>
        )}

        {activeTab === "spacing" && (
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 font-bold" style={{ fontFamily: "var(--token-font-heading)", fontSize: "calc(var(--token-font-size-base) * 2)" }}>
              Spacing Rhythm
            </h1>
            <div className="space-y-4 rounded-[28px] p-6" style={{ background: "var(--token-color-surface)", border: "1px solid var(--token-color-border)" }}>
              {tokens.spacing.scale.map((px) => (
                <div key={px} className="flex items-center gap-4">
                  <span className="token-mono w-12 text-right text-sm opacity-60 font-semibold">{px}px</span>
                  <div className="flex-1">
                    <div
                      className="rounded-r-md transition-all h-6"
                      style={{
                        width: `${px}px`,
                        background: "var(--token-color-primary)",
                        opacity: 0.8,
                        minWidth: "2px"
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
