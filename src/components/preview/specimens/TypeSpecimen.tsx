"use client";

import { useTokenStore } from "@/store/tokens";

const SCALE_LABELS = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"];

export default function TypeSpecimen() {
  const tokens = useTokenStore((state) => state.tokens);
  
  if (!tokens || !tokens.typography) return null;

  const scale = tokens.typography.scale || [];

  return (
    <div className="space-y-8">
      {/* Type Overview */}
      <div className="rounded-[28px] p-8" style={{ background: "var(--token-color-surface)", border: "1px solid var(--token-color-border)", color: "var(--token-color-text)" }}>
        <h3 className="mb-6 font-semibold" style={{ fontFamily: "var(--token-font-heading)", fontSize: "var(--token-font-size-xl, 24px)" }}>Typographic Scale</h3>
        <div className="space-y-8">
          <div className="border-b pb-4" style={{ borderColor: "var(--token-color-border)" }}>
            <span className="token-mono mb-2 block text-xs opacity-50">Heading (var(--token-font-heading))</span>
            <div className="text-4xl" style={{ fontFamily: "var(--token-font-heading)" }}>
              The quick brown fox jumps over the lazy dog
            </div>
          </div>
          <div>
            <span className="token-mono mb-2 block text-xs opacity-50">Body (var(--token-font-body))</span>
            <div className="text-xl" style={{ fontFamily: "var(--token-font-body)" }}>
              Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!
            </div>
          </div>
        </div>
      </div>

      {/* Scale Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {scale.map((value, index) => {
          const key = SCALE_LABELS[index] || `scale-${index}`;
          return (
            <div key={key} className="flex items-center justify-between rounded-[20px] p-6" style={{ background: "var(--token-color-surface)", border: "1px solid var(--token-color-border)", color: "var(--token-color-text)" }}>
              <div className="min-w-[100px]">
                <span className="token-mono text-xs font-semibold uppercase">{key}</span>
                <p className="token-mono text-[10px] opacity-50">{value as string}</p>
              </div>
              <div
                className="truncate text-right"
                style={{
                  fontFamily: "var(--token-font-body)",
                  fontSize: value as string,
                }}
              >
                Ag
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
