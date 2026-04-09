"use client";

import { useMemo } from "react";
import { Download, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import CardNav from "@/components/layout/CardNav";

interface TopBarProps {
  url: string;
  status: string;
  onExport: () => void;
  onRescrape?: () => void;
  onTabSelect?: (tab: string) => void;
}



export default function TopBar({ url, status, onExport, onRescrape, onTabSelect }: TopBarProps) {
  const DASHBOARD_NAV_ITEMS = useMemo(() => [
    {
      label: 'Design System',
      bgColor: '#1A1A2E',
      textColor: '#ffffff',
      links: [
        { label: 'Color Tokens', onClick: () => onTabSelect?.('colors'), ariaLabel: 'Colors' },
        { label: 'Typography Engine', onClick: () => onTabSelect?.('typography'), ariaLabel: 'Typography' },
        { label: 'Spacing Metrics', onClick: () => onTabSelect?.('spacing'), ariaLabel: 'Spacing' }
      ]
    },
    {
      label: 'Code Export',
      bgColor: '#23153c',
      textColor: '#e9d5ff',
      links: [
        { label: 'Download CSS Vars', onClick: onExport, ariaLabel: 'Export CSS' },
        { label: 'Raw JSON Objects', onClick: onExport, ariaLabel: 'JSON' },
        { label: 'Tailwind Config', onClick: onExport, ariaLabel: 'Tailwind' }
      ]
    },
    {
      label: 'Settings',
      bgColor: '#141422',
      textColor: '#C9C9D4',
      links: [
        { label: 'API Integrations', href: '#', ariaLabel: 'API' },
        { label: 'Documentation', href: '#', ariaLabel: 'Docs' }
      ]
    }
  ], [onExport, onTabSelect]);

  const statusConfig =
    status === "done"
      ? { cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20", dot: "bg-emerald-400", label: "Extracted" }
      : status === "failed"
        ? { cls: "bg-rose-500/15 text-rose-300 border-rose-500/20", dot: "bg-rose-400", label: "Failed" }
        : status === "running"
          ? { cls: "bg-amber-500/15 text-amber-300 border-amber-500/20", dot: "bg-amber-400 animate-pulse", label: "Analyzing" }
          : { cls: "bg-[#202036] text-[#8A8AA3] border-[#2A2A40]", dot: "bg-[#8A8AA3]", label: status };

  const RightActions = (
    <div className="flex items-center gap-3">
      <div className="hidden min-w-0 lg:block border-r border-[#3A3A5A] pr-4 mr-1">
        <p className="truncate text-[11px] font-semibold text-[#8A8AA3] max-w-[140px] xl:max-w-xs">{url}</p>
      </div>

      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold ${statusConfig.cls}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
        {statusConfig.label}
      </span>

      {onRescrape && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onRescrape}
          title="Analyze a new URL"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A2A40] bg-[#141422] px-3 py-1.5 text-xs font-semibold text-[#C9C9D4] transition hover:border-[#3A3A5A] hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New</span>
        </motion.button>
      )}

      <motion.button
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={onExport}
        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#934AC5] to-[#7B3FE4] px-4 py-1.5 text-xs font-bold tracking-wide text-white shadow-[0_0_16px_rgba(147,74,197,0.45)] transition hover:brightness-110"
      >
        <Download className="h-3.5 w-3.5" />
        Export
      </motion.button>
    </div>
  );

  return (
    <div className="relative h-20 w-full shrink-0 z-30">
      <CardNav 
        variant="dashboard"
        items={DASHBOARD_NAV_ITEMS}
        rightActions={RightActions}
        baseColor="transparent"
      />
    </div>
  );
}
