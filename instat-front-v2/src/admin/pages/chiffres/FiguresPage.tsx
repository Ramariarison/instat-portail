import { useMemo, useRef, useState, type FormEvent } from "react";
import { Eye, Plus } from "lucide-react";
import { byName, matches } from "../../../lib/format";
import { useAdminData } from "../../data/AdminDataContext";
import type { FigureRegion, Region } from "../../data/types";
import { usePermissions } from "../../usePermissions";
import Badge from "../../ui/Badge";
import Button, { buttonClass } from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";
import DataTable, { cellTitleClass, RowActions, type Column } from "../../ui/DataTable";
import Field from "../../ui/Field";
import { focusFirstInvalid, FormActions } from "../../ui/form";
import { inputClass } from "../../ui/inputs";
import Modal from "../../ui/Modal";
import PageHeader, { EmptyState } from "../../ui/PageHeader";
import { Pagination, usePagination } from "../../ui/Pagination";
import SearchInput from "../../ui/SearchInput";
import { useAction } from "../../useAction";

function AddFigureForm({
  available,
  onSave,
  onCancel,
}: {
  available: Region[];
  onSave: (regionId: string) => void;
  onCancel: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [regionId, setRegionId] = useState("");
  const [error, setError] = useState<string>();

  if (available.length === 0) {
    return (
      <div>
        <p className="text-[0.95rem] leading-relaxed">
          Toutes les régions ont déjà leur fiche. Pour en ajouter une autre, créez d'abord la région dans « Gestion des
          publications › Régions ».
        </p>
        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={onCancel}>
            Fermer
          </Button>
        </div>
      </div>
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!regionId) {
      setError("Choisissez une région.");
      focusFirstInvalid(formRef.current);
      return;
    }
    onSave(regionId);
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-5">
      <Field
        label="Région"
        required
        hint="Seules les régions qui n'ont pas encore de données sont proposées."
        error={error}
      >
        {(aria) => (
          <select
            {...aria}
            className={inputClass}
            value={regionId}
            onChange={(event) => {
              setRegionId(event.target.value);
              setError(undefined);
            }}
          >
            <option value="">Choisir une région…</option>
            {available.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        )}
      </Field>
      <FormActions onCancel={onCancel} submitLabel="Ajouter et saisir les données" />
    </form>
  );
}

export default function FiguresPage() {
  const { figureRegions, figureValues, regions, removeFigureRegion } = useAdminData();
  const { canCreate, canUpdate, canDelete } = usePermissions("figures");
  const run = useAction();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<FigureRegion | null>(null);

  const stats = useMemo(() => {
    const map = new Map<string, { count: number; min: number; max: number }>();
    for (const value of figureValues.items) {
      const current = map.get(value.figureRegionId);
      map.set(value.figureRegionId, {
        count: (current?.count ?? 0) + 1,
        min: Math.min(current?.min ?? value.year, value.year),
        max: Math.max(current?.max ?? value.year, value.year),
      });
    }
    return map;
  }, [figureValues.items]);

  // Le niveau national (Madagascar) d'abord, puis les régions par ordre alphabétique.
  const rows = useMemo(
    () =>
      figureRegions.items
        .filter((figure) => matches(query, figure.name))
        .sort((a, b) => Number(Boolean(a.regionId)) - Number(Boolean(b.regionId)) || byName(a, b)),
    [figureRegions.items, query],
  );
  const pager = usePagination(rows, 12, query);

  const available = useMemo(() => {
    const used = new Set(figureRegions.items.map((figure) => figure.regionId));
    return regions.items.filter((region) => !used.has(region.id)).sort(byName);
  }, [figureRegions.items, regions.items]);

  const columns: Column<FigureRegion>[] = [
    {
      key: "name",
      header: "Région",
      cell: (f) => (
        <span className="inline-flex items-center gap-2">
          <span className={cellTitleClass}>{f.name}</span>
          {!f.regionId && <Badge tone="green">National</Badge>}
        </span>
      ),
    },
    {
      key: "count",
      header: "Données",
      align: "right",
      cell: (f) => <span className="font-mono text-[0.85rem] tabular-nums">{stats.get(f.id)?.count ?? 0}</span>,
    },
    {
      key: "years",
      header: "Années couvertes",
      cell: (f) => {
        const s = stats.get(f.id);
        if (!s) return <span className="text-muted">—</span>;
        return <span className="font-mono text-[0.85rem] tabular-nums">{s.min === s.max ? s.min : `${s.min} – ${s.max}`}</span>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (f) => (
        <RowActions
          label={f.name}
          extra={
            <a
              href={`#/admin/chiffres/regions/${f.id}`}
              aria-label={`Voir les données : ${f.name}`}
              className={buttonClass("ghost", "sm")}
            >
              <Eye className="size-4" aria-hidden="true" />
              Voir
            </a>
          }
          editHref={canUpdate ? `#/admin/chiffres/regions/${f.id}/modifier` : undefined}
          onDelete={canDelete ? () => setDeleting(f) : undefined}
        />
      ),
    },
  ];

  async function add(regionId: string) {
    const region = regions.items.find((r) => r.id === regionId);
    if (!region) return;
    let createdId = "";
    const ok = await run(
      async () => {
        createdId = (await figureRegions.add({ name: region.name, regionId: region.id })).id;
      },
      `Fiche « ${region.name} » créée. Vous pouvez saisir ses données.`,
    );
    setAdding(false);
    if (ok) window.location.hash = `#/admin/chiffres/regions/${createdId}/modifier`;
  }

  const deletingCount = deleting ? (stats.get(deleting.id)?.count ?? 0) : 0;

  return (
    <>
      <PageHeader
        title="Données par régions"
        count={figureRegions.items.length}
        description="Pour chaque région (et pour Madagascar), les valeurs des indicateurs affichées dans « Madagascar en chiffres »."
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setAdding(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Ajouter une région
            </Button>
          )
        }
      />

      <div className="mb-4">
        <SearchInput value={query} onChange={setQuery} label="Rechercher une région" />
      </div>

      <DataTable
        caption="Liste des régions en chiffres"
        columns={columns}
        rows={pager.pageItems}
        empty={<EmptyState title="Aucune région trouvée">Modifiez votre recherche.</EmptyState>}
      />
      <Pagination {...pager} onChange={pager.setPage} />

      <Modal open={adding} onClose={() => setAdding(false)} title="Ajouter une région">
        {adding && <AddFigureForm available={available} onSave={add} onCancel={() => setAdding(false)} />}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer les données de la région"
        message={`Supprimer « ${deleting?.name ?? ""} » et ${deletingCount === 0 ? "ses données" : `ses ${deletingCount} donnée${deletingCount > 1 ? "s" : ""}`} ? Cette action est définitive.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await run(() => removeFigureRegion(deleting.id), `« ${deleting.name} » supprimée.`);
          setDeleting(null);
        }}
      />
    </>
  );
}
