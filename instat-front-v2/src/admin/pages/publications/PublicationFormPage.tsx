import { useRef, useState, type FormEvent } from "react";
import { FilePlus, LoaderCircle, X } from "lucide-react";
import { errorMessage, fileUrl, uploadFile } from "../../../lib/api";
import { formatBytes, todayIso } from "../../../lib/format";
import { navigate } from "../../../lib/route";
import { useAdminData } from "../../data/AdminDataContext";
import { sectors } from "../../data/sectors";
import type { AdminPublication, PublicationDoc } from "../../data/types";
import { NotFoundPanel } from "../../layout/Panels";
import Button, { buttonClass } from "../../ui/Button";
import Checkbox from "../../ui/Checkbox";
import Field from "../../ui/Field";
import { focusFirstInvalid } from "../../ui/form";
import ImageUpload from "../../ui/ImageUpload";
import { inputClass, textareaClass } from "../../ui/inputs";
import PageHeader, { BlockTitle, Breadcrumb } from "../../ui/PageHeader";
import { useToast } from "../../ui/Toast";

type Errors = Partial<Record<"title" | "regionId" | "thematiqueId" | "date" | "excerpt" | "content", string>>;

const EXCERPT_MAX = 300;

function Section({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-t-2 border-line border-t-ink bg-white p-5 sm:p-7">
      <BlockTitle number={number}>{title}</BlockTitle>
      {description && <p className="mt-1.5 text-[0.95rem] text-muted">{description}</p>}
      <div className="mt-6 space-y-6 border-t border-line pt-6">{children}</div>
    </section>
  );
}

