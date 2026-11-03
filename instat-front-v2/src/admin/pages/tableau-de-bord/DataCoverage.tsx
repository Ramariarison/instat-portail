import { useAdminData } from "../../data/AdminDataContext";
import { formatNumber } from "../../../lib/format";
import Badge from "../../ui/Badge";

/** Régions affichées avant « et N autres ». */
const SHOWN = 10;

/** « Madagascar en chiffres » : part des fiches régionales renseignées, valeurs saisies, fiches encore vides. */
export default function DataCoverage() {
  const { figureRegions, figureValues } = useAdminData();
  const withValues = new Set(figureValues.items.map((value) => value.figureRegionId));
  const missing = figureRegions.items
    .filter((region) => !withValues.has(region.id))
    .map((region) => region.name)
    .sort((a, b) => a.localeCompare(b, "fr"));
  const total = figureRegions.items.length;
  const done = total - missing.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm">
          <strong className="text-2xl font-bold tabular-nums">{formatNumber(done)}</strong>
          <span className="text-muted"> / {formatNumber(total)} fiches renseignées</span>
        </p>
        <span className="text-sm font-semibold tabular-nums text-paddy">{percent} %</span>
      </div>
      <div
        role="progressbar"
        aria-label="Fiches régionales renseignées"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-2 h-2 bg-paddy-soft"
      >
        <div className="h-full bg-paddy" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-3 text-sm text-muted">
        <strong className="font-semibold text-ink tabular-nums">{formatNumber(figureValues.items.length)}</strong> valeurs saisies
      </p>

      {missing.length > 0 ? (
        <div className="mt-4 border-t border-line pt-3">
          <p className="text-xs text-muted">Sans aucune donnée ({missing.length}) :</p>
          <p className="mt-2 flex flex-wrap gap-1.5">
            {missing.slice(0, SHOWN).map((name) => (
              <Badge key={name} tone="outline">
                {name}
              </Badge>
            ))}
            {missing.length > SHOWN && <span className="self-center text-xs text-muted">et {missing.length - SHOWN} autres</span>}
          </p>
        </div>
      ) : (
        <p className="mt-4 border-t border-line pt-3 text-sm text-muted">Toutes les fiches ont au moins une donnée.</p>
      )}
    </>
  );
}
