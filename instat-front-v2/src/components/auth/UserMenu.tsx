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

export default function UserMenu() {
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
        className={`flex h-11 items-center gap-2.5 border pr-2.5 pl-1 ${
          open ? "border-paddy bg-paddy-soft/50" : "border-rule hover:border-paddy"
        }`}
      >
        <span
          className="flex size-8 items-center justify-center bg-paddy-deep text-[0.95rem] text-white font-semibold"
          aria-hidden="true"
        >
          {initials(user.name)}
        </span>
        <span className="hidden text-left leading-tight whitespace-nowrap 2xl:block">
          <span className="block text-[1rem] font-semibold">{user.name}</span>
          <span className="block text-[0.68rem] text-muted">{roleLabels[user.role]}</span>
        </span>
        <ChevronDown className={`size-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          id="user-menu"
          className="fade-in absolute top-full right-0 z-50 mt-2 w-[min(19rem,calc(100vw-2rem))] border border-line bg-white shadow-[0_20px_44px_-20px_rgba(9,42,31,0.45)]"
        >
          {/* Fiche du compte : qui est connecté, avec quel rôle. */}
          <div className="flex items-center gap-3 border-b border-line px-4 py-4">
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center bg-paddy-deep text-[1.05rem] font-semibold text-white"
            >
              {initials(user.name)}
            </span>
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
