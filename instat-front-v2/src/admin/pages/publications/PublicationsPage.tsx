import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { formatDate, matches } from "../../../lib/format";
import { useAdminData } from "../../data/AdminDataContext";
import type { AdminPublication } from "../../data/types";
import { usePermissions } from "../../usePermissions";
import Badge from "../../ui/Badge";
import { buttonClass } from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";
import DataTable, { cellTitleClass, RowActions, type Column } from "../../ui/DataTable";
import { filterClass } from "../../ui/inputs";
import PageHeader, { EmptyState } from "../../ui/PageHeader";
import { Pagination, usePagination } from "../../ui/Pagination";
import SearchInput from "../../ui/SearchInput";
import { useAction } from "../../useAction";

export default function PublicationsPage() {
  const { publications, thematiques, regions } = useAdminData();
  const { canCreate, canUpdate, canDelete } = usePermissions("publications");
  const run = useAction();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [thematiqueId, setThematiqueId] = useState("");
  const [deleting, setDeleting] = useState<AdminPublication | null>(null);

  const thematiqueName = (id: string) => thematiques.items.find((t) => t.id === id)?.name ?? "—";
  const regionName = (id?: string) => (id ? (regions.items.find((r) => r.id === id)?.name ?? "—") : "—");

  const rows = useMemo(
    () =>
      publications.items
        .filter((p) => matches(query, p.title))
        .filter((p) => !level || p.level === level)
        .filter((p) => !thematiqueId || p.thematiqueId === thematiqueId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [publications.items, query, level, thematiqueId],
  );
  const pager = usePagination(rows, 8, `${query}|${level}|${thematiqueId}`);

  const columns: Column<AdminPublication>[] = [
    {
      key: "title",
      header: "Titre",
      className: "min-w-72 max-w-lg",
      cell: (p) => (
        <div>
          {canUpdate ? (
            <a href={`#/admin/publications/modifier/${p.id}`} className={`${cellTitleClass} decoration-paddy/40 underline-offset-4 hover:text-paddy hover:underline`}>
              {p.title}
            </a>
          ) : (
            <span className={cellTitleClass}>{p.title}</span>
          )}
          {p.latestNipc && (
            <div className="mt-1">
              <Badge tone="green">Dernière publication NIPC</Badge>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "level",
      header: "Niveau",
      cell: (p) => <Badge tone={p.level === "national" ? "neutral" : "outline"}>{p.level === "national" ? "National" : "Régional"}</Badge>,
    },
    { key: "region", header: "Région", cell: (p) => regionName(p.regionId) },
    { key: "thematique", header: "Thématique", cell: (p) => thematiqueName(p.thematiqueId) },
    { key: "date", header: "Publiée le", cell: (p) => <span className="font-mono text-xs whitespace-nowrap text-muted tabular-nums">{formatDate(p.date)}</span> },
    ...(canUpdate || canDelete
      ? [
          {
            key: "actions",
            header: "Actions",
            align: "right" as const,
            cell: (p: AdminPublication) => (
              <RowActions
                label={p.title}
                editHref={canUpdate ? `#/admin/publications/modifier/${p.id}` : undefined}
                onDelete={canDelete ? () => setDeleting(p) : undefined}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Publications"
        count={publications.items.length}
        description="Les publications affichées sur le site, nationales ou régionales."
        actions={
          canCreate && (
            <a href="#/admin/publications/nouvelle" className={buttonClass("primary")}>
              <Plus className="size-4" aria-hidden="true" />
              Nouvelle publication
            </a>
          )
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={query} onChange={setQuery} label="Rechercher une publication par titre" />
        <select aria-label="Filtrer par niveau" value={level} onChange={(e) => setLevel(e.target.value)} className={filterClass}>
          <option value="">Tous les niveaux</option>
          <option value="national">National</option>
          <option value="regional">Régional</option>
        </select>
        <select
          aria-label="Filtrer par thématique"
          value={thematiqueId}
          onChange={(e) => setThematiqueId(e.target.value)}
          className={`${filterClass} sm:max-w-64`}
        >
          <option value="">Toutes les thématiques</option>
          {thematiques.items
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name, "fr"))
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
        </select>
      </div>

      <DataTable
        caption="Liste des publications"
        columns={columns}
        rows={pager.pageItems}
        empty={<EmptyState title="Aucune publication trouvée">Modifiez votre recherche ou vos filtres.</EmptyState>}
      />
      <Pagination {...pager} onChange={pager.setPage} />

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer la publication"
        message={`Supprimer la publication « ${deleting?.title ?? ""} » et ses documents ? Cette action est définitive.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await run(() => publications.remove(deleting.id), "Publication supprimée.");
          setDeleting(null);
        }}
      />
    </>
  );
}
