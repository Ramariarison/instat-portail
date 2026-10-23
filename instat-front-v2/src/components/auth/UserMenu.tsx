import { useCallback, useRef, useState } from "react";
import { ArrowRight, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDismiss } from "../../hooks/useDismiss";
import { roleActions, roleLabels } from "../../data/roles";
import { initials } from "../../lib/format";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  if (!user) return null;
  const actions = roleActions[user.role];

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
          className="flex size-8 items-center justify-center bg-paddy-deep font-display text-[0.95rem] text-white"
          aria-hidden="true"
        >
          {initials(user.name)}
        </span>
        <span className="hidden text-left leading-tight whitespace-nowrap 2xl:block">
          <span className="block font-display text-[1rem]">{user.name}</span>
          <span className="block font-mono text-[0.68rem] text-muted">{roleLabels[user.role]}</span>
        </span>
        <ChevronDown className={`size-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          id="user-menu"
          className="fade-in absolute top-full right-0 z-50 mt-2 w-[min(21rem,calc(100vw-2rem))] bg-white shadow-[0_24px_48px_-20px_rgba(9,42,31,0.5)] ring-1 ring-white/30"
        >
          {/* Fiche du compte : même bandeau que la fenêtre de connexion. */}
          <div className="on-dark graph-paper relative bg-paddy-night px-5 pt-5 pb-5 text-white">
            <span aria-hidden="true" className="absolute top-0 left-5 h-[3px] w-12 bg-laterite" />
            <p className="font-mono text-xs text-white/60">Connecté en tant que</p>
            <div className="mt-3 flex items-center gap-3.5">
              <span
                aria-hidden="true"
                className="flex size-12 shrink-0 items-center justify-center border border-white/25 font-display text-xl"
              >
                {initials(user.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-[1.35rem] leading-tight">{user.name}</p>
                <p className="truncate font-mono text-xs text-white/65">{user.email}</p>
              </div>
            </div>
            <p className="mt-4 inline-flex items-center gap-2 border border-white/25 px-2 py-0.5 font-mono text-[0.7rem] text-white/90">
              <span aria-hidden="true" className="size-1.5 bg-laterite" />
              {roleLabels[user.role]}
            </p>
          </div>

          <div className="px-5 pt-4 pb-1">
            <p className="flex items-baseline justify-between border-b-2 border-ink pb-2 font-mono text-xs">
              <span>Raccourcis</span>
              <span className="text-muted tabular-nums">{String(actions.length).padStart(2, "0")}</span>
            </p>
            <ul>
              {actions.map(({ label, href, icon: Icon }, index) => (
                <li key={href} className="border-b border-line last:border-b-0">
                  <a href={href} onClick={close} className="group flex items-center gap-3 py-3">
                    <span className="w-5 shrink-0 font-mono text-xs text-laterite tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Icon className="size-4 shrink-0 text-paddy/70 group-hover:text-paddy" strokeWidth={1.5} aria-hidden="true" />
                    <span className="flex-1 font-display text-[1.05rem] leading-snug group-hover:text-paddy">{label}</span>
                    <ArrowRight
                      className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-paddy"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-line bg-paper px-5 py-2">
            <button
              type="button"
              onClick={() => {
                logout();
                close();
              }}
              className="group flex h-10 w-full items-center gap-3 text-left text-[0.95rem] text-laterite"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="underline decoration-laterite/0 underline-offset-4 group-hover:decoration-laterite/60">
                Se déconnecter
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
