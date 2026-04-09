"use client";

import { useState } from "react";

export default function InputSpecimen() {
  const [value, setValue] = useState("");

  const labelStyle = { fontFamily: "var(--token-font-heading)", fontSize: "calc(var(--token-font-size-base) * 0.9)", opacity: 0.9 };
  const inputStyle = {
    fontFamily: "var(--token-font-body)",
    fontSize: "var(--token-font-size-base)",
    background: "var(--token-color-background)",
    color: "var(--token-color-text)",
    border: "1px solid var(--token-color-border)",
    borderRadius: "var(--token-radius-sm)",
    boxShadow: "var(--token-shadow-sm)",
  };

  return (
    <section className="space-y-6 rounded-[28px] p-6 transition-all" style={{ background: "var(--token-color-surface)", border: "1px solid var(--token-color-border)", color: "var(--token-color-text)" }}>
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--token-color-border)" }}>
        <h3 className="font-semibold" style={{ fontFamily: "var(--token-font-heading)" }}>Inputs</h3>
        <span className="token-mono text-[10px] opacity-50">--token-color-border</span>
      </div>

      <div className="space-y-5">
        {/* Default */}
        <div className="space-y-2">
          <label className="block font-medium" style={labelStyle}>Default</label>
          <input
            type="text"
            placeholder="Enter something..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-2.5 outline-none transition-all placeholder:opacity-40"
            style={inputStyle}
          />
        </div>

        {/* Focus */}
        <div className="space-y-2">
          <label className="block font-medium" style={labelStyle}>Focus State</label>
          <input
            type="text"
            readOnly
            value="Focused input"
            className="w-full px-4 py-2.5 outline-none transition-all"
            style={{
               ...inputStyle,
               borderColor: "var(--token-color-primary)",
               boxShadow: "0 0 0 2px var(--token-color-primary), var(--token-shadow-sm)",
               opacity: 1
            }}
          />
        </div>

        {/* Error */}
        <div className="space-y-2">
          <label className="block font-medium" style={{ ...labelStyle, color: "var(--token-color-primary)" }}>Error State</label>
          <input
            type="text"
            readOnly
            value="Invalid value"
            className="w-full px-4 py-2.5 outline-none transition-all"
            style={{
               ...inputStyle,
               borderColor: "var(--token-color-primary)",
            }}
          />
          <p className="text-xs font-medium" style={{ color: "var(--token-color-primary)" }}>This field is required</p>
        </div>

        {/* Disabled */}
        <div className="space-y-2 opacity-50">
          <label className="block font-medium" style={labelStyle}>Disabled</label>
          <input
            type="text"
            disabled
            value="Cannot edit this"
            className="w-full px-4 py-2.5 outline-none transition-all cursor-not-allowed"
            style={{
               ...inputStyle,
               background: "var(--token-color-border)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
