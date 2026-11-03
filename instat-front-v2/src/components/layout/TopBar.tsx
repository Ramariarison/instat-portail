import { LockKeyhole } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { quickLinks } from "../../data/navigation";

export default function TopBar() {
  const { user } = useAuth();

  return (
    <div className="on-dark bg-paddy-night text-[0.8rem] text-white">
      <nav
        aria-label="Liens rapides"
        className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-2 whitespace-nowrap sm:px-6 lg:justify-end lg:px-8"
      >
        {quickLinks.map((link) => (
          <a key={link.href} href={link.href} className="text-white/80 hover:text-white hover:underline">
            {link.label}
          </a>
        ))}
        {/* Accès discret des agents : les visiteurs n'ont pas de compte. */}
        <a
          href={user ? "#/admin" : "#/connexion"}
          className="inline-flex items-center gap-1.5 border-l border-white/20 pl-6 text-white/80 hover:text-white hover:underline"
        >
          <LockKeyhole className="size-3.5" aria-hidden="true" />
          {user ? "Espace de gestion" : "Espace agents"}
        </a>
      </nav>
    </div>
  );
}
