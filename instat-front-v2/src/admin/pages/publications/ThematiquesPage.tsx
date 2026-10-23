import { useMemo, useRef, useState, type FormEvent } from "react";
import { ImageIcon, Plus } from "lucide-react";
import { byName, matches, slug } from "../../../lib/format";
import { useAdminData } from "../../data/AdminDataContext";
import type { Thematique } from "../../data/types";
import { usePermissions } from "../../usePermissions";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import Checkbox from "../../ui/Checkbox";
import ConfirmDialog from "../../ui/ConfirmDialog";
import DataTable, { cellTitleClass, RowActions, type Column } from "../../ui/DataTable";
import Field from "../../ui/Field";
import { focusFirstInvalid, FormActions } from "../../ui/form";
import ImageUpload from "../../ui/ImageUpload";
import { inputClass } from "../../ui/inputs";
import Modal from "../../ui/Modal";
import PageHeader, { EmptyState } from "../../ui/PageHeader";
import { Pagination, usePagination } from "../../ui/Pagination";
import SearchInput from "../../ui/SearchInput";
import { useAction } from "../../useAction";

type Draft = Omit<Thematique, "id">;

function ThematiqueForm({
  initial,
  existing,
  onSave,
  onCancel,
}: {
  initial?: Thematique;
  existing: Thematique[];
  onSave: (draft: Draft) => void;
  onCancel: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [alias, setAlias] = useState(initial?.alias ?? "");
  const [aliasTouched, setAliasTouched] = useState(Boolean(initial));
  const [pictoUrl, setPictoUrl] = useState(initial?.pictoUrl);
  const [covid, setCovid] = useState(initial?.covid ?? false);
  const [inMenuPublications, setInMenuPublications] = useState(initial?.inMenuPublications ?? false);
  const [inMenuThemes, setInMenuThemes] = useState(initial?.inMenuThemes ?? false);
  const [inMenuServices, setInMenuServices] = useState(initial?.inMenuServices ?? false);
  const [errors, setErrors] = useState<{ name?: string; alias?: string }>({});

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Saisissez le nom de la thématique.";
    if (!alias) next.alias = "Saisissez l'alias.";
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(alias))
      next.alias = "Lettres minuscules, chiffres et tirets uniquement (ex. : eau-assainissement).";
    else if (existing.some((t) => t.alias === alias && t.id !== initial?.id))
      next.alias = "Cet alias est déjà utilisé par une autre thématique.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      focusFirstInvalid(formRef.current);
      return;
    }
    onSave({ name: name.trim(), alias, pictoUrl, covid, inMenuPublications, inMenuThemes, inMenuServices });
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
              if (!aliasTouched) setAlias(slug(event.target.value));
            }}
          />
        )}
      </Field>

      <Field
        label="Alias"
        required
        hint="Identifiant court utilisé dans l'adresse de la page. Généré à partir du nom, modifiable."
        error={errors.alias}
      >
        {(aria) => (
          <input
            {...aria}
            className={inputClass}
            value={alias}
            autoComplete="off"
            onChange={(event) => {
              setAliasTouched(true);
              setAlias(event.target.value);
            }}
          />
        )}
      </Field>

      <ImageUpload label="Picto" hint="Image affichée à côté de la thématique (PNG, JPG, WebP ou SVG)." value={pictoUrl} onChange={setPictoUrl} />

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Affichage</legend>
        <Checkbox label="Thématique COVID-19" checked={covid} onChange={(e) => setCovid(e.target.checked)} />
        <Checkbox label="Ajouter au menu Publications" checked={inMenuPublications} onChange={(e) => setInMenuPublications(e.target.checked)} />
        <Checkbox label="Ajouter au menu Thématiques" checked={inMenuThemes} onChange={(e) => setInMenuThemes(e.target.checked)} />
        <Checkbox label="Ajouter au menu Services et ressources" checked={inMenuServices} onChange={(e) => setInMenuServices(e.target.checked)} />
      </fieldset>

      <FormActions onCancel={onCancel} />
    </form>
  );
}