function PublicationForm({ initial }: { initial?: AdminPublication }) {
  const { thematiques, regions, savePublication } = useAdminData();
  const { notify } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl);
  const [level, setLevel] = useState<AdminPublication["level"]>(initial?.level ?? "national");
  const [regionId, setRegionId] = useState(initial?.regionId ?? "");
  const [thematiqueId, setThematiqueId] = useState(initial?.thematiqueId ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [documents, setDocuments] = useState<PublicationDoc[]>(initial?.documents ?? []);
  const [date, setDate] = useState(initial?.date ?? todayIso());
  const [latestNipc, setLatestNipc] = useState(initial?.latestNipc ?? false);
  const [selectedSectors, setSelectedSectors] = useState<string[]>(initial?.sectors ?? []);
  const [errors, setErrors] = useState<Errors>({});
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);

  const sortedThematiques = thematiques.items.slice().sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const sortedRegions = regions.items.slice().sort((a, b) => a.name.localeCompare(b.name, "fr"));

  /** Envoie les fichiers au service Fichiers ; le document garde l'identifiant attribué par le service. */
  async function addFiles(files: FileList | null) {
    if (!files) return;
    const fresh = Array.from(files).filter((file) => !documents.some((d) => d.name === file.name && d.size === file.size));
    setUploading((n) => n + fresh.length);
    await Promise.all(
      fresh.map(async (file) => {
        try {
          const uploaded = await uploadFile(file);
          const doc: PublicationDoc = { id: uploaded.id, name: uploaded.name, size: uploaded.size };
          setDocuments((previous) => [...previous, doc]);
        } catch (error) {
          notify(`« ${file.name} » n'a pas été envoyé : ${errorMessage(error)}`, "error");
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
  }

  function toggleSector(id: string) {
    setSelectedSectors((previous) => (previous.includes(id) ? previous.filter((s) => s !== id) : [...previous, id]));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    const next: Errors = {};
    if (!title.trim()) next.title = "Saisissez le titre de la publication.";
    if (level === "regional" && !regionId) next.regionId = "Choisissez la région concernée.";
    if (!thematiqueId) next.thematiqueId = "Choisissez une thématique.";
    if (!date) next.date = "Indiquez la date de publication.";
    if (!excerpt.trim()) next.excerpt = "Rédigez un court extrait.";
    if (!content.trim()) next.content = "Rédigez le contenu de la publication.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      focusFirstInvalid(formRef.current);
      return;
    }

    setSaving(true);
    try {
      await savePublication(
        {
          title: title.trim(),
          imageUrl,
          level,
          regionId: level === "regional" ? regionId : undefined,
          thematiqueId,
          excerpt: excerpt.trim(),
          content: content.trim(),
          documents,
          date,
          latestNipc,
          sectors: selectedSectors,
        },
        initial?.id,
      );
      notify(initial ? "Publication modifiée." : "Publication créée.");
      navigate("#/admin/publications");
    } catch (error) {
      notify(errorMessage(error), "error");
      setSaving(false);
    }
  }

  const errorCount = Object.keys(errors).length;

  return (
    <>
      <PageHeader
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Publications", href: "#/admin/publications" },
              { label: initial ? "Modifier" : "Nouvelle publication" },
            ]}
          />
        }
        title={initial ? "Modifier la publication" : "Nouvelle publication"}
        description="Les champs marqués d'une étoile sont obligatoires."
      />

      <form ref={formRef} onSubmit={submit} noValidate className="max-w-4xl space-y-6">
        {errorCount > 0 && (
          <p role="alert" className="border-l-[3px] border-laterite bg-laterite/[0.06] px-4 py-3 text-sm text-laterite">
            Le formulaire contient {errorCount} erreur{errorCount > 1 ? "s" : ""}. Corrigez les champs signalés pour enregistrer.
          </p>
        )}

        <Section number="01" title="Informations générales">
          <Field label="Titre" required error={errors.title}>
            {(aria) => <input {...aria} className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />}
          </Field>

          <fieldset>
            <legend className="text-sm font-medium">
              Niveau <span aria-hidden="true" className="text-laterite">*</span>
            </legend>
            <div className="mt-1.5 flex gap-6">
              {(
                [
                  ["national", "National"],
                  ["regional", "Régional"],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-2 text-[0.95rem]">
                  <input
                    type="radio"
                    name="level"
                    value={value}
                    checked={level === value}
                    onChange={() => setLevel(value)}
                    className="size-4 accent-paddy"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Région"
              required={level === "regional"}
              hint={level === "national" ? "Réservé aux publications régionales." : undefined}
              error={errors.regionId}
            >
              {(aria) => (
                <select
                  {...aria}
                  className={inputClass}
                  value={level === "regional" ? regionId : ""}
                  disabled={level === "national"}
                  onChange={(e) => setRegionId(e.target.value)}
                >
                  <option value="">Choisir une région</option>
                  {sortedRegions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>

            <Field label="Thématique" required error={errors.thematiqueId}>
              {(aria) => (
                <select {...aria} className={inputClass} value={thematiqueId} onChange={(e) => setThematiqueId(e.target.value)}>
                  <option value="">Choisir une thématique</option>
                  {sortedThematiques.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>

          <div className="sm:max-w-xs">
            <Field label="Date de publication" required error={errors.date}>
              {(aria) => <input {...aria} type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />}
            </Field>
          </div>
        </Section>

        <Section number="02" title="Image du titre">
          <ImageUpload
            label="Image"
            hint="Seule une image de 900 × 600 pixels est acceptée."
            value={imageUrl}
            onChange={setImageUrl}
            exact={{ width: 900, height: 600 }}
          />
        </Section>

        <Section number="03" title="Contenu">
          <Field label="Extrait" required error={errors.excerpt} hint="Résumé affiché dans les listes de publications.">
            {(aria) => (
              <>
                <textarea
                  {...aria}
                  rows={3}
                  maxLength={EXCERPT_MAX}
                  className={textareaClass}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
                <p className="mt-1 text-right text-xs text-muted tabular-nums">
                  {excerpt.length} / {EXCERPT_MAX}
                </p>
              </>
            )}
          </Field>
          <Field label="Contenu" required error={errors.content}>
            {(aria) => (
              <textarea {...aria} rows={12} className={textareaClass} value={content} onChange={(e) => setContent(e.target.value)} />
            )}
          </Field>
        </Section>

        <Section number="04" title="Documents à télécharger" description="Fichiers que les visiteurs pourront télécharger depuis la publication.">
          <div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.zip"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => {
                void addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <FilePlus className="size-4" aria-hidden="true" />
              Cliquer ici pour charger les documents
            </Button>
            {uploading > 0 && (
              <p role="status" className="mt-2 flex items-center gap-2 text-sm text-muted">
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                Envoi en cours ({uploading} fichier{uploading > 1 ? "s" : ""})…
              </p>
            )}
          </div>

          {documents.length > 0 ? (
            <ul className="divide-y divide-line border border-line">
              {documents.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[0.95rem]">
                  <span className="min-w-0">
                    <a
                      href={fileUrl(doc.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate font-medium text-paddy underline decoration-paddy/30 underline-offset-4 hover:decoration-paddy"
                    >
                      {doc.name}
                    </a>
                    <span className="font-mono text-xs text-muted">{formatBytes(doc.size)}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Retirer le document ${doc.name}`}
                    onClick={() => setDocuments((previous) => previous.filter((d) => d.id !== doc.id))}
                  >
                    <X className="size-4" aria-hidden="true" />
                    Retirer
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Aucun document chargé.</p>
          )}
        </Section>

        <Section number="05" title="Classement">
          <Checkbox
            label="La plus récente publication NIPC"
            hint="Une seule publication peut porter ce marqueur : en cochant cette case, vous le retirez de la précédente."
            checked={latestNipc}
            onChange={(e) => setLatestNipc(e.target.checked)}
          />

          <fieldset>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <legend className="text-sm font-medium">Secteurs concernés</legend>
              <div className="flex items-center gap-1 text-sm">
                <span className="mr-2 font-mono text-xs text-muted tabular-nums">
                  {selectedSectors.length} sur {sectors.length}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSectors(sectors.map((s) => s.id))}>
                  Tout cocher
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSectors([])}>
                  Tout décocher
                </Button>
              </div>
            </div>
            <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {sectors.map((sector) => (
                <Checkbox
                  key={sector.id}
                  label={sector.label}
                  checked={selectedSectors.includes(sector.id)}
                  onChange={() => toggleSector(sector.id)}
                />
              ))}
            </div>
          </fieldset>
        </Section>

        <div className="sticky bottom-0 z-10 -mx-4 flex justify-end gap-2 border-t-2 border-ink bg-paper/95 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0">
          <a href="#/admin/publications" className={buttonClass("secondary")}>
            Annuler
          </a>
          <Button type="submit" variant="primary" disabled={saving || uploading > 0}>
            {saving ? "Enregistrement…" : uploading > 0 ? "Envoi des fichiers…" : "Enregistrer la publication"}
          </Button>
        </div>
      </form>
    </>
  );
}

export default function PublicationFormPage({ id }: { id?: string }) {
  const { publications } = useAdminData();
  const existing = id ? publications.items.find((p) => p.id === id) : undefined;

  if (id && !existing) {
    return <NotFoundPanel homeHref="#/admin/publications" message="Cette publication n'existe pas ou a été supprimée." />;
  }
  return <PublicationForm key={id ?? "new"} initial={existing} />;
}
