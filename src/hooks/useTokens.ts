"use client";

import { useQuery } from "@tanstack/react-query";
import type { DesignTokens } from "@/types/tokens";

export function useTokens(siteId: string) {
  return useQuery({
    queryKey: ["tokens", siteId],
    queryFn: async () => {
      const response = await fetch(`/api/tokens/${siteId}`);
      if (!response.ok) {
        throw new Error("Failed to load tokens");
      }
      return response.json() as Promise<{ tokens: DesignTokens; lockedKeys: string[] }>;
    },
    enabled: Boolean(siteId),
  });
}
