"use client";

export default function ButtonSpecimen() {
  const baseStyle = {
    fontFamily: "var(--token-font-body)",
    borderRadius: "var(--token-radius-base)",
    fontWeight: 600,
  };

  return (
    <section className="space-y-6 rounded-[28px] p-6 transition-all" style={{ background: "var(--token-color-surface)", border: "1px solid var(--token-color-border)", color: "var(--token-color-text)" }}>
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--token-color-border)" }}>
        <h3 className="font-semibold" style={{ fontFamily: "var(--token-font-heading)" }}>Buttons</h3>
        <span className="token-mono text-[10px] opacity-50">--token-color-primary</span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Primary */}
        <button
          type="button"
          className="px-6 py-2.5 transition-all hover:brightness-110 active:scale-95"
          style={{
             ...baseStyle,
             background: "var(--token-color-primary)",
             color: "var(--token-color-background)",
             boxShadow: "var(--token-shadow-sm)"
          }}
        >
          Primary
        </button>

        {/* Secondary */}
        <button
          type="button"
          className="px-6 py-2.5 transition-all hover:bg-opacity-10 active:scale-95"
          style={{
             ...baseStyle,
             background: "transparent",
             color: "var(--token-color-text)",
             border: "1px solid var(--token-color-border)",
          }}
        >
          Secondary
        </button>

        {/* Ghost */}
        <button
          type="button"
          className="px-6 py-2.5 transition-all hover:opacity-100 opacity-70 active:scale-95"
          style={{
             ...baseStyle,
             background: "transparent",
             color: "var(--token-color-text)",
          }}
        >
          Ghost
        </button>

        {/* Accent */}
        <button
          type="button"
          className="px-6 py-2.5 transition-all hover:brightness-110 active:scale-95"
          style={{
             ...baseStyle,
             background: "var(--token-color-border)",
             color: "var(--token-color-background)",
          }}
        >
          Accent
        </button>

        {/* Disabled */}
        <button
          type="button"
          disabled
          className="cursor-not-allowed px-6 py-2.5 opacity-50 transition-all"
          style={{
             ...baseStyle,
             background: "var(--token-color-border)",
             color: "var(--token-color-background)",
          }}
        >
          Disabled
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 pt-4 border-t" style={{ borderColor: "var(--token-color-border)" }}>
        <button
          type="button"
          className="px-4 py-1.5 text-xs transition-all hover:brightness-110"
          style={{ ...baseStyle, background: "var(--token-color-primary)", color: "var(--token-color-background)" }}
        >
          SM
        </button>
        <button
          type="button"
          className="px-6 py-2.5 transition-all hover:brightness-110"
          style={{ ...baseStyle, background: "var(--token-color-primary)", color: "var(--token-color-background)" }}
        >
          MD
        </button>
        <button
          type="button"
          className="px-8 py-3.5 text-lg transition-all hover:brightness-110"
          style={{ ...baseStyle, background: "var(--token-color-primary)", color: "var(--token-color-background)" }}
        >
          LG
        </button>
      </div>
    </section>
  );
}
