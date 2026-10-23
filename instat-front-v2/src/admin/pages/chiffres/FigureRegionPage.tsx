import { useId, useMemo, useRef, useState, type FormEvent } from "react";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { formatValue, matches, parseNumber } from "../../../lib/format";
import { useAdminData } from "../../data/AdminDataContext";
import type { FigureValue } from "../../data/types";
import { NotFoundPanel } from "../../layout/Panels";
import { usePermissions } from "../../usePermissions";
import Button, { buttonClass } from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";
import DataTable, { cellTitleClass, RowActions, type Column } from "../../ui/DataTable";
import Field from "../../ui/Field";
import { focusFirstInvalid, FormActions } from "../../ui/form";
import { inputClass } from "../../ui/inputs";
import Modal from "../../ui/Modal";
import PageHeader, { Breadcrumb, EmptyState } from "../../ui/PageHeader";
import { Pagination, usePagination } from "../../ui/Pagination";
import SearchInput from "../../ui/SearchInput";
import { useAction } from "../../useAction";

const UNIT_SUGGESTIONS = ["km²", "habitants", "hab/km²", "milliards d'Ar", "%", "ha"];
const SOURCE_SUGGESTIONS = [
  "Rapport thématique",
  "INSTAT/DIRECT",
  "NIPC 2021",
  "Annuaire ONE",
  "ENSOMD 2012",
  "MICS6 – Madagascar",
];

const isHttpLink = (text: string) => /^https?:\/\/\S+$/i.test(text);

interface Row {
  id: string;
  value: FigureValue;
  typeName: string;
  indicatorName: string;
}

type FormErrors = Partial<Record<"typeId" | "indicatorId" | "year" | "value" | "unit" | "source" | "link", string>>;

