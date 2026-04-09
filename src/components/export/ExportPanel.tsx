"use client";

import { useState } from "react";
import { saveAs } from "file-saver";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileCode, FileJson, Wind, Check } from "lucide-react";

interface ExportPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  siteId: string;
  mode?: "drawer" | "page";
}

const options = [
  {
    format: "css",
    title: "CSS Variables",
    description: "Export token variables as a root CSS file.",
    icon: FileCode,
    filename: "tokens.css",
  },
  {
    format: "json",
    title: "JSON Tokens",
    description: "Export design tokens as JSON.",
    icon: FileJson,
    filename: "tokens.json",
  },
  {
    format: "tailwind",
    title: "Tailwind Config",
    description: "Export theme.extend tokens for Tailwind.",
    icon: Wind,
    filename: "tailwind.config.js",
  },
] as const;

export default function ExportPanel({ isOpen = true, onClose, siteId, mode = "drawer" }: ExportPanelProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const fetchExport = async (format: string) => {
    const response = await fetch(`/api/export/${siteId}?format=${format}`);
    if (!response.ok) return null;
    return response;
  };

  const handleDownload = async (format: "css" | "json" | "tailwind", filename: string) => {
    const response = await fetchExport(format);
    if (!response) return;
    const blob = await response.blob();
    saveAs(blob, filename);
  };

  const handleCopy = async (format: "css" | "json" | "tailwind") => {
    const response = await fetchExport(format);
    if (!response) return;
    const text = await response.text();
    await navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const content = (
    <>
      <div className={`mb-8 flex items-center justify-between border-b border-[#2A2A40] pb-6 ${mode === "drawer" ? "px-6 pt-6" : ""}`}>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Export Design System</h2>
          <p className="text-sm text-[#8A8AA3]">Download your extracted tokens in a format ready for code integration.</p>
        </div>
        {mode === "drawer" && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#8A8AA3] transition hover:bg-[#1A1A2E] hover:text-white"
          >
            Close
          </button>
        )}
      </div>

      <div className={`grid gap-6 ${mode === "page" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex-1 space-y-4 pr-1"}`}>
        {options.map((option) => {
          const Icon = option.icon;
          const isCopied = copiedFormat === option.format;

          return (
            <article key={option.format} className="flex flex-col justify-between rounded-[24px] border border-[#2A2A40] bg-[#1A1A2E] p-6 transition-colors hover:border-[#3A3A5A]">
              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#202036] text-[#c084fc] shadow-inner">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{option.title}</h3>
                <p className="mb-8 text-sm font-medium text-[#8A8AA3]">{option.description}</p>
              </div>

              <div className="flex items-center gap-3 mt-auto">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => handleDownload(option.format, option.filename)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#934AC5] to-[#7B3FE4] px-4 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(147,74,197,0.3)] transition hover:brightness-110"
                >
                  <Download className="h-4 w-4" />
                  Download
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => handleCopy(option.format)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#3A3A5A] bg-[#202036] px-4 text-sm font-semibold text-white transition hover:bg-[#2A2A40]"
                  title="Copy formatted code to clipboard"
                >
                  {isCopied ? <Check className="h-5 w-5 text-emerald-400" /> : <span className="token-mono text-xs">Copy</span>}
                </motion.button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );

  if (mode === "page") {
    return (
      <div className="glass-dark h-full w-full rounded-2xl border border-[#2A2A40] bg-[#141422] p-8 text-[var(--cosmic-text)]">
        <div className="mx-auto max-w-5xl h-full flex flex-col">
          {content}
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-[#0B0B12]/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-[#2A2A40] bg-[#141422] text-[var(--cosmic-text)] shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {content}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
