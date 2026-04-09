import { create } from "zustand";
import { injectAllTokens, injectTokenValue, tokenKeyToCssVar } from "@/lib/tokens/css-inject";
import type { DesignTokens, TokenState, VersionHistoryEntry } from "@/types/tokens";

type HistoryItem = {
  tokenKey: string;
  valueBefore: string;
  valueAfter: string;
  timestamp: string;
};

interface TokenStore {
  tokens: DesignTokens | null;
  extractedTokens: DesignTokens | null;
  tokenStates: Record<string, TokenState>;
  lockedKeys: Set<string>;
  history: HistoryItem[];
  siteId: string | null;
  isLoading: boolean;
  error: string | null;
  setTokens: (tokens: DesignTokens, siteId: string) => void;
  setHistory: (history: VersionHistoryEntry[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateToken: (key: string, value: string) => void;
  restoreToken: (key: string, value: string) => void;
  lockToken: (key: string) => void;
  unlockToken: (key: string) => void;
  resetToExtracted: (key: string) => void;
  clearAll: () => void;
}

function setDeepTokenValue(tokens: DesignTokens, key: string, value: string): void {
  const [group, token] = key.split(".");
  if (!group || !token) {
    return;
  }
  if (group === "spacing" && token === "unit") {
    const newUnit = Number.parseInt(value, 10) || tokens.spacing.unit;
    tokens.spacing.unit = newUnit;
    // Recompute the spacing scale array when base unit changes
    const multipliers = [1, 2, 3, 4, 6, 8, 12, 16];
    tokens.spacing.scale = multipliers.map(m => newUnit * m);
    return;
  }
  if (group === "typography" && token === "lineHeight") {
    tokens.typography.lineHeight = Number.parseFloat(value) || tokens.typography.lineHeight;
    return;
  }
  if (group in tokens && token in (tokens as unknown as Record<string, Record<string, string>>)[group]) {
    (tokens as unknown as Record<string, Record<string, string>>)[group][token] = value;
  }
}

function getDeepTokenValue(tokens: DesignTokens, key: string): string {
  const [group, token] = key.split(".");
  if (!group || !token) {
    return "";
  }
  const value = (tokens as unknown as Record<string, Record<string, string | number | number[]>>)[group]?.[token];
  return value === undefined ? "" : String(value);
}

export { tokenKeyToCssVar };

export const useTokenStore = create<TokenStore>((set, get) => ({
  tokens: null,
  extractedTokens: null,
  tokenStates: {},
  lockedKeys: new Set<string>(),
  history: [],
  siteId: null,
  isLoading: false,
  error: null,
  setTokens: (tokens, siteId) =>
    set(() => {
      injectAllTokens(tokens);
      return {
        tokens: structuredClone(tokens),
        extractedTokens: structuredClone(tokens),
        siteId,
        tokenStates: {},
        error: null,
      };
    }),
  setHistory: (history) => set({ history }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  updateToken: (key, value) => {
    const state = get();
    if (!state.tokens || state.lockedKeys.has(key)) {
      return;
    }

    const nextTokens = structuredClone(state.tokens);
    setDeepTokenValue(nextTokens, key, value);

    injectTokenValue(key, value);
    
    // If spacing unit changed, re-inject the entire scale
    if (key === "spacing.unit") {
       nextTokens.spacing.scale.forEach((px, i) => {
          injectTokenValue(`spacing.scale.${i}`, String(px));
       });
    }

    set({
      tokens: nextTokens,
      tokenStates: {
        ...state.tokenStates,
        [key]: "computed",
      },
    });
  },
  restoreToken: (key, value) => {
    const state = get();
    if (!state.tokens) return;
    
    // Explicitly unlock the token so restored tokens can be edited freely or re-locked.
    const nextLocked = new Set(state.lockedKeys);
    nextLocked.delete(key);

    const nextTokens = structuredClone(state.tokens);
    setDeepTokenValue(nextTokens, key, value);

    injectTokenValue(key, value);
    
    if (key === "spacing.unit") {
       nextTokens.spacing.scale.forEach((px, i) => {
          injectTokenValue(`spacing.scale.${i}`, String(px));
       });
    }

    set({
      tokens: nextTokens,
      lockedKeys: nextLocked,
      tokenStates: {
        ...state.tokenStates,
        [key]: "computed",
      },
    });
  },
  lockToken: (key) =>
    set((state) => {
      const prevValue = getDeepTokenValue(state.extractedTokens!, key);
      const currentValue = getDeepTokenValue(state.tokens!, key);
      
      return {
        lockedKeys: new Set([...Array.from(state.lockedKeys), key]),
        history: [
          {
            tokenKey: key,
            valueBefore: prevValue,
            valueAfter: currentValue,
            timestamp: new Date().toISOString(),
          },
          ...state.history,
        ],
        tokenStates: {
          ...state.tokenStates,
          [key]: "locked",
        },
      };
    }),
  unlockToken: (key) =>
    set((state) => {
      const next = new Set(state.lockedKeys);
      next.delete(key);
      return {
        lockedKeys: next,
        tokenStates: {
          ...state.tokenStates,
          [key]: "computed",
        },
      };
    }),
  resetToExtracted: (key) => {
    const { extractedTokens, tokens } = get();
    if (!tokens || !extractedTokens) {
      return;
    }
    const original = getDeepTokenValue(extractedTokens, key);
    const next = structuredClone(tokens);
    setDeepTokenValue(next, key, original);
    injectTokenValue(key, original);
    
    if (key === "spacing.unit") {
       next.spacing.scale.forEach((px, i) => {
          injectTokenValue(`spacing.scale.${i}`, String(px));
       });
    }

    set({
      tokens: next,
      tokenStates: {
        ...get().tokenStates,
        [key]: "extracted",
      },
    });
  },
  clearAll: () =>
    set({
      tokens: null,
      extractedTokens: null,
      tokenStates: {},
      lockedKeys: new Set<string>(),
      history: [],
      siteId: null,
      isLoading: false,
      error: null,
    }),
}));
