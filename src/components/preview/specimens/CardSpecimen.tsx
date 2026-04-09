"use client";

import chroma from "chroma-js";
import { useTokenStore } from "@/store/tokens";

export default function CardSpecimen() {
  const tokens = useTokenStore((state) => state.tokens);

  const onPrimary =
    tokens && chroma.contrast(tokens.colors.primary, "#FFFFFF") >= 4.5
      ? "#FFFFFF"
      : "#111111";

  return (
    <section className="space-y-6 rounded-[28px] p-6 transition-all" style={{ background: "var(--token-color-surface)", border: "1px solid var(--token-color-border)", color: "var(--token-color-text)" }}>
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--token-color-border)" }}>
        <h3 className="font-semibold" style={{ fontFamily: "var(--token-font-heading)" }}>Cards</h3>
        <span className="token-mono text-[10px] opacity-50">--token-shadow-md</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Elevated Card */}
        <div
          className="flex flex-col overflow-hidden transition-all hover:-translate-y-1"
          style={{
             background: "var(--token-color-background)",
             borderRadius: "var(--token-radius-lg)",
             boxShadow: "var(--token-shadow-md)",
          }}
        >
          <div
            className="h-32 w-full"
            style={{
               background: "linear-gradient(135deg, var(--token-color-primary) 0%, var(--token-color-border) 100%)",
            }}
          />
          <div className="flex flex-1 flex-col p-6">
            <h4 className="mb-2 text-lg font-bold" style={{ fontFamily: "var(--token-font-heading)" }}>
              Elevated Card
            </h4>
            <p className="mb-6 flex-1 opacity-70" style={{ fontFamily: "var(--token-font-body)", fontSize: "calc(var(--token-font-size-base) * 0.95)" }}>
              Uses the medium shadow token and large border radius.
            </p>
            <button
              type="button"
              className="w-full rounded-md py-2.5 font-semibold transition-all hover:brightness-110"
              style={{
                 background: "var(--token-color-primary)",
                  color: onPrimary,
                  borderRadius: "var(--token-radius-md)",
              }}
            >
              Action
            </button>
          </div>
        </div>

        {/* Outlined Card */}
        <div
          className="flex flex-col p-6 transition-all hover:border-opacity-100"
          style={{
             background: "transparent",
             borderRadius: "var(--token-radius-lg)",
             border: "2px solid var(--token-color-border)",
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <span
               className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "var(--token-color-primary)", color: onPrimary }}
            >
              Label
            </span>
            <span className="text-xs opacity-50" style={{ fontFamily: "var(--token-font-body)" }}>Optional</span>
          </div>
          <h4 className="mb-2 text-lg font-bold" style={{ fontFamily: "var(--token-font-heading)" }}>
            Outlined Variant
          </h4>
          <p className="mb-6 flex-1 opacity-70" style={{ fontFamily: "var(--token-font-body)", fontSize: "calc(var(--token-font-size-base) * 0.95)" }}>
            Minimal design utilizing border tokens instead of shadows.
          </p>
          <div className="flex gap-3 mt-auto">
            <button
              type="button"
              className="flex-1 py-2 font-semibold transition-all hover:bg-opacity-10"
              style={{
                 background: "transparent",
                 color: "var(--token-color-text)",
                 border: "1px solid var(--token-color-border)",
                  borderRadius: "var(--token-radius-md)",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex-1 py-2 font-semibold transition-all hover:brightness-110"
              style={{
                 background: "var(--token-color-primary)",
                  color: onPrimary,
                  borderRadius: "var(--token-radius-md)",
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
