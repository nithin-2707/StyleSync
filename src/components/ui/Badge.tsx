import type { TokenState } from "@/types/tokens";

interface BadgeProps {
  state: TokenState;
}

const styles: Record<TokenState, string> = {
  extracted: "bg-[#202036] text-[#C9C9D4] border border-[#2A2A40]",
  locked: "bg-[rgba(147,74,197,0.16)] text-[#E9D9FF] border border-[rgba(147,74,197,0.3)]",
  computed: "bg-[rgba(192,132,252,0.12)] text-[#F1E4FF] border border-[rgba(192,132,252,0.22)]",
};

export default function Badge({ state }: BadgeProps) {
  return (
    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${styles[state]}`}>
      {state}
    </span>
  );
}
