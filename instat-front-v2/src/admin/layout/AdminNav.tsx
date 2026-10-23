import type { Role } from "../../types";
import { can } from "../permissions";
import { adminNav, type AdminRoute } from "../routes";

interface AdminNavProps {
  route: AdminRoute;
  role: Role;
}

/**
 * Menu de l'espace d'administration : seules les sections autorisées pour le rôle sont affichées.
 * Numérotation « 1.3 » identique au repère affiché au-dessus du titre de chaque page.
 */
export default function AdminNav({ route, role }: AdminNavProps) {
  const groups = adminNav
    .map((group) => ({ ...group, items: group.items.filter((item) => can(role, item.resource, "view")) }))
    .filter((group) => group.items.length > 0);

  return (
    <nav aria-label="Administration">
      {groups.map((group, groupIndex) => (
        <div key={group.title} className="mb-7 last:mb-0">
          <p className="mb-1 flex items-baseline gap-2 border-b-2 border-ink pb-2 font-mono text-xs text-ink">
            <span className="text-laterite tabular-nums">{groupIndex + 1}</span>
            {group.title}
          </p>
          <ul>
            {group.items.map(({ label, href, pages, icon: Icon }, itemIndex) => {
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
                    <span
                      className={`w-6 shrink-0 font-mono text-[0.7rem] tabular-nums ${active ? "text-laterite" : "text-muted"}`}
                    >
                      {groupIndex + 1}.{itemIndex + 1}
                    </span>
                    <span className={`flex-1 font-display text-[1.07rem] leading-tight ${active ? "" : "group-hover:text-paddy"}`}>
                      {label}
                    </span>
                    <Icon
                      className={`size-4 shrink-0 ${active ? "text-paddy" : "text-muted/60 group-hover:text-paddy"}`}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
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
