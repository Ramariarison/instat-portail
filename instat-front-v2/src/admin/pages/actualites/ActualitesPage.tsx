import { useMemo, useRef, useState, type FormEvent } from "react";
import { ExternalLink, ImageIcon, Plus } from "lucide-react";
import { matches, todayIso } from "../../../lib/format";
import { newsDateLabel } from "../../../lib/news";
import type { NewsItem } from "../../../types";
import { useAdminData, type NewsInput } from "../../data/AdminDataContext";
import { usePermissions } from "../../usePermissions";
import Button, { buttonClass } from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";
import DataTable, { cellTitleClass, RowActions, type Column } from "../../ui/DataTable";
import Field from "../../ui/Field";
import { focusFirstInvalid, FormActions } from "../../ui/form";
import ImageUpload from "../../ui/ImageUpload";
import { inputClass, textareaClass } from "../../ui/inputs";
import Modal from "../../ui/Modal";
import PageHeader, { EmptyState } from "../../ui/PageHeader";
import { Pagination, usePagination } from "../../ui/Pagination";
import SearchInput from "../../ui/SearchInput";
import { useAction } from "../../useAction";

const CONTENT_MAX = 50_000;

/** Les plus récentes d'abord ; une actualité sans date en dernier. */
function byDateDesc(a: NewsItem, b: NewsItem): number {
  return (b.date ?? "").localeCompare(a.date ?? "");
}

function NewsForm({ initial, onSave, onCancel }: { initial?: NewsItem; onSave: (draft: NewsInput) => void; onCancel: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial?.date ?? todayIso());
  const [dateLabel, setDateLabel] = useState(initial?.dateLabel ?? "");
  const [context, setContext] = useState(initial?.context ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl);
  const [content, setContent] = useState(initial?.content ?? "");
  const [errors, setErrors] = useState<{ title?: string; date?: string; content?: string }>({});

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (title.trim().length < 3) next.title = "Saisissez le titre de l'actualité.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) next.date = "Choisissez la date de l'actualité.";
    if (content.trim().length < 20) next.content = "Rédigez le texte de l'actualité (quelques phrases au moins).";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      focusFirstInvalid(formRef.current);
      return;
    }
    onSave({
      title: title.trim(),
      date,
      dateLabel: dateLabel.trim() || undefined,
      context: context.trim() || undefined,
      imageUrl,
      content: content.trim(),
    });
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-5">
      <Field label="Titre" required error={errors.title}>
        {(aria) => <input {...aria} className={inputClass} value={title} maxLength={500} autoComplete="off" onChange={(e) => setTitle(e.target.value)} />}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date" required hint="Sert à classer les actualités, les plus récentes d'abord." error={errors.date}>
          {(aria) => <input {...aria} type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />}
        </Field>
        <Field label="Date affichée" hint={`Facultatif, pour un événement sur plusieurs jours : « 22 et 23 janvier 2026 ».`}>
          {(aria) => <input {...aria} className={inputClass} value={dateLabel} maxLength={200} autoComplete="off" onChange={(e) => setDateLabel(e.target.value)} />}
        </Field>
      </div>

      <Field label="Contexte" hint="Facultatif : lieu, partenaire ou projet (« Anosy », « Avec l'UNICEF »).">
        {(aria) => <input {...aria} className={inputClass} value={context} maxLength={200} autoComplete="off" onChange={(e) => setContext(e.target.value)} />}
      </Field>

      <ImageUpload
        label="Image"
        hint="Facultative. Photo affichée en tête de l'actualité et dans la liste (format paysage conseillé)."
        value={imageUrl}
        onChange={setImageUrl}
        wide
      />

      <Field label="Texte" required hint="Une ligne vide sépare deux paragraphes." error={errors.content}>
        {(aria) => (
          <div>
            <textarea
              {...aria}
              rows={10}
              maxLength={CONTENT_MAX}
              className={textareaClass}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <p className="mt-1 text-right text-xs text-muted tabular-nums">
              {content.length.toLocaleString("fr-FR")} / {CONTENT_MAX.toLocaleString("fr-FR")}
            </p>
          </div>
        )}
      </Field>

      <FormActions onCancel={onCancel} />
    </form>
  );
}