export default function ThematiquesPage() {
  const { thematiques, publications } = useAdminData();
  const { canCreate, canUpdate, canDelete } = usePermissions("thematiques");
  const run = useAction();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Thematique | "new" | null>(null);
  const [deleting, setDeleting] = useState<Thematique | null>(null);

  const usage = (id: string) => publications.items.filter((p) => p.thematiqueId === id).length;

  const rows = useMemo(
    () => thematiques.items.filter((t) => matches(query, t.name, t.alias)).sort(byName),
    [thematiques.items, query],
  );
  const pager = usePagination(rows, 10, query);

  const columns: Column<Thematique>[] = [
    {
      key: "picto",
      header: "Picto",
      cell: (t) =>
        t.pictoUrl ? (
          <img src={t.pictoUrl} alt="" className="size-10 rounded-md border border-line bg-paper object-contain p-1" />
        ) : (
          <span className="flex size-10 items-center justify-center rounded-md border border-dashed border-line text-muted">
            <ImageIcon className="size-4" aria-hidden="true" />
            <span className="sr-only">Pas de picto</span>
          </span>
        ),
    },
    { key: "name", header: "Nom", cell: (t) => <span className={cellTitleClass}>{t.name}</span> },
    { key: "alias", header: "Alias", cell: (t) => <code className="text-sm text-muted">{t.alias}</code> },
    {
      key: "display",
      header: "Affichage",
      cell: (t) => (
        <div className="flex flex-wrap gap-1">
          {t.covid && <Badge tone="red">COVID-19</Badge>}
          {t.inMenuPublications && <Badge tone="green">Publications</Badge>}
          {t.inMenuThemes && <Badge tone="green">Thématiques</Badge>}
          {t.inMenuServices && <Badge tone="green">Services et ressources</Badge>}
          {!t.covid && !t.inMenuPublications && !t.inMenuThemes && !t.inMenuServices && (
            <span className="text-muted">—</span>
          )}
        </div>
      ),
    },
    { key: "count", header: "Publications", align: "right", cell: (t) => <span className="font-mono text-[0.85rem] tabular-nums">{usage(t.id)}</span> },
    ...(canUpdate || canDelete
      ? [
          {
            key: "actions",
            header: "Actions",
            align: "right" as const,
            cell: (t: Thematique) => (
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

  async function save(draft: Draft) {
    if (!editing) return;
    const saved =
      editing === "new"
        ? await run(() => thematiques.add(draft), "Thématique créée.")
        : await run(() => thematiques.update(editing.id, draft), "Thématique modifiée.");
    if (saved) setEditing(null);
  }

  const deletingUsage = deleting ? usage(deleting.id) : 0;

  return (
    <>
      <PageHeader
        title="Thématiques"
        count={thematiques.items.length}
        description="Les thèmes auxquels les publications sont rattachées, et les menus du site où ils apparaissent."
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setEditing("new")}>
              <Plus className="size-4" aria-hidden="true" />
              Nouvelle thématique
            </Button>
          )
        }
      />

      <div className="mb-4">
        <SearchInput value={query} onChange={setQuery} label="Rechercher une thématique" />
      </div>

      <DataTable
        caption="Liste des thématiques"
        columns={columns}
        rows={pager.pageItems}
        empty={<EmptyState title="Aucune thématique trouvée">Modifiez votre recherche ou créez une nouvelle thématique.</EmptyState>}
      />
      <Pagination {...pager} onChange={pager.setPage} />

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Nouvelle thématique" : "Modifier la thématique"}
      >
        {editing !== null && (
          <ThematiqueForm
            initial={editing === "new" ? undefined : editing}
            existing={thematiques.items}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer la thématique"
        message={`Supprimer la thématique « ${deleting?.name ?? ""} » ? Cette action est définitive.`}
        blockedReason={
          deletingUsage > 0
            ? `La thématique « ${deleting?.name} » est utilisée par ${deletingUsage} publication${deletingUsage > 1 ? "s" : ""}. Rattachez d'abord ces publications à une autre thématique.`
            : undefined
        }
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await run(() => thematiques.remove(deleting.id), "Thématique supprimée.");
          setDeleting(null);
        }}
      />
    </>
  );
}
