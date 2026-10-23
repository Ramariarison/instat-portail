import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import LoginModal from "../components/auth/LoginModal";
import { useAuth } from "../context/AuthContext";
import { roleLabels } from "../data/roles";
import { AdminDataProvider, useAdminData } from "./data/AdminDataContext";
import AdminHeader from "./layout/AdminHeader";
import AdminNav from "./layout/AdminNav";
import { AccessDenied, NotFoundPanel, SignInRequired } from "./layout/Panels";
import { can } from "./permissions";
import { adminNav, matchAdmin, requirement, type AdminRoute } from "./routes";
import Button from "./ui/Button";
import { ToastProvider } from "./ui/Toast";
import { AdminSectionContext, type AdminSection } from "./ui/SectionContext";
import FiguresPage from "./pages/chiffres/FiguresPage";
import FigureRegionPage from "./pages/chiffres/FigureRegionPage";
import IndicateursPage from "./pages/chiffres/IndicateursPage";
import TypesPage from "./pages/chiffres/TypesPage";
import PublicationFormPage from "./pages/publications/PublicationFormPage";
import PublicationsPage from "./pages/publications/PublicationsPage";
import RegionsPage from "./pages/publications/RegionsPage";
import ThematiquesPage from "./pages/publications/ThematiquesPage";
import RolesPage from "./pages/utilisateurs/RolesPage";
import UsersPage from "./pages/utilisateurs/UsersPage";
import type { Role } from "../types";

/** Première page que le rôle a le droit de consulter (point d'arrivée de « #/admin »). */
function firstAllowedHref(role: Role): string {
  for (const group of adminNav) {
    for (const item of group.items) {
      if (can(role, item.resource, "view")) return item.href;
    }
  }
  return "#/admin";
}

function renderPage(route: AdminRoute, role: Role): ReactNode {
  switch (route.page) {
    case "thematiques":
      return <ThematiquesPage />;
    case "regions":
      return <RegionsPage />;
    case "publications":
      return <PublicationsPage />;
    case "publication-form":
      return <PublicationFormPage id={route.id} />;
    case "types":
      return <TypesPage />;
    case "indicateurs":
      return <IndicateursPage />;
    case "figures":
      return <FiguresPage />;
    case "figure-region":
      return <FigureRegionPage id={route.id} edit={route.edit} />;
    case "users":
      return <UsersPage />;
    case "roles":
      return <RolesPage />;
    default:
      return <NotFoundPanel homeHref={firstAllowedHref(role)} />;
  }
}

/** Rubrique de la page, numérotée comme dans le menu visible pour ce rôle (« 1.3 »). */
function sectionOf(route: AdminRoute, role: Role): AdminSection | null {
  const groups = adminNav
    .map((group) => ({ ...group, items: group.items.filter((item) => can(role, item.resource, "view")) }))
    .filter((group) => group.items.length > 0);
  for (const [groupIndex, group] of groups.entries()) {
    const itemIndex = group.items.findIndex((item) => item.pages.includes(route.page));
    if (itemIndex >= 0) return { number: `${groupIndex + 1}.${itemIndex + 1}`, group: group.title };
  }
  return null;
}

/** Chargement des données du back-office, ou erreur avec possibilité de réessayer. */
function DataStatus() {
  const { state, reload } = useAdminData();
  if (state.status === "loading") {
    return (
      <p role="status" className="border-t-2 border-ink py-8 font-mono text-sm text-muted">
        Chargement des données…
      </p>
    );
  }
  if (state.status === "error") {
    return (
      <div role="alert" className="border-t-2 border-ink py-8">
        <p className="text-[0.95rem]">Les données du back-office n'ont pas pu être chargées.</p>
        <p className="mt-1 text-sm text-muted">{state.message}</p>
        <Button variant="secondary" className="mt-4" onClick={reload}>
          Réessayer
        </Button>
      </div>
    );
  }
  return null;
}

function Shell({ route, role }: { route: AdminRoute; role: Role }) {
  const { state } = useAdminData();
  const required = requirement(route);
  const homeHref = firstAllowedHref(role);

  // « #/admin » seul : on arrive directement sur la première section autorisée.
  useEffect(() => {
    if (route.page === "home") window.location.replace(homeHref);
  }, [route.page, homeHref]);

  const currentLabel =
    adminNav.flatMap((group) => group.items).find((item) => item.pages.includes(route.page))?.label ?? "Menu";

  const allowed = required === null || can(role, required.resource, required.action);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:py-10">
      <aside>
        {/* Mobile : menu repliable. La clé le referme à chaque changement de page. */}
        <details
          key={JSON.stringify(route)}
          className="group mb-6 border border-t-2 border-line border-t-ink bg-white lg:hidden"
        >
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 [&::-webkit-details-marker]:hidden">
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-xs text-muted">Menu</span>
              <span className="font-display text-[1.07rem]">{currentLabel}</span>
            </span>
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="border-t border-line p-3">
            <AdminNav route={route} role={role} />
          </div>
        </details>

        <div className="hidden lg:sticky lg:top-24 lg:block">
          <AdminNav route={route} role={role} />
        </div>
      </aside>

      <main id="admin-contenu" className="min-w-0">
        {route.page === "home" ? null : state.status !== "ready" ? (
          <DataStatus />
        ) : allowed ? (
          <AdminSectionContext.Provider value={sectionOf(route, role)}>{renderPage(route, role)}</AdminSectionContext.Provider>
        ) : (
          <AccessDenied roleLabel={roleLabels[role]} homeHref={homeHref} />
        )}
      </main>
    </div>
  );
}

export default function AdminApp({ segments }: { segments: string[] }) {
  const { user, ready } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const route = matchAdmin(segments.slice(1));
  const routeKey = JSON.stringify(route);

  useEffect(() => {
    const previous = document.title;
    document.title = "Administration – INSTAT Madagascar";
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [routeKey]);

  return (
    <AdminDataProvider>
      <ToastProvider>
        <AdminHeader onLoginClick={() => setLoginOpen(true)} />
        {user ? (
          <Shell route={route} role={user.role} />
        ) : !ready ? (
          <main className="px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
            <p role="status" className="mx-auto max-w-2xl font-mono text-sm text-muted">
              Vérification de la session…
            </p>
          </main>
        ) : (
          <main className="px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
            <SignInRequired onLoginClick={() => setLoginOpen(true)} />
          </main>
        )}
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </ToastProvider>
    </AdminDataProvider>
  );
}
