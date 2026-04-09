"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const steps = [
  { id: 0, label: "Launching headless browser", duration: 1200 },
  { id: 1, label: "Navigating to target URL", duration: 1500 },
  { id: 2, label: "Scanning DOM structure", duration: 1000 },
  { id: 3, label: "Extracting computed styles", duration: 1400 },
  { id: 4, label: "Parsing color palette", duration: 1100 },
  { id: 5, label: "Detecting typography hierarchy", duration: 900 },
  { id: 6, label: "Analyzing spacing rhythm", duration: 800 },
  { id: 7, label: "Normalizing design tokens", duration: 700 },
  { id: 8, label: "Saving to token library", duration: 600 },
];

const nodeVariant = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: [0.15, 0.65, 0.15],
    scale: 1,
    transition: {
      duration: 2.2,
      repeat: Number.POSITIVE_INFINITY,
    },
  },
};

function DomTree() {
  const levelOneX = [80, 200, 320];
  const levelTwoX = [40, 125, 160, 245, 280, 365];

  return (
    <motion.svg width="420" height="200" viewBox="0 0 420 200" initial="hidden" animate="visible">
      {/* Root node */}
      <motion.circle
        cx="210" cy="20" r="12"
        fill="rgba(147,74,197,0.5)"
        variants={nodeVariant}
        transition={{ delay: 0 }}
      />
      {levelOneX.map((x, i) => (
        <g key={`l1-${x}`}>
          <line x1="210" y1="32" x2={x} y2="70" stroke="rgba(147,74,197,0.25)" strokeWidth="1.5" />
          <motion.rect
            x={x - 38} y="70" rx="8" width="76" height="26"
            fill="rgba(147,74,197,0.22)"
            variants={nodeVariant}
            transition={{ delay: 0.2 + i * 0.18 }}
          />
        </g>
      ))}
      {levelTwoX.map((x, i) => {
        const parent = levelOneX[Math.floor(i / 2)] ?? 200;
        return (
          <g key={`l2-${x}`}>
            <line x1={parent} y1="96" x2={x} y2="138" stroke="rgba(147,74,197,0.18)" strokeWidth="1.5" />
            <motion.rect
              x={x - 34} y="138" rx="7" width="68" height="22"
              fill="rgba(192,132,252,0.18)"
              variants={nodeVariant}
              transition={{ delay: 0.55 + i * 0.12 }}
            />
          </g>
        );
      })}
    </motion.svg>
  );
}

export default function AnalyzingPage() {
  const params = useParams<{ siteId: string }>();
  const router = useRouter();
  const siteId = params.siteId;

  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const [url, setUrl] = useState("");

  // Animate steps
  useEffect(() => {
    let stepIdx = 0;
    let total = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const step of steps) {
      const delay = total;
      total += step.duration;
      const timer = setTimeout(() => {
        setCurrentStep(stepIdx);
        stepIdx++;
      }, delay);
      timers.push(timer);
    }

    return () => timers.forEach(clearTimeout);
  }, []);

  // Poll for completion
  useEffect(() => {
    if (!siteId) return;

    let interval: ReturnType<typeof setInterval>;
    let attempts = 0;
    const maxAttempts = 90; // 90 * 2s = 3 minutes

    interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/scrape/status/${siteId}`);
        if (!res.ok) return;

        const data = (await res.json()) as { status: string; url: string };
        setUrl(data.url ?? "");

        if (data.status === "done") {
          clearInterval(interval);
          setDone(true);
          setTimeout(() => router.push(`/dashboard/${siteId}`), 900);
        } else if (data.status === "failed") {
          clearInterval(interval);
          setFailed(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setFailed(true);
        }
      } catch {
        // ignore, keep polling
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [siteId, router]);

  const displaySteps = steps.slice(0, Math.min(currentStep + 1, steps.length));

  return (
    <main className="cosmic-bg min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="glass-dark rounded-3xl border border-[#2A2A40] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#934AC5] to-[#7B3FE4] shadow-[0_0_24px_rgba(147,74,197,0.6)]">
              {done ? (
                <CheckCircle2 className="h-6 w-6 text-white" />
              ) : failed ? (
                <XCircle className="h-6 w-6 text-white" />
              ) : (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {done ? "Extraction Complete" : failed ? "Extraction Failed" : "Analyzing Design Tokens"}
              </h1>
              {url && (
                <p className="mt-0.5 truncate text-sm text-[#8A8AA3]">{url}</p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-8 h-2 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#934AC5] via-[#c084fc] to-[#7B3FE4]"
              animate={{
                width: done ? "100%" : failed ? "100%" : `${(Math.min(currentStep + 1, steps.length) / steps.length) * 100}%`,
                opacity: failed ? 0.4 : 1,
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ background: failed ? "#F43F5E" : undefined }}
            />
          </div>

          {/* DOM Tree visualization */}
          {!done && !failed && (
            <div className="mb-8 flex justify-center">
              <DomTree />
            </div>
          )}

          {done && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center"
            >
              <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
              <p className="text-lg font-semibold text-emerald-300">Design tokens extracted successfully!</p>
              <p className="mt-1 text-sm text-emerald-400/70">Redirecting to your dashboard...</p>
            </motion.div>
          )}

          {failed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center"
            >
              <XCircle className="mx-auto mb-3 h-10 w-10 text-rose-400" />
              <p className="text-lg font-semibold text-rose-300">Extraction encountered an error</p>
              <p className="mt-2 text-sm text-rose-400/70">The site may have blocked automated scraping.</p>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Try another URL
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/${siteId}`)}
                  className="rounded-xl bg-gradient-to-r from-[#934AC5] to-[#7B3FE4] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Open dashboard anyway
                </button>
              </div>
            </motion.div>
          )}

          {/* Steps */}
          <div className="space-y-2">
            <AnimatePresence>
              {displaySteps.map((step, i) => {
                const isLast = i === displaySteps.length - 1;
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: isLast && !done && !failed ? 1 : 0.55, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 ${
                      isLast && !done && !failed
                        ? "border border-[#3A3A5A] bg-[#1A1A2E]"
                        : ""
                    }`}
                  >
                    {isLast && !done && !failed ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#c084fc]" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        isLast && !done && !failed ? "text-white" : "text-[#8A8AA3]"
                      }`}
                    >
                      {step.label}
                    </span>
                    {isLast && !done && !failed && (
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="ml-auto text-xs text-[#8A8AA3]"
                      >
                        processing...
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
