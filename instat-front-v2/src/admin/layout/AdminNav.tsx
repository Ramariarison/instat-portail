import { LayoutDashboard } from "lucide-react";
import type { Role } from "../../types";
import { can } from "../permissions";
import { adminNav, type AdminRoute } from "../routes";

interface AdminNavProps {
  route: AdminRoute;
  role: Role;
}

/** Menu de l'espace d'administration : seules les sections autorisées pour le rôle sont affichées. */
export default function AdminNav({ route, role }: AdminNavProps) {
  const groups = adminNav
    .map((group) => ({ ...group, items: group.items.filter((item) => can(role, item.resource, "view")) }))
    .filter((group) => group.items.length > 0);

  const home = route.page === "home";

  return (
    <nav aria-label="Administration">
      {/* Tableau de bord : page d'accueil du back-office, pour tous les rôles. */}
      <a
        href="#/admin"
        aria-current={home ? "page" : undefined}
        className={`group mb-7 flex h-11 items-center gap-3 border-y border-l-2 border-y-line px-3 ${
          home ? "border-l-laterite bg-white text-paddy" : "border-l-transparent text-ink hover:bg-white"
        }`}
      >
        <LayoutDashboard
          className={`size-4 shrink-0 ${home ? "text-paddy" : "text-muted group-hover:text-paddy"}`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <span className={`flex-1 text-[1.07rem] leading-tight font-semibold ${home ? "" : "group-hover:text-paddy"}`}>
          Tableau de bord
        </span>
      </a>
      {groups.map((group) => (
        <div key={group.title} className="mb-7 last:mb-0">
          <p className="mb-1 border-b-2 border-ink pb-2 text-xs font-semibold tracking-[0.06em] text-ink uppercase">{group.title}</p>
          <ul>
            {group.items.map(({ label, href, pages, icon: Icon }) => {
              const active = pages.includes(route.page);
              return (
                <li key={href} className="border-b border-line">
                  <a
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`group flex h-11 items-center gap-3 border-l-2 px-3 ${
                      active ? "border-laterite bg-white text-paddy" : "border-transparent text-ink hover:bg-white"
                    }`}
                  >
                    <Icon
                      className={`size-4 shrink-0 ${active ? "text-paddy" : "text-muted group-hover:text-paddy"}`}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span className={`flex-1 text-[1.07rem] leading-tight font-semibold ${active ? "" : "group-hover:text-paddy"}`}>
                      {label}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
