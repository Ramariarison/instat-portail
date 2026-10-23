import { ExternalLink, LogIn } from "lucide-react";
import logoInstat from "../../assets/logo-instat.png";
import UserMenu from "../../components/auth/UserMenu";
import { useAuth } from "../../context/AuthContext";
import Button, { buttonClass } from "../ui/Button";

export default function AdminHeader({ onLoginClick }: { onLoginClick: () => void }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white shadow-[inset_0_3px_0_var(--color-paddy-deep)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <a href="#/admin" aria-label="Espace d'administration, accueil" className="shrink-0 rounded-md">
            <img src={logoInstat} alt="" className="h-12 w-auto" />
          </a>
          <div className="hidden border-l border-line pl-4 sm:block">
            <p className="font-display text-lg leading-tight">Espace d'administration</p>
            <p className="font-mono text-[0.7rem] text-muted">Portail INSTAT Madagascar</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a href="#accueil" className={buttonClass("secondary")}>
            <ExternalLink className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Voir le site</span>
            <span className="sr-only sm:hidden">Voir le site</span>
          </a>
          {user ? (
            <UserMenu />
          ) : (
            <Button variant="primary" onClick={onLoginClick}>
              <LogIn className="size-4" aria-hidden="true" />
              Connexion
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
