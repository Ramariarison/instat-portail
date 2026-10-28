import { useAdminData } from "../../data/AdminDataContext";
import { formatNumber } from "../../../lib/format";

/** « Madagascar en chiffres » : fiches régionales renseignées, et celles qui n'ont encore aucune donnée. */
export default function DataCoverage() {
  const { figureRegions, figureValues } = useAdminData();
  const withValues = new Set(figureValues.items.map((value) => value.figureRegionId));
  const missing = figureRegions.items.filter((region) => !withValues.has(region.id));

  return (
    <>
      <dl className="grid grid-cols-2 gap-4">
        <div>
          <dt className="text-sm text-muted">Fiches renseignées</dt>
          <dd className="mt-1 font-display text-[2rem] leading-none font-light tabular-nums">
            {formatNumber(figureRegions.items.length - missing.length)}
            <span className="ml-1 font-mono text-xs text-muted">/ {formatNumber(figureRegions.items.length)}</span>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Valeurs saisies</dt>
          <dd className="mt-1 font-display text-[2rem] leading-none font-light tabular-nums">{formatNumber(figureValues.items.length)}</dd>
        </div>
      </dl>
      {missing.length > 0 ? (
        <div className="mt-4 border-t border-line pt-3">
          <p className="text-sm text-muted">Sans aucune donnée :</p>
          <p className="mt-1 text-[0.95rem] leading-relaxed">
            {missing
              .map((region) => region.name)
              .sort((a, b) => a.localeCompare(b, "fr"))
              .join(", ")}
          </p>
        </div>
      ) : (
        <p className="mt-4 border-t border-line pt-3 text-sm text-muted">Toutes les fiches ont au moins une donnée.</p>
      )}
    </>
  );
}
