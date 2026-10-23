import type { ReactNode } from "react";

const tones = {
  neutral: "border-ink/15 bg-paper text-ink",
  green: "border-paddy/25 bg-paddy-soft text-paddy",
  red: "border-laterite/30 bg-laterite/[0.06] text-laterite",
  outline: "border-rule text-muted",
};

/** Étiquette en police à chasse fixe, comme un code dans un tableau statistique. */
export default function Badge({ tone = "neutral", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center border px-1.5 py-px font-mono text-[0.7rem] whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
}
