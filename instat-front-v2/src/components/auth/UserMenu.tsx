import { useCallback, useRef, useState } from "react";
import { ChevronDown, LogOut, UserRound, type LucideIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDismiss } from "../../hooks/useDismiss";
import { roleActions, roleLabels } from "../../data/roles";
import { initials } from "../../lib/format";

/** Page du back-office ouverte : le raccourci correspondant est mis en évidence. */
function isCurrent(href: string): boolean {
  const hash = window.location.hash.split("?")[0]!;
  return href === "#/admin" ? hash === "#/admin" || hash === "#/admin/" : hash === href || hash.startsWith(`${href}/`);
}

function MenuLink({ label, href, icon: Icon, onSelect }: { label: string; href: string; icon: LucideIcon; onSelect: () => void }) {
  const current = isCurrent(href);
  return (
    <a
      href={href}
      onClick={onSelect}
      aria-current={current ? "page" : undefined}
      className={`flex h-10 items-center gap-3 rounded-md px-3 text-[0.95rem] ${
        current ? "bg-paddy-soft font-semibold text-paddy-deep" : "text-ink hover:bg-paper"
      }`}
    >
      <Icon className={`size-4 shrink-0 ${current ? "text-paddy" : "text-muted"}`} strokeWidth={1.75} aria-hidden="true" />
      {label}
    </a>
  );
}

/** Initiales dans un rond vert, avec la pastille « connecté ». */
function Avatar({ name, size }: { name: string; size: "sm" | "lg" }) {
  return (
    <span aria-hidden="true" className="relative shrink-0">
      <span
        className={`flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-paddy),var(--color-paddy-deep))] font-semibold text-white shadow-[0_0_0_2px_#fff,0_0_0_3px_rgb(20_87_63/0.25)] ${
          size === "sm" ? "size-9 text-[0.8rem]" : "size-11 text-[0.95rem]"
        }`}
      >
        {initials(name)}
      </span>
      <span
        className={`absolute right-0 bottom-0 rounded-full bg-[#3fae74] ring-2 ring-white ${size === "sm" ? "size-2.5" : "size-3"}`}
      />
    </span>
  );
}

/**
 * Menu du compte connecté. `nameFrom` : à partir de quelle largeur le nom et le rôle s'affichent à côté de l'avatar
 * (le back-office a la place tout de suite, la barre du site public seulement sur très grand écran).
 */
export default function UserMenu({ nameFrom = "sm" }: { nameFrom?: "sm" | "2xl" }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="user-menu"
        aria-label={`Compte de ${user.name}, ${roleLabels[user.role]}`}
        onClick={() => setOpen((value) => !value)}
        className={`group flex h-12 items-center gap-3 rounded-full border py-1 pr-3 pl-1 transition-colors ${
          open ? "border-line bg-paper" : "border-transparent hover:border-line hover:bg-paper"
        }`}
      >
        <Avatar name={user.name} size="sm" />
        <span className={`hidden max-w-[11rem] text-left leading-tight ${nameFrom === "sm" ? "sm:block" : "2xl:block"}`}>
          <span className="block truncate text-[0.95rem] font-semibold">{user.name}</span>
          <span className="block truncate text-[0.72rem] text-muted">{roleLabels[user.role]}</span>
        </span>
        <ChevronDown
          className={`size-4 text-muted transition-transform group-hover:text-ink ${open ? "rotate-180 text-ink" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id="user-menu"
          className="fade-in absolute top-full right-0 z-50 mt-2 w-[min(19rem,calc(100vw-2rem))] border border-line bg-white shadow-[0_20px_44px_-20px_rgba(9,42,31,0.45)]"
        >
          {/* Fiche du compte : qui est connecté, avec quel rôle. */}
          <div className="flex items-center gap-3 border-b border-line px-4 py-4">
            <Avatar name={user.name} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-semibold leading-tight">{user.name}</p>
              <p className="truncate text-sm text-muted">{user.email}</p>
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-paddy">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-laterite" />
                {roleLabels[user.role]}
              </p>
            </div>
          </div>

          <nav aria-label="Espace de gestion" className="p-2">
            <p className="px-3 pt-1 pb-1.5 text-xs text-muted">Espace de gestion</p>
            {roleActions[user.role].map((action) => (
              <MenuLink key={action.href} {...action} onSelect={close} />
            ))}
          </nav>

          <div className="border-t border-line p-2">
            <MenuLink label="Mon compte" href="#/admin/compte" icon={UserRound} onSelect={close} />
            <button
              type="button"
              onClick={() => {
                logout();
                close();
              }}
              className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-[0.95rem] text-laterite hover:bg-laterite/5"
            >
              <LogOut className="size-4" strokeWidth={1.75} aria-hidden="true" />
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
