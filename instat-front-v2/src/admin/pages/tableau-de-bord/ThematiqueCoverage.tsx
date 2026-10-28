import { formatNumber } from "../../../lib/format";
import type { PublicationStats } from "../../data/types";

/**
 * Publications en ligne par thématique : tableau, avec une barre de longueur proportionnelle (une seule couleur,
 * la valeur est toujours écrite). Les thématiques vides sont signalées : elles appellent un contenu.
 */
export default function ThematiqueCoverage({ rows }: { rows: PublicationStats["byThematique"] }) {
  const max = Math.max(1, ...rows.map((row) => row.published));
  const empty = rows.filter((row) => row.published === 0).length;

  return (
    <>
      <table className="w-full text-[0.95rem]">
        <caption className="sr-only">Nombre de publications en ligne par thématique</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Thématique</th>
            <th scope="col">Publications en ligne</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.thematiqueId} className="border-b border-line last:border-b-0">
              <th scope="row" className="w-[45%] py-2 pr-4 text-left font-normal">
                {row.name}
              </th>
              <td className="py-2">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 flex-1" aria-hidden="true">
                    {row.published > 0 && (
                      <div
                        title={`${row.name} : ${row.published} publication${row.published > 1 ? "s" : ""} en ligne`}
                        className="h-full rounded-r-[4px] bg-paddy"
                        style={{ width: `${(row.published / max) * 100}%` }}
                      />
                    )}
                  </div>
                  <span className={`w-8 text-right font-mono text-xs tabular-nums ${row.published === 0 ? "text-laterite" : ""}`}>
                    {formatNumber(row.published)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {empty > 0 && (
        <p className="mt-3 border-t border-line pt-3 text-sm text-muted">
          {empty} thématique{empty > 1 ? "s" : ""} sans publication en ligne.
        </p>
      )}
    </>
  );
}
