import type { ReactNode } from "react";
import { useAuth } from "../../../context/AuthContext";
import { roleLabels } from "../../../data/roles";
import { formatNumber } from "../../../lib/format";
import { useAdminData } from "../../data/AdminDataContext";
import type { AdminPublication, PublicationStatus } from "../../data/types";
import { can } from "../../permissions";
import PageHeader from "../../ui/PageHeader";
import { isReviewer } from "../../workflow";
import AccountsSummary from "./AccountsSummary";
import DataCoverage from "./DataCoverage";
import Panel, { panelLinkClass } from "./Panel";
import PublicationList from "./PublicationList";
import RecentActivity from "./RecentActivity";
import StatTile from "./StatTile";
import ThematiqueCoverage from "./ThematiqueCoverage";
import { type StatsState, useDashboardStats } from "./useDashboardStats";

const byDateDesc = (a: AdminPublication, b: AdminPublication) => b.date.localeCompare(a.date);

/** Contenu qui dépend des chiffres du service : chargement, erreur, ou rendu. */
function WithStats({ state, children }: { state: StatsState; children: (stats: Extract<StatsState, { status: "ready" }>["stats"]) => ReactNode }) {
  if (state.status === "loading") return <p className="text-sm text-muted">Chargement…</p>;
  if (state.status === "error") return <p className="text-sm text-muted">{state.message}</p>;
  return <>{children(state.stats)}</>;
}

/**
 * Page d'accueil du back-office, adaptée au rôle :
 * - éditeur : ses publications à corriger, en attente, en brouillon ;
 * - administrateur : la file des publications à valider, l'activité, la couverture des thématiques et des données ;
 * - super administrateur : en plus, l'état des comptes.
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

  // Numérotation des blocs dans l'ordre d'affichage, comme les tableaux d'un annuaire.
  let block = 0;
  const next = () => String(++block).padStart(2, "0");

  const ready = stats.status === "ready" ? stats.stats : null;
  const all = (status: PublicationStatus) => withStatus(publications.items, status);

  return (
    <>
      <PageHeader title="Tableau de bord" description={`Bonjour ${user.name} · ${roleLabels[user.role]}`} />

      <dl className="mb-8 grid border-t-2 border-b border-ink border-b-line sm:grid-cols-2 lg:grid-cols-4">
        {reviewer ? (
          <>
            <StatTile label="À valider" value={all("submitted").length} href="#/admin/publications" emphasis />
            <StatTile
              label="En ligne"
              value={all("published").length}
              detail={ready ? `dont ${formatNumber(ready.publishedLast30Days)} ces 30 derniers jours` : undefined}
            />
            <StatTile label="Renvoyées pour correction" value={all("returned").length} />
            <StatTile label="Brouillons" value={all("draft").length} />
          </>
        ) : (
          <>
            <StatTile label="À corriger" value={withStatus(mine, "returned").length} emphasis />
            <StatTile label="En attente de validation" value={withStatus(mine, "submitted").length} />
            <StatTile label="Mes brouillons" value={withStatus(mine, "draft").length} />
            <StatTile label="Mes publications en ligne" value={withStatus(mine, "published").length} />
          </>
        )}
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        {reviewer ? (
          <Panel
            number={next()}
            title="À valider"
            action={<a href="#/admin/publications" className={panelLinkClass}>Toutes les publications</a>}
          >
            <PublicationList items={all("submitted")} empty="Aucune publication en attente de validation." />
          </Panel>
        ) : (
          <>
            <Panel number={next()} title="À corriger">
              <PublicationList
                items={withStatus(mine, "returned")}
                empty="Aucune publication renvoyée : rien à corriger."
                detail={(p) =>
                  p.returnComment && (
                    <p className="mt-1 border-l-[3px] border-laterite pl-3 text-sm whitespace-pre-line text-muted">{p.returnComment}</p>
                  )
                }
              />
            </Panel>
            <Panel
              number={next()}
              title="En cours"
              action={<a href="#/admin/publications/nouvelle" className={panelLinkClass}>Rédiger une publication</a>}
            >
              <PublicationList
                items={[...withStatus(mine, "submitted"), ...withStatus(mine, "draft")]}
                empty="Aucun brouillon ni publication en attente."
                detail={(p) => (
                  <p className="font-mono text-xs text-muted">{p.status === "submitted" ? "En attente de validation" : "Brouillon"}</p>
                )}
              />
            </Panel>
          </>
        )}

        <Panel number={next()} title="Activité récente">
          <WithStats state={stats}>{(s) => <RecentActivity items={s.recentActivity} />}</WithStats>
        </Panel>

        <Panel
          number={next()}
          title="Publications en ligne par thématique"
          action={
            ready && (
              <span className="font-mono text-xs text-muted">
                National {formatNumber(ready.publishedByLevel.national)} · Régional {formatNumber(ready.publishedByLevel.regional)}
              </span>
            )
          }
          className={reviewer ? "" : "lg:col-span-2"}
        >
          <WithStats state={stats}>{(s) => <ThematiqueCoverage rows={s.byThematique} />}</WithStats>
        </Panel>

        {reviewer && can(user.role, "figures", "view") && (
          <Panel
            number={next()}
            title="Madagascar en chiffres"
            action={<a href="#/admin/chiffres/regions" className={panelLinkClass}>Données par régions</a>}
          >
            <DataCoverage />
          </Panel>
        )}

        {can(user.role, "users", "view") && (
          <Panel
            number={next()}
            title="Comptes"
            action={<a href="#/admin/utilisateurs" className={panelLinkClass}>Gérer les comptes</a>}
          >
            <AccountsSummary />
          </Panel>
        )}
      </div>
    </>
  );
}
