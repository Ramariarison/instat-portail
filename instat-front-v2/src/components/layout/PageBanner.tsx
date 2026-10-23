import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface PageBannerProps {
  /** Repère au-dessus du titre (« Publications », « Fiche »…). */
  kicker: string;
  title: string;
  description?: ReactNode;
  /** Fil d'Ariane ; « Accueil » est ajouté en tête. */
  crumbs?: Crumb[];
}

/** En-tête des pages intérieures : même bandeau que l'accueil (papier millimétré, signet laterite). */
export default function PageBanner({ kicker, title, description, crumbs = [] }: PageBannerProps) {
  const trail: Crumb[] = [{ label: "Accueil", href: "#accueil" }, ...crumbs];

  return (
    <section className="on-dark graph-paper relative bg-paddy-deep text-white">
      <span aria-hidden="true" className="absolute top-0 left-4 h-[3px] w-14 bg-laterite sm:left-6 lg:left-8" />
      <div className="mx-auto max-w-7xl px-4 pt-7 pb-12 sm:px-6 sm:pb-14 lg:px-8">
        <nav aria-label="Fil d'Ariane">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-xs text-white/65">
            {trail.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                {index > 0 && <ChevronRight className="size-3 shrink-0" aria-hidden="true" />}
                {crumb.href ? (
                  <a href={crumb.href} className="underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white">
                    {crumb.label}
                  </a>
                ) : (
                  <span aria-current="page" className="max-w-[40ch] truncate text-white/85">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <p className="running-head mt-8">
          <span className="text-white">{kicker}</span>
          <span>INSTAT · Madagascar</span>
        </p>
        <h1 className="mt-6 max-w-4xl font-display text-[2.3rem] leading-[1.05] font-normal tracking-[-0.02em] sm:text-[3.2rem]">
          {title}
        </h1>
        {description && <div className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-white/75">{description}</div>}
      </div>
    </section>
  );
}
