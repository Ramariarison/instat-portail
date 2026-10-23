import type { ReactNode } from "react";

interface SectionHeadProps {
  /** Numéro de section, affiché comme l'intitulé d'un tableau (« 01 »). */
  number: string;
  /** Libellé court du repère, au-dessus du titre. */
  kicker: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function SectionHead({ number, kicker, title, description, action }: SectionHeadProps) {
  return (
    <header>
      <p className="running-head">
        <span className="font-medium text-laterite">{number}</span>
        <span>{kicker}</span>
      </p>
      <div className="mt-5 grid gap-x-12 gap-y-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <h2 className="font-display text-[2rem] leading-[1.1] font-medium tracking-[-0.01em] sm:text-[2.6rem]">{title}</h2>
          {description && <p className="mt-3 max-w-xl text-[1.05rem] leading-relaxed text-muted">{description}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}

/** Lien de renvoi en fin d'en-tête de section (« Toutes les publications → »). */
export const sectionLinkClass =
  "group inline-flex w-fit items-center gap-2 self-end border-b border-paddy/30 pb-0.5 font-medium text-paddy hover:border-paddy";

/** Ligne d'état d'une section (chargement, données indisponibles), annoncée aux lecteurs d'écran. */
export function StatusLine({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p role="status" className={`py-8 font-mono text-sm text-muted ${className}`}>
      {children}
    </p>
  );
}
