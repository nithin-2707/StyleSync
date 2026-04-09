"use client";

import { useMutation } from "@tanstack/react-query";

interface ScrapePayload {
  url: string;
  sessionId: string;
}

export function useScrape() {
  return useMutation({
    mutationFn: async (payload: ScrapePayload) => {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to queue scrape job");
      }
      return response.json() as Promise<{ siteId: string; jobId: string; status: string }>;
    },
  });
}
