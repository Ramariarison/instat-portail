import { formatNumber } from "../../../lib/format";
import type { PublicationStats } from "../../data/types";
import Badge from "../../ui/Badge";

/**
 * Publications en ligne : répartition national / régional (une barre en deux segments, valeurs écrites dans la
 * légende), puis une barre par thématique (une seule couleur, valeur toujours écrite). Les thématiques vides sont
 * regroupées à part : elles appellent un contenu.
 */
export default function ThematiqueCoverage({ rows, byLevel }: { rows: PublicationStats["byThematique"]; byLevel: PublicationStats["publishedByLevel"] }) {
  const filled = rows.filter((row) => row.published > 0);
  const empty = rows.filter((row) => row.published === 0);
  const max = Math.max(1, ...filled.map((row) => row.published));
  const total = byLevel.national + byLevel.regional;
  const share = (n: number) => (total === 0 ? 0 : (n / total) * 100);

  return (
    <>
      <div>
        <div className="flex h-2.5 overflow-hidden bg-paddy-soft" aria-hidden="true">
          <div className="bg-paddy" style={{ width: `${share(byLevel.national)}%` }} />
          <div className="bg-[#6fa58c]" style={{ width: `${share(byLevel.regional)}%` }} />
        </div>
        <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="size-2.5 bg-paddy" />
            Nationales <strong className="tabular-nums">{formatNumber(byLevel.national)}</strong>
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="size-2.5 bg-[#6fa58c]" />
            Régionales <strong className="tabular-nums">{formatNumber(byLevel.regional)}</strong>
          </span>
        </p>
      </div>

      <table className="mt-5 w-full text-sm">
        <caption className="sr-only">Nombre de publications en ligne par thématique</caption>
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">
            <th scope="col" className="pb-2 font-medium">Thématique</th>
            <th scope="col" className="pb-2 text-right font-medium">En ligne</th>
          </tr>
        </thead>
        <tbody>
          {filled.map((row) => (
            <tr key={row.thematiqueId} className="border-b border-line last:border-b-0">
              <th scope="row" className="w-[42%] py-2 pr-4 text-left font-normal">
                {row.name}
              </th>
              <td className="py-2">
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 bg-paper" aria-hidden="true">
                    <div className="h-full bg-paddy" style={{ width: `${(row.published / max) * 100}%` }} />
                  </div>
                  <span className="w-7 text-right font-semibold tabular-nums">{formatNumber(row.published)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {empty.length > 0 && (
        <div className="mt-4 border-t border-line pt-3">
          <p className="text-xs text-muted">
            Sans publication en ligne ({empty.length}) :
          </p>
          <p className="mt-2 flex flex-wrap gap-1.5">
            {empty.map((row) => (
              <Badge key={row.thematiqueId} tone="red">
                {row.name}
              </Badge>
            ))}
          </p>
        </div>
      )}
    </>
  );
}
