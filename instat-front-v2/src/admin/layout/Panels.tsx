import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { roleDescriptions, roleLabels } from "../../data/roles";
import type { Role } from "../../types";

const roles: Role[] = ["super_admin", "admin", "editor"];

const primaryClass =
  "group inline-flex h-12 items-center gap-3 bg-white pr-5 pl-6 font-medium text-paddy-deep hover:bg-paddy-soft";
const secondaryClass =
  "inline-flex items-center gap-2 font-medium text-white underline decoration-white/35 underline-offset-[6px] hover:decoration-white";

interface PanelProps {
  /** Code d'état affiché en repère (« 401 », « 403 », « 404 »). */
  code: string;
  title: string;
  children: ReactNode;
  actions: ReactNode;
  /** Colonne claire à droite, pour un complément d'information. */
  aside?: ReactNode;
}

/** Même bandeau que l'accueil et la fenêtre de connexion : papier millimétré, signet laterite. */
function Panel({ code, title, children, actions, aside }: PanelProps) {
  return (
    <div className={`mx-auto grid border border-line bg-white ${aside ? "max-w-5xl md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]" : "max-w-2xl"}`}>
      <div className="on-dark graph-paper relative flex flex-col bg-paddy-deep px-6 pt-6 pb-8 text-white sm:px-10 sm:pt-8 sm:pb-10">
        <span aria-hidden="true" className="absolute top-0 left-6 h-[3px] w-14 bg-laterite sm:left-10" />
        <p className="running-head">
          <span className="text-white tabular-nums">{code}</span>
          <span>Espace d'administration</span>
        </p>
        <h1 className="mt-10 font-display text-[2.6rem] leading-[1.02] font-normal tracking-[-0.02em] sm:text-[3.4rem]">
          {title}
        </h1>
        <div className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-white/75">{children}</div>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">{actions}</div>
      </div>
      {aside && <div className="px-6 py-8 sm:px-10 sm:py-10">{aside}</div>}
    </div>
  );
}

function BackToSite() {
  return (
    <a href="#accueil" className={secondaryClass}>
      <ArrowLeft className="size-4" aria-hidden="true" />
      Retour au site
    </a>
  );
}

function AllowedRoles() {
  return (
    <>
      <h2 className="flex items-baseline justify-between border-b-2 border-ink pb-2 font-mono text-xs">
        <span>Qui peut se connecter ?</span>
        <span className="text-muted tabular-nums">03</span>
      </h2>
      <ol>
        {roles.map((role, index) => (
          <li key={role} className="flex gap-4 border-b border-line py-4">
            <span className="w-5 shrink-0 pt-1 font-mono text-xs text-laterite tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>
              <span className="block font-display text-xl leading-snug">{roleLabels[role]}</span>
              <span className="mt-0.5 block text-[0.95rem] leading-relaxed text-muted">{roleDescriptions[role]}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-sm leading-relaxed text-muted">
        Les comptes sont créés par un super administrateur. Le rôle vient du compte : il n'y a rien à choisir.
      </p>
    </>
  );
}

export function SignInRequired({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <Panel
      code="401"
      title="Connexion requise"
      aside={<AllowedRoles />}
      actions={
        <>
          <button type="button" onClick={onLoginClick} className={primaryClass}>
            Se connecter
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
          <BackToSite />
        </>
      }
    >
      <p>Cet espace sert à gérer les publications, « Madagascar en chiffres » et les comptes du portail de l'INSTAT.</p>
    </Panel>
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
