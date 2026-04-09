"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Link2, Palette, Type, AlignJustify, Lock, Download, Zap } from "lucide-react";

import CardNav from "@/components/layout/CardNav";

type ScrapeErrorCode = "BLOCKED" | "TIMEOUT" | "NAVIGATION_ERROR" | "INVALID_URL";

const NAV_ITEMS = [
  {
    label: 'Platform',
    bgColor: '#1A1A2E',
    textColor: '#ffffff',
    links: [
      { label: 'Extraction Engine', href: '#', ariaLabel: 'Extraction Engine' },
      { label: 'Token Manager', href: '#', ariaLabel: 'Token Manager' },
      { label: 'Live Preview', href: '#', ariaLabel: 'Live Preview' }
    ]
  },
  {
    label: 'Resources',
    bgColor: '#23153c',
    textColor: '#e9d5ff',
    links: [
      { label: 'Documentation', href: '#', ariaLabel: 'Documentation' },
      { label: 'Examples', href: '#', ariaLabel: 'Examples' },
      { label: 'GitHub', href: '#', ariaLabel: 'GitHub' }
    ]
  },
  {
    label: 'Company',
    bgColor: '#141422',
    textColor: '#C9C9D4',
    links: [
      { label: 'About Us', href: '#', ariaLabel: 'About Us' },
      { label: 'Blog', href: '#', ariaLabel: 'Blog' },
      { label: 'Contact', href: '#', ariaLabel: 'Contact' }
    ]
  }
];

const DEMO_SITES = [
  { label: "Stripe", url: "https://stripe.com", color: "#635BFF", desc: "Corporate fintech" },
  { label: "Allbirds", url: "https://www.allbirds.com", color: "#1D3C34", desc: "E-commerce" },
  { label: "Bruno Simon", url: "https://bruno-simon.com", color: "#FF3D00", desc: "Creative portfolio" },
];

const FEATURES = [
  { icon: Palette, label: "Color Extraction", desc: "Dominant palette from CSS & images" },
  { icon: Type, label: "Typography Detection", desc: "Heading & body font hierarchy" },
  { icon: AlignJustify, label: "Spacing Rhythm", desc: "4/8px grid token heuristics" },
  { icon: Lock, label: "Token Locking", desc: "Freeze tokens across re-scrapes" },
  { icon: Download, label: "Multi-format Export", desc: "CSS vars, JSON, Tailwind config" },
  { icon: Zap, label: "Live Preview", desc: "Real-time component preview grid" },
];

