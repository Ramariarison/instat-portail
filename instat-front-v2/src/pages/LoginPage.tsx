import { useEffect, useState } from "react";
import { ArrowLeft, ChartColumn, Clock, FileText, Users, type LucideIcon } from "lucide-react";
import logoInstat from "../assets/logo-instat.png";
import DemoAccounts from "../components/auth/DemoAccounts";
import LoginForm, { type Credentials } from "../components/auth/LoginForm";
import MadagascarMap from "../components/auth/MadagascarMap";
import { SHOW_DEMO_ACCOUNTS } from "../config";
import { useAuth } from "../context/AuthContext";
import { useHashQuery } from "../lib/route";

/** Ce que permet l'espace de gestion, rappelé dans le panneau de gauche. */
const features: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: FileText, title: "Publications", text: "Rédaction, validation et mise en ligne" },
  { icon: ChartColumn, title: "Madagascar en chiffres", text: "Indicateurs et données par région" },
  { icon: Users, title: "Comptes et rôles", text: "Accès des agents selon leur rôle" },
];

/** Où aller après la connexion : une page du back-office seulement (« retour » vient de l'adresse). */
function destination(returnTo: string | null): string {
  return returnTo?.startsWith("#/admin") ? returnTo : "#/admin";
}

/**
 * Page de connexion (#/connexion), à part du site public, comme dans la plupart des applications :
 * un panneau aux couleurs du portail à gauche (grands écrans), le formulaire seul à droite.
 * Paramètres : `retour` (page du back-office à rouvrir), `expiree` (la session a expiré).
 */
export default function LoginPage() {
  const { user } = useAuth();
  const [query] = useHashQuery();
  const target = destination(query.get("retour"));
  const expired = query.get("expiree") === "1";
  const [prefill, setPrefill] = useState<Credentials>();

  useEffect(() => {
    const previous = document.title;
    document.title = "Connexion – INSTAT Madagascar";
    return () => {
      document.title = previous;
    };
  }, []);

  // Déjà connecté (ou tout juste connecté) : direction le back-office, sans laisser la page dans l'historique.
  useEffect(() => {
    if (user) window.location.replace(target);
  }, [user, target]);

  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="on-dark relative hidden overflow-hidden bg-paddy-deep text-white lg:flex lg:flex-col">
        {/* Fond : carte de Madagascar en trame de points, éclairée par un dégradé discret. */}
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_45%,rgb(255_255_255/0.08),transparent_60%)]" />
        <MadagascarMap className="absolute top-1/2 right-[-1.5rem] h-[84%] max-h-[46rem] -translate-y-1/2" />
        {/* Fondu vers la gauche : le texte reste lisible par-dessus la carte. */}
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-paddy-deep via-paddy-deep/85 to-transparent" />

        <div className="relative flex flex-1 flex-col px-12 py-14 xl:px-16">
          <p className="text-sm font-medium text-white/70">Institut national de la statistique · Madagascar</p>
          <h2 className="mt-6 max-w-sm text-4xl leading-tight font-bold tracking-[-0.01em]">Espace de gestion du portail</h2>
          <p className="mt-4 max-w-sm text-lg leading-relaxed text-white/75">
            Préparer, valider et mettre en ligne les données officielles de Madagascar.
          </p>

          <ul className="mt-auto max-w-xs space-y-4 pt-12">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center bg-white/10 ring-1 ring-white/15">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-white/65">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between gap-4">
          <a href="#accueil" aria-label="INSTAT Madagascar, retour au site" className="shrink-0">
            <img src={logoInstat} alt="" className="h-14 w-auto" />
          </a>
          <a href="#accueil" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-paddy">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Retour au site
          </a>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-bold tracking-[-0.01em]">Connexion</h1>
          <p className="mt-2 text-muted">Réservé aux agents de l'INSTAT habilités à gérer le portail.</p>

          {expired && (
            <p role="status" className="mt-6 flex gap-2.5 border-l-[3px] border-paddy bg-paddy-soft/70 px-3 py-2.5 text-sm leading-relaxed">
              <Clock className="mt-0.5 size-4 shrink-0 text-paddy" aria-hidden="true" />
              Votre session a expiré. Reconnectez-vous pour reprendre où vous en étiez.
            </p>
          )}

          <div className="mt-8">
            <LoginForm prefill={prefill} onSuccess={() => window.location.replace(target)} />
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted">
            Pas de compte ? Les accès sont créés par un super administrateur de l'INSTAT.
          </p>

          {SHOW_DEMO_ACCOUNTS && (
            <div className="mt-8">
              <DemoAccounts selected={prefill?.email} onPick={setPrefill} />
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted">© Institut national de la statistique de Madagascar</p>
      </main>
    </div>
  );
}
