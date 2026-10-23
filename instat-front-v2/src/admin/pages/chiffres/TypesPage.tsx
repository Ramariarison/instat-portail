import { useMemo, useRef, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { matches, slug } from "../../../lib/format";
import { useAdminData } from "../../data/AdminDataContext";
import type { DataType } from "../../data/types";
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
import { pictoError } from "./shared";

function TypeForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: DataType;
  onSave: (draft: Omit<DataType, "id">) => void;
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
    if (name.trim().length < 2) next.name = "Saisissez le nom du type de données.";
    const pictoProblem = pictoError(picto);
    if (pictoProblem) next.picto = pictoProblem;
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
        label="Nom du fichier picto (PNG)"
        required
        hint="Nom du fichier image déjà présent sur le serveur, par exemple « population.png »."
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

export default function TypesPage() {
  const { dataTypes, indicators } = useAdminData();
  const { canCreate, canUpdate, canDelete } = usePermissions("types");
  const run = useAction();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<DataType | "new" | null>(null);
  const [deleting, setDeleting] = useState<DataType | null>(null);

  const usage = (id: string) => indicators.items.filter((indicator) => indicator.typeId === id).length;

  // L'ordre des types est celui de la saisie : c'est l'ordre d'affichage sur la page publique.
  const rows = useMemo(
    () => dataTypes.items.filter((type) => matches(query, type.name, type.picto)),
    [dataTypes.items, query],
  );
  const pager = usePagination(rows, 12, query);

  const columns: Column<DataType>[] = [
    { key: "name", header: "Nom", cell: (t) => <span className={cellTitleClass}>{t.name}</span> },
    { key: "picto", header: "Fichier picto", cell: (t) => <code className="text-sm text-muted">{t.picto}</code> },
    { key: "count", header: "Indicateurs", align: "right", cell: (t) => <span className="font-mono text-[0.85rem] tabular-nums">{usage(t.id)}</span> },
    ...(canUpdate || canDelete
      ? [
          {
            key: "actions",
            header: "Actions",
            align: "right" as const,
            cell: (t: DataType) => (
              <RowActions
                label={t.name}
                onEdit={canUpdate ? () => setEditing(t) : undefined}
                onDelete={canDelete ? () => setDeleting(t) : undefined}
              />
            ),
          },
        ]
      : []),
  ];

  async function save(draft: Omit<DataType, "id">) {
    if (!editing) return;
    const saved =
      editing === "new"
        ? await run(() => dataTypes.add(draft), "Type de données créé.")
        : await run(() => dataTypes.update(editing.id, draft), "Type de données modifié.");
    if (saved) setEditing(null);
  }

  const deletingUsage = deleting ? usage(deleting.id) : 0;
  const blockedReason =
    deleting && deletingUsage > 0
      ? `Le type « ${deleting.name} » regroupe ${deletingUsage} indicateur${deletingUsage > 1 ? "s" : ""}. Supprimez-les ou rattachez-les à un autre type avant de le supprimer.`
      : undefined;

  return (
    <>
      <PageHeader
        title="Types de données"
        count={dataTypes.items.length}
        description="Les grandes catégories sous lesquelles les indicateurs de « Madagascar en chiffres » sont regroupés."
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setEditing("new")}>
              <Plus className="size-4" aria-hidden="true" />
              Nouveau type
            </Button>
          )
        }
      />

      <div className="mb-4">
        <SearchInput value={query} onChange={setQuery} label="Rechercher un type de données" />
      </div>

      <DataTable
        caption="Liste des types de données"
        columns={columns}
        rows={pager.pageItems}
        empty={<EmptyState title="Aucun type de données trouvé">Modifiez votre recherche ou créez un nouveau type.</EmptyState>}
      />
      <Pagination {...pager} onChange={pager.setPage} />

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Nouveau type de données" : "Modifier le type de données"}
      >
        {editing !== null && (
          <TypeForm initial={editing === "new" ? undefined : editing} onSave={save} onCancel={() => setEditing(null)} />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer le type de données"
        message={`Supprimer le type « ${deleting?.name ?? ""} » ? Cette action est définitive.`}
        blockedReason={blockedReason}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await run(() => dataTypes.remove(deleting.id), "Type de données supprimé.");
          setDeleting(null);
        }}
      />
    </>
  );
}