function ValueForm({
  initial,
  figureRegionId,
  existing,
  onSave,
  onCancel,
}: {
  initial?: FigureValue;
  figureRegionId: string;
  /** Valeurs déjà saisies pour cette région, pour refuser un doublon (même indicateur, même année). */
  existing: FigureValue[];
  onSave: (draft: Omit<FigureValue, "id">) => void;
  onCancel: () => void;
}) {
  const { dataTypes, indicators } = useAdminData();
  const formRef = useRef<HTMLFormElement>(null);
  const unitListId = useId();
  const sourceListId = useId();

  const [typeId, setTypeId] = useState(
    () => indicators.items.find((indicator) => indicator.id === initial?.indicatorId)?.typeId ?? "",
  );
  const [indicatorId, setIndicatorId] = useState(initial?.indicatorId ?? "");
  const [year, setYear] = useState(initial ? String(initial.year) : "");
  const [value, setValue] = useState(initial ? String(initial.value).replace(".", ",") : "");
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [source, setSource] = useState(initial?.source ?? "");
  const [link, setLink] = useState(initial?.link ?? "");
  const [errors, setErrors] = useState<FormErrors>({});

  const typeIndicators = indicators.items.filter((indicator) => indicator.typeId === typeId);

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: FormErrors = {};
    const yearNumber = Number(year);
    const parsed = parseNumber(value);

    if (!typeId) next.typeId = "Choisissez un type de données.";
    if (!indicatorId) next.indicatorId = "Choisissez un indicateur.";
    if (!/^\d{4}$/.test(year.trim()) || yearNumber < 1900 || yearNumber > 2100)
      next.year = "Saisissez une année à 4 chiffres, par exemple 2018.";
    else if (
      indicatorId &&
      existing.some((v) => v.id !== initial?.id && v.indicatorId === indicatorId && v.year === yearNumber)
    )
      next.year = "Une valeur existe déjà pour cet indicateur et cette année. Modifiez-la plutôt.";
    if (parsed === null) next.value = "Saisissez un nombre, par exemple 4,5 ou 25 000.";
    if (!unit.trim()) next.unit = "Indiquez l'unité (km², habitants, %…).";
    if (!source.trim()) next.source = "Indiquez la source de la donnée.";
    if (link.trim() && !isHttpLink(link.trim())) next.link = "Saisissez une adresse complète, commençant par https://";

    setErrors(next);
    if (Object.keys(next).length > 0 || parsed === null) {
      focusFirstInvalid(formRef.current);
      return;
    }
    onSave({
      figureRegionId,
      indicatorId,
      year: yearNumber,
      value: parsed,
      unit: unit.trim(),
      source: source.trim(),
      link: link.trim() || undefined,
    });
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Type de données" required error={errors.typeId}>
          {(aria) => (
            <select
              {...aria}
              className={inputClass}
              value={typeId}
              onChange={(event) => {
                setTypeId(event.target.value);
                setIndicatorId("");
              }}
            >
              <option value="">Choisir un type…</option>
              {dataTypes.items.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Indicateur" required error={errors.indicatorId}>
          {(aria) => (
            <select
              {...aria}
              className={inputClass}
              value={indicatorId}
              disabled={!typeId}
              onChange={(event) => setIndicatorId(event.target.value)}
            >
              <option value="">{typeId ? "Choisir un indicateur…" : "Choisissez d'abord un type"}</option>
              {typeIndicators.map((indicator) => (
                <option key={indicator.id} value={indicator.id}>
                  {indicator.name}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Année" required error={errors.year}>
          {(aria) => (
            <input
              {...aria}
              className={inputClass}
              inputMode="numeric"
              maxLength={4}
              value={year}
              autoComplete="off"
              onChange={(event) => setYear(event.target.value)}
            />
          )}
        </Field>
        <Field label="Valeur" required error={errors.value}>
          {(aria) => (
            <input
              {...aria}
              className={inputClass}
              inputMode="decimal"
              value={value}
              autoComplete="off"
              onChange={(event) => setValue(event.target.value)}
            />
          )}
        </Field>
        <Field label="Unité" required error={errors.unit}>
          {(aria) => (
            <>
              <input
                {...aria}
                className={inputClass}
                list={unitListId}
                value={unit}
                autoComplete="off"
                onChange={(event) => setUnit(event.target.value)}
              />
              <datalist id={unitListId}>
                {UNIT_SUGGESTIONS.map((suggestion) => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
            </>
          )}
        </Field>
      </div>

      <Field label="Source" required error={errors.source}>
        {(aria) => (
          <>
            <input
              {...aria}
              className={inputClass}
              list={sourceListId}
              value={source}
              autoComplete="off"
              onChange={(event) => setSource(event.target.value)}
            />
            <datalist id={sourceListId}>
              {SOURCE_SUGGESTIONS.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          </>
        )}
      </Field>

      <Field label="Lien" hint="Facultatif : adresse du document source." error={errors.link}>
        {(aria) => (
          <input
            {...aria}
            className={inputClass}
            type="url"
            inputMode="url"
            placeholder="https://www.instat.mg/…"
            value={link}
            autoComplete="off"
            onChange={(event) => setLink(event.target.value)}
          />
        )}
      </Field>

      <FormActions onCancel={onCancel} />
    </form>
  );
}

export default function FigureRegionPage({ id, edit }: { id: string; edit: boolean }) {
  const { figureRegions, figureValues, indicators, dataTypes } = useAdminData();
  const { canCreate, canUpdate, canDelete } = usePermissions("figures");
  const run = useAction();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [editing, setEditing] = useState<FigureValue | "new" | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);

  const figure = figureRegions.items.find((f) => f.id === id);
  const own = useMemo(() => figureValues.items.filter((v) => v.figureRegionId === id), [figureValues.items, id]);

  const rows = useMemo<Row[]>(() => {
    const typeOrder = new Map(dataTypes.items.map((type, index) => [type.id, index]));
    const indicatorOrder = new Map(indicators.items.map((indicator, index) => [indicator.id, index]));
    return own
      .map((value) => {
        const indicator = indicators.items.find((i) => i.id === value.indicatorId);
        const type = dataTypes.items.find((t) => t.id === indicator?.typeId);
        return {
          id: value.id,
          value,
          typeName: type?.name ?? "—",
          indicatorName: indicator?.name ?? "Indicateur supprimé",
          typeId: indicator?.typeId ?? "",
        };
      })
      .filter(
        (row) =>
          (!typeFilter || row.typeId === typeFilter) &&
          matches(query, row.typeName, row.indicatorName, row.value.source, String(row.value.year)),
      )
      .sort(
        (a, b) =>
          (typeOrder.get(a.typeId) ?? 99) - (typeOrder.get(b.typeId) ?? 99) ||
          (indicatorOrder.get(a.value.indicatorId) ?? 0) - (indicatorOrder.get(b.value.indicatorId) ?? 0) ||
          b.value.year - a.value.year,
      );
  }, [own, indicators.items, dataTypes.items, query, typeFilter]);
  const pager = usePagination(rows, 15, `${query}|${typeFilter}`);

  if (!figure) {
    return (
      <NotFoundPanel
        homeHref="#/admin/chiffres/regions"
        message="Cette région n'existe pas dans « Données par régions », ou elle a été supprimée."
      />
    );
  }

  const viewHref = `#/admin/chiffres/regions/${figure.id}`;
  const editHref = `${viewHref}/modifier`;

  const columns: Column<Row>[] = [
    { key: "type", header: "Type", cell: (r) => <div className="max-w-[15rem]">{r.typeName}</div> },
    { key: "indicator", header: "Indicateur", cell: (r) => <div className={`max-w-[26rem] ${cellTitleClass}`}>{r.indicatorName}</div> },
    { key: "year", header: "Année", cell: (r) => <span className="font-mono text-[0.85rem] tabular-nums">{r.value.year}</span> },
    { key: "value", header: "Valeur", align: "right", cell: (r) => <span className="font-mono text-[0.85rem] tabular-nums">{formatValue(r.value.value)}</span> },
    { key: "unit", header: "Unité", cell: (r) => r.value.unit },
    { key: "source", header: "Source", cell: (r) => <div className="max-w-[14rem]">{r.value.source}</div> },
    {
      key: "link",
      header: "Lien",
      cell: (r) =>
        r.value.link && isHttpLink(r.value.link) ? (
          <a
            href={r.value.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ouvrir la source (nouvel onglet) : ${r.indicatorName}`}
            className="inline-flex items-center gap-1.5 text-paddy hover:underline"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Ouvrir
          </a>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    ...(edit
      ? [
          {
            key: "actions",
            header: "Actions",
            align: "right" as const,
            cell: (r: Row) => (
              <RowActions
                label={`${r.indicatorName} (${r.value.year})`}
                onEdit={canUpdate ? () => setEditing(r.value) : undefined}
                onDelete={canDelete ? () => setDeleting(r) : undefined}
              />
            ),
          },
        ]
      : []),
  ];

  async function save(draft: Omit<FigureValue, "id">) {
    if (!editing) return;
    const saved =
      editing === "new"
        ? await run(() => figureValues.add(draft), "Donnée ajoutée.")
        : await run(() => figureValues.update(editing.id, draft), "Donnée modifiée.");
    if (saved) setEditing(null);
  }

  return (
    <>
      <PageHeader
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Madagascar en chiffres", href: "#/admin/chiffres" },
              { label: "Données par régions", href: "#/admin/chiffres/regions" },
              { label: figure.name },
            ]}
          />
        }
        title={`Données région ${figure.name}`}
        description={
          edit
            ? "Ajoutez, corrigez ou supprimez les données de cette région."
            : `${own.length} donnée${own.length > 1 ? "s" : ""} pour cette région.`
        }
        actions={
          edit ? (
            <>
              {canCreate && (
                <Button variant="primary" onClick={() => setEditing("new")}>
                  <Plus className="size-4" aria-hidden="true" />
                  Ajouter une donnée
                </Button>
              )}
              <a href={viewHref} className={buttonClass("secondary")}>
                Terminer la modification
              </a>
            </>
          ) : (
            <>
              {canUpdate && (
                <a href={editHref} className={buttonClass("primary")}>
                  <Pencil className="size-4" aria-hidden="true" />
                  Modifier les données
                </a>
              )}
              <a href="#/admin/chiffres/regions" className={buttonClass("secondary")}>
                Retour à la liste
              </a>
            </>
          )
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <SearchInput value={query} onChange={setQuery} label="Rechercher une donnée" />
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
        caption={`Données de la région ${figure.name}`}
        columns={columns}
        rows={pager.pageItems}
        empty={
          <EmptyState title={own.length === 0 ? "Aucune donnée pour cette région" : "Aucune donnée trouvée"}>
            {own.length === 0
              ? edit
                ? "Cliquez sur « Ajouter une donnée » pour saisir la première."
                : "Cette région n'a pas encore de données."
              : "Modifiez votre recherche ou le filtre."}
          </EmptyState>
        }
      />
      <Pagination {...pager} onChange={pager.setPage} />

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        wide
        title={editing === "new" ? "Ajouter une donnée" : "Modifier la donnée"}
        description={`Région : ${figure.name}`}
      >
        {editing !== null && (
          <ValueForm
            initial={editing === "new" ? undefined : editing}
            figureRegionId={figure.id}
            existing={own}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer la donnée"
        message={`Supprimer « ${deleting?.indicatorName ?? ""} » (${deleting?.value.year ?? ""}) pour ${figure.name} ? Cette action est définitive.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await run(() => figureValues.remove(deleting.id), "Donnée supprimée.");
          setDeleting(null);
        }}
      />
    </>
  );
}
