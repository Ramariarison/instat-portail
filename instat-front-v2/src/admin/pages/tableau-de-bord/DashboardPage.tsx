import type { ReactNode } from "react";
import { ClipboardCheck, CornerUpLeft, FilePen, Globe, History, Inbox, Layers, MapPinned, PenLine, Send, Users } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { roleLabels } from "../../../data/roles";
import { formatNumber } from "../../../lib/format";
import { useAdminData } from "../../data/AdminDataContext";
import type { AdminPublication, PublicationStatus } from "../../data/types";
import { can } from "../../permissions";
import Badge from "../../ui/Badge";
import PageHeader from "../../ui/PageHeader";
import { isReviewer } from "../../workflow";
import AccountsSummary from "./AccountsSummary";
import DataCoverage from "./DataCoverage";
import Panel, { EmptyState, panelLinkClass } from "./Panel";
import PublicationList from "./PublicationList";
import RecentActivity from "./RecentActivity";
import StatTile from "./StatTile";
import ThematiqueCoverage from "./ThematiqueCoverage";
import { type StatsState, useDashboardStats } from "./useDashboardStats";
import { LoadingRegion, Skeleton } from "../../../components/ui/Skeleton";

const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const byDateDesc = (a: AdminPublication, b: AdminPublication) => b.date.localeCompare(a.date);

/** Contenu qui dépend des chiffres du service : chargement, erreur, ou rendu. */
function WithStats({ state, children }: { state: StatsState; children: (stats: Extract<StatsState, { status: "ready" }>["stats"]) => ReactNode }) {
  if (state.status === "loading") {
    return (
      <LoadingRegion label="Chargement des chiffres…" className="space-y-4 py-1">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i}>
            <div className="flex justify-between">
              <Skeleton className={`h-3.5 ${i % 2 ? "w-1/3" : "w-1/2"}`} />
              <Skeleton className="h-3.5 w-8" />
            </div>
            <Skeleton className="mt-2 h-2 w-full" />
          </div>
        ))}
      </LoadingRegion>
    );
  }
  if (state.status === "error") return <p className="text-sm text-muted">{state.message}</p>;
  return <>{children(state.stats)}</>;
}

/**
 * Page d'accueil du back-office, adaptée au rôle :
 * - éditeur : ses publications à corriger, en attente, en brouillon ;
 * - administrateur : la file des publications à valider, l'activité, la couverture des thématiques et des données ;
 * - super administrateur : en plus, l'état des comptes.
 * Quatre chiffres clés en tête, puis les blocs : le travail à faire d'abord, le suivi ensuite.
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const { publications } = useAdminData();
  const stats = useDashboardStats();
  if (!user) return null;

  const reviewer = isReviewer(user.role);
  const mine = publications.items.filter((p) => p.createdBy === user.id);
  const withStatus = (items: AdminPublication[], status: PublicationStatus) =>
    items.filter((p) => p.status === status).sort(byDateDesc);

  const ready = stats.status === "ready" ? stats.stats : null;
  const all = (status: PublicationStatus) => withStatus(publications.items, status);

  const coverage = (
    <Panel icon={Layers} title="Publications en ligne par thématique">
      <WithStats state={stats}>{(s) => <ThematiqueCoverage rows={s.byThematique} byLevel={s.publishedByLevel} />}</WithStats>
    </Panel>
  );

  const activity = (
    <Panel icon={History} title="Activité récente">
      <WithStats state={stats}>{(s) => <RecentActivity items={s.recentActivity} />}</WithStats>
    </Panel>
  );

  return (
    <>
      <PageHeader title={`Bonjour, ${user.name}`} description={`${roleLabels[user.role]} · ${today.format(new Date())}`} />

      <dl className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reviewer ? (
          <>
            <StatTile label="À valider" value={all("submitted").length} icon={ClipboardCheck} href="#/admin/publications" emphasis />
            <StatTile
              label="En ligne"
              value={all("published").length}
              icon={Globe}
              detail={ready ? `dont ${formatNumber(ready.publishedLast30Days)} ces 30 derniers jours` : undefined}
            />
            <StatTile label="Renvoyées" value={all("returned").length} icon={CornerUpLeft} detail="en attente de correction" />
            <StatTile label="Brouillons" value={all("draft").length} icon={FilePen} />
          </>
        ) : (
          <>
            <StatTile label="À corriger" value={withStatus(mine, "returned").length} icon={CornerUpLeft} emphasis />
            <StatTile label="En attente de validation" value={withStatus(mine, "submitted").length} icon={Send} />
            <StatTile label="Mes brouillons" value={withStatus(mine, "draft").length} icon={FilePen} />
            <StatTile label="Mes publications en ligne" value={withStatus(mine, "published").length} icon={Globe} />
          </>
        )}
      </dl>

      {reviewer ? (
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="grid gap-6 lg:col-span-2">
            <Panel
              icon={ClipboardCheck}
              title="À valider"
              action={<a href="#/admin/publications" className={panelLinkClass}>Toutes les publications</a>}
            >
              <PublicationList
                items={all("submitted")}
                empty={<EmptyState icon={Inbox}>Aucune publication en attente de validation.</EmptyState>}
              />
            </Panel>
            {coverage}
          </div>

          <div className="grid gap-6">
            {activity}

            {can(user.role, "figures", "view") && (
              <Panel icon={MapPinned} title="Madagascar en chiffres">
                <DataCoverage />
                <a href="#/admin/chiffres/regions" className={`mt-4 inline-block ${panelLinkClass}`}>
                  Données par régions
                </a>
              </Panel>
            )}

            {can(user.role, "users", "view") && (
              <Panel icon={Users} title="Comptes" action={<a href="#/admin/utilisateurs" className={panelLinkClass}>Gérer</a>}>
                <AccountsSummary />
              </Panel>
            )}
          </div>
        </div>
      ) : (
        // Éditeur : moins de blocs, en deux colonnes égales (son travail en haut, le suivi en dessous).
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Panel icon={CornerUpLeft} title="À corriger">
            <PublicationList
              items={withStatus(mine, "returned")}
              empty={<EmptyState icon={Inbox}>Aucune publication renvoyée : rien à corriger.</EmptyState>}
              detail={(p) =>
                p.returnComment && (
                  <p className="mt-1.5 border-l-[3px] border-laterite pl-3 text-sm whitespace-pre-line text-muted">{p.returnComment}</p>
                )
              }
            />
          </Panel>
          <Panel
            icon={PenLine}
            title="En cours"
            action={<a href="#/admin/publications/nouvelle" className={panelLinkClass}>Rédiger une publication</a>}
          >
            <PublicationList
              items={[...withStatus(mine, "submitted"), ...withStatus(mine, "draft")]}
              empty={<EmptyState icon={FilePen}>Aucun brouillon ni publication en attente.</EmptyState>}
              detail={(p) => (
                <p className="mt-1">
                  {p.status === "submitted" ? <Badge tone="green">En attente de validation</Badge> : <Badge>Brouillon</Badge>}
                </p>
              )}
            />
          </Panel>
          {activity}
          {coverage}
        </div>
      )}
    </>
  );
}
