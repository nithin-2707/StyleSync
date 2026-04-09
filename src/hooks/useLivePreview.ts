"use client";

import { useEffect } from "react";
import { injectAllTokens } from "@/lib/tokens/css-inject";
import type { DesignTokens } from "@/types/tokens";

export function useLivePreview(tokens: DesignTokens | null) {
  useEffect(() => {
    if (!tokens) {
      return;
    }
    injectAllTokens(tokens);
  }, [tokens]);
}
