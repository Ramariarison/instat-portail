import type { ReactNode } from "react";
import { BlockTitle } from "../../ui/PageHeader";

/** Bloc du tableau de bord : filet noir en tête, titre numéroté, lien « tout voir » facultatif. */
export default function Panel({
  number,
  title,
  action,
  children,
  className = "",
}: {
  number: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex flex-col border border-t-2 border-line border-t-ink bg-white p-5 sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <BlockTitle number={number}>{title}</BlockTitle>
        {action}
      </div>
      <div className="mt-4 flex-1 border-t border-line pt-4">{children}</div>
    </section>
  );
}

export const panelLinkClass = "font-mono text-xs text-paddy underline decoration-paddy/30 underline-offset-4 hover:decoration-paddy";
