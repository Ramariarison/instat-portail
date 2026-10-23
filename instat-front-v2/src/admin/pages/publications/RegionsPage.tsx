import { useMemo, useRef, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { byName, matches, slug } from "../../../lib/format";
import { useAdminData } from "../../data/AdminDataContext";
import type { Region } from "../../data/types";
import { usePermissions } from "../../usePermissions";
import Button from "../../ui/Button";
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

const PICTO_FILE = /^[\w\-. ]+\.(png|jpe?g|svg|webp)$/i;

function RegionForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Region;
  onSave: (draft: Omit<Region, "id">) => void;
  onCancel: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [picto, setPicto] = useState(initial?.picto ?? "");
  const [pictoTouched, setPictoTouched] = useState(Boolean(initial));
  const [errors, setErrors] = useState<{ name?: string; picto?: string }>({});

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Saisissez le nom de la région.";
    if (!picto.trim()) next.picto = "Saisissez le nom du fichier picto.";
    else if (!PICTO_FILE.test(picto.trim()))
      next.picto = "Indiquez un nom de fichier image, par exemple : analamanga.png";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      focusFirstInvalid(formRef.current);
      return;
    }
    onSave({ name: name.trim(), picto: picto.trim() });
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-5">
      <Field label="Nom" required error={errors.name}>
        {(aria) => (
          <input
            {...aria}
            className={inputClass}
            value={name}
            autoComplete="off"
            onChange={(event) => {
              setName(event.target.value);
              if (!pictoTouched) setPicto(event.target.value.trim() ? `${slug(event.target.value)}.png` : "");
            }}
          />
        )}
      </Field>
      <Field
        label="Nom du fichier picto"
        required
        hint="Nom du fichier image déjà présent sur le serveur, par exemple « analamanga.png »."
        error={errors.picto}
      >
        {(aria) => (
          <input
            {...aria}
            className={inputClass}
            value={picto}
            autoComplete="off"
            onChange={(event) => {
              setPictoTouched(true);
              setPicto(event.target.value);
            }}
          />
        )}
      </Field>
      <FormActions onCancel={onCancel} />
    </form>
  );
}

export default function RegionsPage() {
  const { regions, publications, figureRegions } = useAdminData();
  const { canCreate, canUpdate, canDelete } = usePermissions("regions");
  const run = useAction();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Region | "new" | null>(null);
  const [deleting, setDeleting] = useState<Region | null>(null);

  const usage = (id: string) => publications.items.filter((p) => p.regionId === id).length;
  const hasFigures = (id: string) => figureRegions.items.some((f) => f.regionId === id);

  const rows = useMemo(
    () => regions.items.filter((r) => matches(query, r.name, r.picto)).sort(byName),
    [regions.items, query],
  );
  const pager = usePagination(rows, 10, query);

  const columns: Column<Region>[] = [
    { key: "name", header: "Nom", cell: (r) => <span className={cellTitleClass}>{r.name}</span> },
    { key: "picto", header: "Fichier picto", cell: (r) => <code className="text-sm text-muted">{r.picto}</code> },
    { key: "count", header: "Publications", align: "right", cell: (r) => <span className="font-mono text-[0.85rem] tabular-nums">{usage(r.id)}</span> },
    ...(canUpdate || canDelete
      ? [
          {
            key: "actions",
            header: "Actions",
            align: "right" as const,
            cell: (r: Region) => (
              <RowActions
                label={r.name}
                onEdit={canUpdate ? () => setEditing(r) : undefined}
                onDelete={canDelete ? () => setDeleting(r) : undefined}
              />
            ),
          },
        ]
      : []),
  ];

  async function save(draft: Omit<Region, "id">) {
    if (!editing) return;
    const saved =
      editing === "new"
        ? await run(() => regions.add(draft), "Région créée.")
        : await run(() => regions.update(editing.id, draft), "Région modifiée.");
    if (saved) setEditing(null);
  }

  const deletingUsage = deleting ? usage(deleting.id) : 0;
  const deletingFigures = deleting ? hasFigures(deleting.id) : false;
  const blockedReason = deleting
    ? deletingUsage > 0
      ? `La région « ${deleting.name} » est utilisée par ${deletingUsage} publication${deletingUsage > 1 ? "s" : ""}. Modifiez d'abord ces publications.`
      : deletingFigures
        ? `La région « ${deleting.name} » a une fiche dans « Données par régions ». Supprimez-la d'abord dans Madagascar en chiffres.`
        : undefined
    : undefined;

  return (
    <>
      <PageHeader
        title="Régions"
        count={regions.items.length}
        description="Les régions auxquelles les publications régionales peuvent être rattachées."
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setEditing("new")}>
              <Plus className="size-4" aria-hidden="true" />
              Nouvelle région
            </Button>
          )
        }
      />

      <div className="mb-4">
        <SearchInput value={query} onChange={setQuery} label="Rechercher une région" />
      </div>

      <DataTable
        caption="Liste des régions"
        columns={columns}
        rows={pager.pageItems}
        empty={<EmptyState title="Aucune région trouvée">Modifiez votre recherche ou créez une nouvelle région.</EmptyState>}
      />
      <Pagination {...pager} onChange={pager.setPage} />

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Nouvelle région" : "Modifier la région"}
      >
        {editing !== null && (
          <RegionForm initial={editing === "new" ? undefined : editing} onSave={save} onCancel={() => setEditing(null)} />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer la région"
        message={`Supprimer la région « ${deleting?.name ?? ""} » ? Cette action est définitive.`}
        blockedReason={blockedReason}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await run(() => regions.remove(deleting.id), "Région supprimée.");
          setDeleting(null);
        }}
      />
    </>
  );
}
