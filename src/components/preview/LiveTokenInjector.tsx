"use client";

import { useEffect } from "react";
import { injectAllTokens } from "@/lib/tokens/css-inject";
import type { DesignTokens } from "@/types/tokens";

interface LiveTokenInjectorProps {
  tokens: DesignTokens | null;
}

export default function LiveTokenInjector({ tokens }: LiveTokenInjectorProps) {
  useEffect(() => {
    if (tokens) {
      injectAllTokens(tokens);
    }
  }, [tokens]);

  return null;
}
