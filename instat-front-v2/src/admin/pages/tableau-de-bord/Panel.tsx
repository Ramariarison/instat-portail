import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Bloc du tableau de bord : carte blanche, en-tête (icône, titre, lien « tout voir » facultatif) puis contenu. */
export default function Panel({
  icon: Icon,
  title,
  action,
  children,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex flex-col border border-line bg-white ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-3.5">
        <h2 className="flex items-center gap-2.5 text-base font-semibold">
          <Icon className="size-4 text-paddy" aria-hidden="true" />
          {title}
        </h2>
        {action}
      </div>
      <div className="flex-1 px-5 py-4">{children}</div>
    </section>
  );
}

export const panelLinkClass = "text-sm font-medium text-paddy hover:underline underline-offset-4";

/** Bloc vide : une icône et une phrase, plutôt qu'une ligne perdue en haut d'une carte. */
export function EmptyState({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-muted">
      <Icon className="size-6 text-rule" aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
