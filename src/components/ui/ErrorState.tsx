"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Clock3, ShieldX } from "lucide-react";

interface ErrorStateProps {
  errorCode: "BLOCKED" | "TIMEOUT" | "NAVIGATION_ERROR" | "INVALID_URL";
  url: string;
  onRetry: () => void;
  onManualEntry: () => void;
}

export default function ErrorState({ errorCode, url, onRetry, onManualEntry }: ErrorStateProps) {
  const config = {
    BLOCKED: {
      title: "This site blocks scanners",
      description:
        "The target website appears to use CORS or bot protection, which prevented extraction. You can retry or enter/edit tokens manually.",
      icon: ShieldX,
      primaryLabel: "Enter tokens manually",
      ghostLabel: "Try anyway",
      primaryAction: onManualEntry,
      ghostAction: onRetry,
    },
    TIMEOUT: {
      title: "Site took too long to respond",
      description: "The website may be slow or temporarily offline. Try again in a moment, or proceed with manual tokens.",
      icon: Clock3,
      primaryLabel: "Retry",
      ghostLabel: "Enter tokens manually",
      primaryAction: onRetry,
      ghostAction: onManualEntry,
    },
    NAVIGATION_ERROR: {
      title: "Unable to load the website",
      description: "Navigation failed while scraping this URL. Verify the domain and try again.",
      icon: AlertTriangle,
      primaryLabel: "Retry",
      ghostLabel: "Enter tokens manually",
      primaryAction: onRetry,
      ghostAction: onManualEntry,
    },
    INVALID_URL: {
      title: "That does not look like a URL",
      description: "Please include protocol and domain, for example: https://example.com",
      icon: AlertTriangle,
      primaryLabel: "Retry",
      ghostLabel: "Enter tokens manually",
      primaryAction: onRetry,
      ghostAction: onManualEntry,
    },
  }[errorCode];

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="rounded-2xl border border-[#F4C7C7] bg-white p-6"
    >
      <div className="mb-4 flex items-start gap-4">
        <div className="rounded-full bg-[#FDECEC] p-3 text-[#C94E4E]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{config.title}</h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{config.description}</p>
          <p className="mt-2 text-xs text-[var(--color-text-faint)]">Target: {url}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={config.primaryAction}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
        >
          {config.primaryLabel}
        </button>
        <button
          type="button"
          onClick={config.ghostAction}
          className="rounded-lg border border-[var(--color-border-strong)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)]"
        >
          {config.ghostLabel}
        </button>
      </div>
    </motion.div>
  );
}
