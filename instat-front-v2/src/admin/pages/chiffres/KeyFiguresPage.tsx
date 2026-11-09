import { useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { byPeriodDesc, formatNumber, periodLabel } from "../../../lib/format";
import { useAdminData } from "../../data/AdminDataContext";
import type { FigureValue, KeyFigure } from "../../data/types";
import { usePermissions } from "../../usePermissions";
import Button from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";
import DataTable, { cellTitleClass, RowActions, type Column } from "../../ui/DataTable";
import Field from "../../ui/Field";
import { focusFirstInvalid, FormActions } from "../../ui/form";
import { inputClass } from "../../ui/inputs";
import Modal from "../../ui/Modal";
import PageHeader, { EmptyState } from "../../ui/PageHeader";
import { useAction } from "../../useAction";

type Draft = Omit<KeyFigure, "id" | "position">;

/** Valeur nationale la plus récente de chaque indicateur : celle que l'accueil affiche. */
function useLatestNational(): Map<string, FigureValue> {
  const { figureRegions, figureValues } = useAdminData();
  return useMemo(() => {
    const national = new Set(figureRegions.items.filter((f) => !f.regionId).map((f) => f.id));
    const latest = new Map<string, FigureValue>();
    for (const value of figureValues.items.filter((v) => national.has(v.figureRegionId)).sort(byPeriodDesc)) {
      if (!latest.has(value.indicatorId)) latest.set(value.indicatorId, value);
    }
    return latest;
  }, [figureRegions.items, figureValues.items]);
}

function shown(value: FigureValue | undefined, decimals: number): string | null {
  return value ? `${formatNumber(value.value, decimals)} ${value.unit} · ${periodLabel(value.year, value.month)}` : null;
}

function KeyFigureForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: KeyFigure;
  onSave: (draft: Draft) => void;
  onCancel: () => void;
}) {
  const { dataTypes, indicators, keyFigures } = useAdminData();
  const latest = useLatestNational();
  const formRef = useRef<HTMLFormElement>(null);
  const [indicatorId, setIndicatorId] = useState(initial?.indicatorId ?? "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [decimals, setDecimals] = useState(initial?.decimals ?? 0);
  const [error, setError] = useState<string>();

  // Un indicateur ne figure qu'une fois parmi les chiffres clés.
  const taken = new Set(keyFigures.items.filter((k) => k.id !== initial?.id).map((k) => k.indicatorId));
  const indicator = indicators.items.find((i) => i.id === indicatorId);
  const preview = shown(latest.get(indicatorId), decimals);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!indicatorId) {
      setError("Choisissez l'indicateur à mettre en avant.");
      focusFirstInvalid(formRef.current);
      return;
    }
    onSave({ indicatorId, label: label.trim() || undefined, decimals });
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-5">
      <Field label="Indicateur" required error={error}>
        {(aria) => (
          <select {...aria} className={inputClass} value={indicatorId} onChange={(event) => setIndicatorId(event.target.value)}>
            <option value="">Choisir un indicateur…</option>
            {dataTypes.items.map((type) => {
              const options = indicators.items.filter((i) => i.typeId === type.id && !taken.has(i.id));
              return (
                options.length > 0 && (
                  <optgroup key={type.id} label={type.name}>
                    {options.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </optgroup>
                )
              );
            })}
          </select>
        )}
      </Field>
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_9rem]">
        <Field label="Libellé à l'accueil" hint="Facultatif : par défaut, le nom de l'indicateur.">
          {(aria) => (
            <input
              {...aria}
              className={inputClass}
              value={label}
              placeholder={indicator?.name ?? ""}
              autoComplete="off"
              onChange={(event) => setLabel(event.target.value)}
            />
          )}
        </Field>
        <Field label="Décimales">
          {(aria) => (
            <select {...aria} className={inputClass} value={decimals} onChange={(event) => setDecimals(Number(event.target.value))}>
              {[0, 1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>
      {indicatorId && (
        <p className="border border-line bg-paper px-4 py-3 text-sm">
          {preview ? (
            <>
              À l'accueil : <strong className="font-semibold tabular-nums">{preview}</strong>
            </>
          ) : (
            <span className="text-laterite">
              Cet indicateur n'a pas encore de valeur nationale : il ne s'affichera pas tant qu'aucune valeur n'est saisie pour
              Madagascar dans « Données par régions ».
            </span>
          )}
        </p>
      )}
      <FormActions onCancel={onCancel} />
    </form>
  );
}

export default function KeyFiguresPage() {
  const { indicators, keyFigures } = useAdminData();
  const { canCreate, canUpdate, canDelete } = usePermissions("indicateurs");
  const run = useAction();
  const latest = useLatestNational();
  const [editing, setEditing] = useState<KeyFigure | "new" | null>(null);
  const [deleting, setDeleting] = useState<KeyFigure | null>(null);

  const rows = useMemo(
    () => keyFigures.items.slice().sort((a, b) => a.position - b.position || a.id.localeCompare(b.id)),
    [keyFigures.items],
  );
  const nameOf = (k: KeyFigure) => indicators.items.find((i) => i.id === k.indicatorId)?.name ?? "Indicateur supprimé";

  // Nouvel ordre : chaque chiffre clé reçoit son rang comme position (seuls ceux qui changent sont enregistrés).
  async function move(index: number, delta: number) {
    const order = rows.slice();
    [order[index], order[index + delta]] = [order[index + delta]!, order[index]!];
    await run(async () => {
      for (const [position, k] of order.entries()) if (k.position !== position) await keyFigures.update(k.id, { position });
    }, "Ordre enregistré.");
  }

  const columns: Column<KeyFigure>[] = [
    {
      key: "order",
      header: "Ordre",
      cell: (k) => {
        const index = rows.indexOf(k);
        return (
          <span className="flex items-center gap-1">
            <span className="w-5 text-[0.85rem] tabular-nums">{index + 1}</span>
            {canUpdate && (
              <>
                <Button variant="ghost" size="sm" aria-label={`Monter : ${nameOf(k)}`} disabled={index === 0} onClick={() => move(index, -1)}>
                  <ArrowUp className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Descendre : ${nameOf(k)}`}
                  disabled={index === rows.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="size-4" aria-hidden="true" />
                </Button>
              </>
            )}
          </span>
        );
      },
    },
    {
      key: "label",
      header: "Libellé à l'accueil",
      cell: (k) => (
        <div className="max-w-[26rem]">
          <span className={cellTitleClass}>{k.label ?? nameOf(k)}</span>
          {k.label && <span className="mt-0.5 block text-[0.85rem] text-muted">Indicateur : {nameOf(k)}</span>}
        </div>
      ),
    },
    {
      key: "value",
      header: "Valeur affichée",
      cell: (k) => {
        const text = shown(latest.get(k.indicatorId), k.decimals);
        return text ? (
          <span className="text-[0.85rem] whitespace-nowrap tabular-nums">{text}</span>
        ) : (
          <span className="text-[0.85rem] text-laterite">Aucune valeur nationale : masqué</span>
        );
      },
    },
    ...(canUpdate || canDelete
      ? [
          {
            key: "actions",
            header: "Actions",
            align: "right" as const,
            cell: (k: KeyFigure) => (
              <RowActions
                label={nameOf(k)}
                onEdit={canUpdate ? () => setEditing(k) : undefined}
                onDelete={canDelete ? () => setDeleting(k) : undefined}
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
        ? await run(
            () => keyFigures.add({ ...draft, position: rows.reduce((max, k) => Math.max(max, k.position + 1), 0) }),
            "Chiffre clé ajouté.",
          )
        : await run(() => keyFigures.update(editing.id, draft), "Chiffre clé modifié.");
    if (saved) setEditing(null);
  }

  return (
    <>
      <PageHeader
        title="Chiffres clés de l'accueil"
        count={rows.length}
        description="Les indicateurs mis en avant sur la page d'accueil, dans cet ordre. La valeur affichée est la plus récente de la fiche « Madagascar » (niveau national) dans « Données par régions »."
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setEditing("new")}>
              <Plus className="size-4" aria-hidden="true" />
              Ajouter un chiffre clé
            </Button>
          )
        }
      />

      <DataTable
        caption="Chiffres clés de l'accueil"
        columns={columns}
        rows={rows}
        empty={<EmptyState title="Aucun chiffre clé">La section « Madagascar en chiffres » de l'accueil reste vide.</EmptyState>}
      />

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        wide
        title={editing === "new" ? "Ajouter un chiffre clé" : "Modifier le chiffre clé"}
      >
        {editing !== null && (
          <KeyFigureForm initial={editing === "new" ? undefined : editing} onSave={save} onCancel={() => setEditing(null)} />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Retirer le chiffre clé"
        message={`Retirer « ${deleting ? (deleting.label ?? nameOf(deleting)) : ""} » de l'accueil ? L'indicateur et ses valeurs sont conservés.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await run(() => keyFigures.remove(deleting.id), "Chiffre clé retiré.");
          setDeleting(null);
        }}
      />
    </>
  );
}
