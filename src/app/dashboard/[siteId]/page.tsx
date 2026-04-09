"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import NavRail from "@/components/layout/NavRail";
import Sidebar from "@/components/layout/Sidebar";
import ThreePanel from "@/components/layout/ThreePanel";
import TokenEditorPanel from "@/components/token-editor/TokenEditorPanel";
import HistoryPanel from "@/components/token-editor/HistoryPanel";
import PreviewGrid from "@/components/preview/PreviewGrid";
import ExportPanel from "@/components/export/ExportPanel";
import LiveTokenInjector from "@/components/preview/LiveTokenInjector";
import DashboardLoading from "@/components/loading/DashboardLoading";
import { useTokenStore } from "@/store/tokens";
import type { VersionHistoryEntry } from "@/types/tokens";

type NavId = "colors" | "typography" | "spacing" | "shadows" | "radii" | "preview" | "history" | "export";

export default function DashboardPage() {
  const params = useParams<{ siteId: string }>();
  const router = useRouter();
  const siteId = params.siteId;
  const [url, setUrl] = useState("Loading...");
  const [status, setStatus] = useState("pending");
  const [isHydrating, setIsHydrating] = useState(true);
  const [flashTokenKey, setFlashTokenKey] = useState<string | null>(null);
  const [activeNavId, setActiveNavId] = useState<NavId>("colors");

  const tokens = useTokenStore((state) => state.tokens);
  const setTokens = useTokenStore((state) => state.setTokens);

  const lockToken = useTokenStore((state) => state.lockToken);
  const history = useTokenStore((state) => state.history);
  const setHistory = useTokenStore((state) => state.setHistory);

  // Map nav ID to editor tab
  const resolveEditorTab = (navId: NavId): string => {
    const map: Record<NavId, string> = {
      colors: "colors",
      typography: "typography",
      spacing: "spacing",
      shadows: "shadows",
      radii: "radii",
      preview: "colors",
      history: "colors",
      export: "colors",
    };
    return map[navId] ?? "colors";
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setIsHydrating(true);

      const [tokenResponse, historyResponse] = await Promise.all([
        fetch(`/api/tokens/${siteId}`),
        fetch(`/api/tokens/history/${siteId}`),
      ]);

      if (!mounted) return;

      if (tokenResponse.ok) {
        const body = (await tokenResponse.json()) as {
          url: string;
          status: string;
          tokens: Parameters<typeof setTokens>[0];
          lockedKeys: string[];
        };
        setTokens(body.tokens, siteId);
        setUrl(body.url || `site:${siteId}`);
        setStatus(body.status || "done");
        for (const key of body.lockedKeys) {
          lockToken(key);
        }
      } else {
        // Tokens not found — may still be pending, poll status
        let attempts = 0;
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const statusRes = await fetch(`/api/scrape/status/${siteId}`);
            if (!statusRes.ok) return;
            const data = (await statusRes.json()) as { status: string };

            if (data.status === "done") {
              clearInterval(pollInterval);
              const tr = await fetch(`/api/tokens/${siteId}`);
              if (tr.ok && mounted) {
                const body = (await tr.json()) as {
                  url: string;
                  status: string;
                  tokens: Parameters<typeof setTokens>[0];
                  lockedKeys: string[];
                };
                setTokens(body.tokens, siteId);
                setUrl(body.url || `site:${siteId}`);
                setStatus("done");
              }
            } else if (data.status === "failed" || attempts > 60) {
              clearInterval(pollInterval);
              setStatus("failed");
            }
          } catch { /* ignore */ }
        }, 2000);

        if (!mounted) clearInterval(pollInterval);
      }

      if (historyResponse.ok) {
        const body = (await historyResponse.json()) as { history: VersionHistoryEntry[] };
        if (mounted) setHistory(body.history);
      }

      window.setTimeout(() => {
        if (mounted) setIsHydrating(false);
      }, 450);
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [lockToken, setHistory, setTokens, siteId]);

  const handleExport = useCallback(() => setActiveNavId("export"), []);
  const handleRescrape = useCallback(() => router.push("/"), [router]);
  const handleTabSelect = useCallback((tab: string) => setActiveNavId(tab as NavId), []);

  if (isHydrating) {
    return <DashboardLoading />;
  }

  const handleRestore = (entry: VersionHistoryEntry) => {
    setFlashTokenKey(entry.tokenKey);
    useTokenStore.getState().restoreToken(entry.tokenKey, entry.valueBefore);
    window.setTimeout(() => setFlashTokenKey(null), 900);
  };



  const navRailBlock = (
    <NavRail 
       activeId={activeNavId} 
       onSelect={(id) => setActiveNavId(id as NavId)} 
    />
  );
  
  const sidebarBlock = (
     <Sidebar url={url} history={history} onRestore={handleRestore} />
  );

  return (
    <div className="cosmic-bg min-h-screen text-[var(--cosmic-text)]">
      <TopBar
        url={url}
        status={status}
        onExport={handleExport}
        onRescrape={handleRescrape}
        onTabSelect={handleTabSelect}
      />

      <Suspense fallback={<div className="p-6 text-[#8A8AA3]">Loading dashboard...</div>}>
        {activeNavId === "preview" ? (
           <ThreePanel
             rail={navRailBlock}
             preview={
               <div className="w-full h-full flex justify-center">
                 <PreviewGrid fullscreen />
               </div>
             }
           />
        ) : activeNavId === "history" ? (
           <ThreePanel
             rail={navRailBlock}
             sidebar={sidebarBlock}
             editor={
                <div className="w-full h-[calc(100vh-110px)] overflow-hidden lg:col-span-2">
                  <HistoryPanel history={history} onRestore={handleRestore} />
                </div>
             }
           />
        ) : activeNavId === "export" ? (
           <ThreePanel
             rail={navRailBlock}
             sidebar={sidebarBlock}
             editor={
                <div className="w-full h-full lg:col-span-2">
                  <ExportPanel siteId={siteId} mode="page" />
                </div>
             }
           />
        ) : (
           <ThreePanel
             rail={navRailBlock}
             sidebar={sidebarBlock}
             editor={
               <TokenEditorPanel
                 flashTokenKey={flashTokenKey}
                 activeTab={resolveEditorTab(activeNavId)}
                 onActiveTabChange={(tab) => setActiveNavId(tab as NavId)}
               />
             }
             preview={<PreviewGrid />}
           />
        )}
      </Suspense>

      <LiveTokenInjector tokens={tokens} />
    </div>
  );
}
