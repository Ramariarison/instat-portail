import { useMemo, useRef, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { matches } from "../../../lib/format";
import { useAdminData } from "../../data/AdminDataContext";
import type { DataType, IndicatorDef } from "../../data/types";
import { usePermissions } from "../../usePermissions";
import Badge from "../../ui/Badge";
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

function IndicatorForm({
  initial,
  types,
  onSave,
  onCancel,
}: {
  initial?: IndicatorDef;
  types: DataType[];
  onSave: (draft: Omit<IndicatorDef, "id">) => void;
  onCancel: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [typeId, setTypeId] = useState(initial?.typeId ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [picto, setPicto] = useState(initial?.picto ?? "");
  const [errors, setErrors] = useState<{ typeId?: string; name?: string; picto?: string }>({});

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (!typeId) next.typeId = "Choisissez un type de données.";
    if (name.trim().length < 3) next.name = "Saisissez le nom de l'indicateur.";
    const pictoProblem = pictoError(picto);
    if (pictoProblem) next.picto = pictoProblem;
    setErrors(next);
    if (Object.keys(next).length > 0) {
      focusFirstInvalid(formRef.current);
      return;
    }
    onSave({ typeId, name: name.trim(), picto: picto.trim() });
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-5">
      <Field label="Type de données" required error={errors.typeId}>
        {(aria) => (
          <select {...aria} className={inputClass} value={typeId} onChange={(event) => setTypeId(event.target.value)}>
            <option value="">Choisir un type…</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field label="Nom de l'indicateur" required error={errors.name}>
        {(aria) => (
          <input
            {...aria}
            className={inputClass}
            value={name}
            autoComplete="off"
            onChange={(event) => setName(event.target.value)}
          />
        )}
      </Field>
      <Field
        label="Nom du fichier picto (PNG)"
        required
        hint="Nom du fichier image déjà présent sur le serveur, par exemple « superficie.png »."
        error={errors.picto}
      >
        {(aria) => (
          <input
            {...aria}
            className={inputClass}
            value={picto}
            autoComplete="off"
            onChange={(event) => setPicto(event.target.value)}
          />
        )}
      </Field>
      <FormActions onCancel={onCancel} />
    </form>
  );
}

export default function IndicateursPage() {
  const { dataTypes, indicators, figureValues } = useAdminData();
  const { canCreate, canUpdate, canDelete } = usePermissions("indicateurs");
  const run = useAction();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [editing, setEditing] = useState<IndicatorDef | "new" | null>(null);
  const [deleting, setDeleting] = useState<IndicatorDef | null>(null);

  const typeName = (id: string) => dataTypes.items.find((type) => type.id === id)?.name ?? "—";
  const usage = (id: string) => figureValues.items.filter((value) => value.indicatorId === id).length;

  // Regroupés par type, dans l'ordre des types ; l'ordre de saisie est conservé à l'intérieur de chaque type.
  const rows = useMemo(() => {
    const order = new Map(dataTypes.items.map((type, index) => [type.id, index]));
    return indicators.items
      .filter(
        (indicator) =>
          (!typeFilter || indicator.typeId === typeFilter) &&
          matches(query, indicator.name, indicator.picto, dataTypes.items.find((t) => t.id === indicator.typeId)?.name),
      )
      .sort((a, b) => (order.get(a.typeId) ?? 99) - (order.get(b.typeId) ?? 99));
  }, [indicators.items, dataTypes.items, query, typeFilter]);
  const pager = usePagination(rows, 12, `${query}|${typeFilter}`);

  const columns: Column<IndicatorDef>[] = [
    {
      key: "name",
      header: "Nom",
      cell: (i) => <div className={`max-w-[28rem] ${cellTitleClass}`}>{i.name}</div>,
    },
    { key: "type", header: "Type de données", cell: (i) => <Badge tone="neutral">{typeName(i.typeId)}</Badge> },
    { key: "picto", header: "Fichier picto", cell: (i) => <code className="text-sm text-muted">{i.picto}</code> },
    { key: "count", header: "Valeurs", align: "right", cell: (i) => <span className="font-mono text-[0.85rem] tabular-nums">{usage(i.id)}</span> },
    ...(canUpdate || canDelete
      ? [
          {
            key: "actions",
            header: "Actions",
            align: "right" as const,
            cell: (i: IndicatorDef) => (
              <RowActions
                label={i.name}
                onEdit={canUpdate ? () => setEditing(i) : undefined}
                onDelete={canDelete ? () => setDeleting(i) : undefined}
              />
            ),
          },
        ]
      : []),
  ];

  async function save(draft: Omit<IndicatorDef, "id">) {
    if (!editing) return;
    const saved =
      editing === "new"
        ? await run(() => indicators.add(draft), "Indicateur créé.")
        : await run(() => indicators.update(editing.id, draft), "Indicateur modifié.");
    if (saved) setEditing(null);
  }

  const deletingUsage = deleting ? usage(deleting.id) : 0;
  const blockedReason =
    deleting && deletingUsage > 0
      ? `L'indicateur « ${deleting.name} » a ${deletingUsage} valeur${deletingUsage > 1 ? "s" : ""} dans « Données par régions ». Supprimez d'abord ces valeurs.`
      : undefined;

  return (
    <>
      <PageHeader
        title="Indicateurs"
        count={indicators.items.length}
        description="Les indicateurs de « Madagascar en chiffres », rattachés à un type de données."
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setEditing("new")}>
              <Plus className="size-4" aria-hidden="true" />
              Nouvel indicateur
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <SearchInput value={query} onChange={setQuery} label="Rechercher un indicateur" />
        <select
          aria-label="Filtrer par type de données"
          className={`${inputClass} sm:w-72`}
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
        >
          <option value="">Tous les types</option>
          {dataTypes.items.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        caption="Liste des indicateurs"
        columns={columns}
        rows={pager.pageItems}
        empty={<EmptyState title="Aucun indicateur trouvé">Modifiez votre recherche ou créez un nouvel indicateur.</EmptyState>}
      />
      <Pagination {...pager} onChange={pager.setPage} />

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Nouvel indicateur" : "Modifier l'indicateur"}
      >
        {editing !== null && (
          <IndicatorForm
            initial={editing === "new" ? undefined : editing}
            types={dataTypes.items}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer l'indicateur"
        message={`Supprimer l'indicateur « ${deleting?.name ?? ""} » ? Cette action est définitive.`}
        blockedReason={blockedReason}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await run(() => indicators.remove(deleting.id), "Indicateur supprimé.");
          setDeleting(null);
        }}
      />
    </>
  );
}
