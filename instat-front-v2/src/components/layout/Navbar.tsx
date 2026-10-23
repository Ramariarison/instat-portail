import { useCallback, useRef, useState } from "react";
import { ChevronDown, LogIn, Menu, X } from "lucide-react";
import { mainNav } from "../../data/navigation";
import { useAuth } from "../../context/AuthContext";
import { useDismiss } from "../../hooks/useDismiss";
import UserMenu from "../auth/UserMenu";
import logoInstat from "../../assets/logo-instat.png";

interface NavbarProps {
  onLoginClick: () => void;
}

// Survol et menu ouvert : un filet laterite sous l'intitulé plutôt qu'un fond coloré.
const linkClass =
  "relative inline-flex h-10 items-center whitespace-nowrap px-3 text-[0.95rem] font-medium text-ink after:absolute after:inset-x-3 after:bottom-1 after:h-[2px] after:scale-x-0 after:bg-laterite after:transition-transform hover:text-paddy hover:after:scale-x-100";

export default function Navbar({ onLoginClick }: NavbarProps) {
  const { user } = useAuth();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setOpenMenu(null), []);
  useDismiss(containerRef, openMenu !== null, closeMenu);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div
        ref={containerRef}
        className="relative mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <a href="#accueil" aria-label="INSTAT Madagascar, retour à l'accueil" className="shrink-0 rounded-md">
          <img src={logoInstat} alt="" className="h-16 w-auto" />
        </a>

        <nav aria-label="Navigation principale" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item, index) => {
              if (!item.groups) {
                return (
                  <li key={item.label}>
                    <a href={item.href} className={linkClass}>
                      {item.label}
                    </a>
                  </li>
                );
              }

              const isOpen = openMenu === item.label;
              const panelId = `menu-${index}`;
              return (
                <li key={item.label} className={item.wide ? "static" : "relative"}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenMenu(isOpen ? null : item.label)}
                    className={`${linkClass} gap-1.5 ${isOpen ? "text-paddy after:scale-x-100" : ""}`}
                  >
                    {item.label}
                    <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                  </button>

                  {isOpen && (
                    <div
                      id={panelId}
                      className={
                        item.wide
                          ? "absolute inset-x-0 top-full grid gap-10 border border-t-2 border-line border-t-ink bg-white p-8 shadow-[0_16px_24px_-16px_rgba(16,35,27,0.3)] lg:grid-cols-3"
                          : "absolute left-0 top-full w-80 border border-t-2 border-line border-t-ink bg-white p-3 shadow-[0_16px_24px_-16px_rgba(16,35,27,0.3)]"
                      }
                    >
                      {item.groups.map((group, groupIndex) => (
                        <div key={group.title ?? groupIndex}>
                          {group.title && (
                            <p className="mb-3 flex items-baseline gap-2 border-b border-line pb-2 font-mono text-xs text-muted">
                              <span className="text-laterite">{String(groupIndex + 1).padStart(2, "0")}</span>
                              {group.title}
                            </p>
                          )}
                          <ul className="space-y-0.5">
                            {group.links.map((link) => (
                              <li key={link.href}>
                                <a
                                  href={link.href}
                                  onClick={closeMenu}
                                  className="block px-2 py-1.5 text-[0.95rem] text-ink hover:bg-paddy-soft hover:text-paddy"
                                >
                                  {link.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <UserMenu />
          ) : (
            <button
              type="button"
              onClick={onLoginClick}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-paddy px-4 text-[0.95rem] font-medium text-white hover:bg-paddy-deep"
            >
              <LogIn className="size-4" aria-hidden="true" />
              Connexion
            </button>
          )}
          <button
            type="button"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex size-10 items-center justify-center rounded-md hover:bg-paddy-soft xl:hidden"
          >
            {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="mobile-menu" aria-label="Navigation mobile" className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-line bg-white xl:hidden">
          <ul className="mx-auto max-w-7xl px-4 sm:px-6">
            {mainNav.map((item) =>
              item.groups ? (
                <li key={item.label} className="border-b border-line">
                  <details className="group">
                    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-medium [&::-webkit-details-marker]:hidden">
                      {item.label}
                      <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="space-y-4 pb-4">
                      {item.groups.map((group, groupIndex) => (
                        <div key={group.title ?? groupIndex}>
                          {group.title && <p className="mb-1 font-mono text-xs text-muted">{group.title}</p>}
                          <ul>
                            {group.links.map((link) => (
                              <li key={link.href}>
                                <a href={link.href} onClick={() => setMobileOpen(false)} className="block py-2 text-muted hover:text-paddy">
                                  {link.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </details>
                </li>
              ) : (
                <li key={item.label} className="border-b border-line">
                  <a href={item.href} onClick={() => setMobileOpen(false)} className="flex min-h-12 items-center font-medium">
                    {item.label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