const PROCESS_STEPS = [
  { num: "01", label: "Ingest", desc: "Paste any URL — we handle SSR, SPAs, and static HTML" },
  { num: "02", label: "Extract", desc: "Colors, typography, and spacing are analyzed and normalized" },
  { num: "03", label: "Visualize", desc: "Explore tokens in a Figma-like dashboard" },
  { num: "04", label: "Export", desc: "Download CSS variables, JSON tokens, or Tailwind config" },
];

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("https://stripe.com");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ScrapeErrorCode | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "session";
    const key = "stylesync-session-id";
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const next = crypto.randomUUID();
    localStorage.setItem(key, next);
    return next;
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setErrorMessage("");

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, sessionId }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { errorCode?: ScrapeErrorCode; error?: string } | null;
        setError(body?.errorCode ?? "NAVIGATION_ERROR");
        setErrorMessage(body?.error ?? "Something went wrong.");
        return;
      }

      const body = (await response.json()) as { siteId: string; status: string };
      if (body.status === "done") {
        router.push(`/dashboard/${body.siteId}`);
      } else {
        router.push(`/analyzing/${body.siteId}`);
      }
    } catch {
      setError("TIMEOUT");
      setErrorMessage("Request timed out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoUrl = (demoUrl: string) => {
    setUrl(demoUrl);
    setError(null);
  };

  const handleGetStarted = () => {
    const input = document.querySelector('input[placeholder="https://example.com"]') as HTMLInputElement;
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus();
    }
  };

  return (
    <main className="cosmic-bg star-grid min-h-screen overflow-x-hidden text-[var(--cosmic-text)]">
      {/* Nav */}
      <CardNav 
        variant="dashboard"
        className="sticky top-0 shadow-[0_4px_30px_rgba(0,0,0,0.6)] z-[100] bg-[#0B0B12] star-grid"
        items={NAV_ITEMS}
        onGetStarted={handleGetStarted}
        baseColor="transparent"
      />

      {/* Hero */}
      <section className="relative px-6 pb-16 pt-[120px]">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#3A3A5A] bg-[#1A1A2E] px-4 py-2 text-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[#C9C9D4]">Production-ready design system extractor</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mb-6 text-5xl font-bold leading-[1.12] tracking-tight text-white md:text-7xl"
          >
            Transform any website into a{" "}
            <span className="bg-gradient-to-r from-[#c084fc] via-[#a855f7] to-[#7B3FE4] bg-clip-text text-transparent">
              living design system
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="mb-10 mx-auto max-w-2xl text-lg leading-relaxed text-[#8A8AA3] md:text-xl"
          >
            Paste a URL to extract colors, typography, and spacing tokens. Lock what you love, tweak the rest, and export a production-ready style guide.
          </motion.p>

          {/* URL Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
          >
            <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A5A75]" />
                <input
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(null); }}
                  placeholder="https://example.com"
                  className="w-full rounded-2xl border border-[#2A2A40] bg-[#0F0F1A] py-4 pl-11 pr-4 text-base text-white placeholder:text-[#5A5A75] outline-none transition focus:border-[#934AC5] focus:ring-2 focus:ring-[rgba(147,74,197,0.25)]"
                />
              </label>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#934AC5] to-[#7B3FE4] px-8 py-4 text-base font-semibold text-white shadow-[0_0_32px_rgba(147,74,197,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
                >
                  {error === "INVALID_URL" && "Please enter a valid URL (e.g. https://example.com)"}
                  {error === "BLOCKED" && "This site blocks automated scraping. Try a demo URL below."}
                  {error === "TIMEOUT" && "Request timed out. Try again or use a demo URL."}
                  {error === "NAVIGATION_ERROR" && (errorMessage || "Could not navigate to this site. Try a demo URL.")}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Demo chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-[#5A5A75]">Try a demo:</span>
              {DEMO_SITES.map((site) => (
                <motion.button
                  key={site.url}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setDemoUrl(site.url)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#2A2A40] bg-[#141422] px-4 py-1.5 text-sm text-[#C9C9D4] transition hover:border-[#3A3A5A] hover:text-white"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: site.color }} />
                  {site.label}
                  <span className="text-[#5A5A75]">· {site.desc}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-4 md:grid-cols-4">
            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-dark rounded-2xl border border-[#2A2A40] p-5"
              >
                <p className="mb-3 font-mono text-xs font-bold tracking-widest text-[#934AC5]">{step.num}</p>
                <h3 className="mb-2 text-lg font-bold text-white">{step.label}</h3>
                <p className="text-sm leading-relaxed text-[#8A8AA3]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">Everything in one dashboard</h2>
            <p className="mt-3 text-[#8A8AA3]">A complete design system toolkit, powered by real-world scraping</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="glass-dark group rounded-2xl border border-[#2A2A40] p-5 transition hover:border-[#3A3A5A]"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#934AC5]/20 to-[#7B3FE4]/20 transition group-hover:from-[#934AC5]/35 group-hover:to-[#7B3FE4]/35">
                    <Icon className="h-5 w-5 text-[#c084fc]" />
                  </div>
                  <h3 className="mb-1.5 font-semibold text-white">{feature.label}</h3>
                  <p className="text-sm text-[#8A8AA3]">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1A1A2E] px-6 py-8 text-center text-xs text-[#5A5A75]">
      </footer>
    </main>
  );
}
