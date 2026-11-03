import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

const primaryClass =
  "group inline-flex h-12 items-center gap-3 bg-white pr-5 pl-6 font-medium text-paddy-deep hover:bg-paddy-soft";

interface PanelProps {
  /** Code d'état affiché en repère (« 403 », « 404 »). */
  code: string;
  title: string;
  children: ReactNode;
  actions: ReactNode;
}

/** Même bandeau que l'accueil : papier millimétré, signet laterite. */
function Panel({ code, title, children, actions }: PanelProps) {
  return (
    <div className="mx-auto max-w-2xl border border-line bg-white">
      <div className="on-dark graph-paper relative flex flex-col bg-paddy-deep px-6 pt-6 pb-8 text-white sm:px-10 sm:pt-8 sm:pb-10">
        <span aria-hidden="true" className="absolute top-0 left-6 h-[3px] w-14 bg-laterite sm:left-10" />
        <p className="running-head">
          <span className="text-white tabular-nums">{code}</span>
          <span>Espace d'administration</span>
        </p>
        <h1 className="mt-10 text-3xl leading-tight font-bold tracking-[-0.01em] sm:text-4xl">
          {title}
        </h1>
        <div className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-white/75">{children}</div>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">{actions}</div>
      </div>
    </div>
  );
}

export function AccessDenied({ roleLabel, homeHref }: { roleLabel: string; homeHref: string }) {
  return (
    <Panel
      code="403"
      title="Accès non autorisé"
      actions={
        <a href={homeHref} className={primaryClass}>
          Retour à mon espace
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </a>
      }
    >
      <p>
        Votre rôle (<span className="text-white">{roleLabel}</span>) ne permet pas d'ouvrir cette page. Si vous pensez en
        avoir besoin, adressez-vous à un super administrateur.
      </p>
    </Panel>
  );
}

export function NotFoundPanel({ homeHref, message }: { homeHref: string; message?: string }) {
  return (
    <Panel
      code="404"
      title="Page introuvable"
      actions={
        <a href={homeHref} className={primaryClass}>
          Retour à mon espace
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </a>
      }
    >
      <p>{message ?? "Cette page n'existe pas ou a été déplacée."}</p>
    </Panel>
  );
}