/** Actualités du site : bloc défilant de l'accueil, page « Actualités » et page de chaque actualité. */
export default function ActualitesPage() {
  const { news } = useAdminData();
  const { canCreate, canUpdate, canDelete } = usePermissions("actualites");
  const run = useAction();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<NewsItem | "new" | null>(null);
  const [deleting, setDeleting] = useState<NewsItem | null>(null);

  const rows = useMemo(
    () => news.items.filter((n) => matches(query, n.title, n.context, n.dateLabel)).sort(byDateDesc),
    [news.items, query],
  );
  const pager = usePagination(rows, 10, query);

  const columns: Column<NewsItem>[] = [
    {
      key: "image",
      header: "Image",
      cell: (n) =>
        n.imageUrl ? (
          <img src={n.imageUrl} alt="" className="h-12 w-20 border border-line bg-paper object-cover" />
        ) : (
          <span className="flex h-12 w-20 items-center justify-center border border-dashed border-line text-muted">
            <ImageIcon className="size-4" aria-hidden="true" />
            <span className="sr-only">Pas d'image</span>
          </span>
        ),
    },
    {
      key: "title",
      header: "Titre",
      cell: (n) => (
        <div className="min-w-0">
          <span className={cellTitleClass}>{n.title}</span>
          {n.context && <p className="mt-0.5 text-sm text-muted">{n.context}</p>}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (n) => <span className="text-[0.85rem] whitespace-nowrap">{newsDateLabel(n) ?? <span className="text-muted">—</span>}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (n) => (
        <RowActions
          label={n.title}
          onEdit={canUpdate ? () => setEditing(n) : undefined}
          onDelete={canDelete ? () => setDeleting(n) : undefined}
          extra={
            <a href={n.href} target="_blank" rel="noreferrer" aria-label={`Voir sur le site : ${n.title}`} className={buttonClass("ghost", "sm")}>
              <ExternalLink className="size-4" aria-hidden="true" />
              Voir
            </a>
          }
        />
      ),
    },
  ];

  async function save(draft: NewsInput) {
    if (!editing) return;
    const saved =
      editing === "new"
        ? await run(() => news.add(draft), "Actualité publiée.")
        : await run(() => news.update(editing.id, draft), "Actualité modifiée.");
    if (saved) setEditing(null);
  }

  return (
    <>
      <PageHeader
        title="Actualités"
        count={news.items.length}
        description="Les nouvelles de l'institut : partenariats, lancements d'enquêtes, rencontres. Elles paraissent sur l'accueil et sur la page « Actualités » dès leur enregistrement."
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setEditing("new")}>
              <Plus className="size-4" aria-hidden="true" />
              Nouvelle actualité
            </Button>
          )
        }
      />

      <div className="mb-4">
        <SearchInput value={query} onChange={setQuery} label="Rechercher une actualité" />
      </div>

      <DataTable
        caption="Liste des actualités"
        columns={columns}
        rows={pager.pageItems}
        empty={<EmptyState title="Aucune actualité trouvée">Modifiez votre recherche ou rédigez une nouvelle actualité.</EmptyState>}
      />
      <Pagination {...pager} onChange={pager.setPage} />

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Nouvelle actualité" : "Modifier l'actualité"}
        wide
      >
        {editing !== null && (
          <NewsForm initial={editing === "new" ? undefined : editing} onSave={save} onCancel={() => setEditing(null)} />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer l'actualité"
        message={`Supprimer l'actualité « ${deleting?.title ?? ""} » ? Elle disparaîtra du site. Cette action est définitive.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await run(() => news.remove(deleting.id), "Actualité supprimée.");
          setDeleting(null);
        }}
      />
    </>
  );
}
