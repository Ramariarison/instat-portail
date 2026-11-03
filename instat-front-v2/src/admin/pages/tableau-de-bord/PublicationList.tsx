import type { ReactNode } from "react";
import { formatDate } from "../../../lib/format";
import type { AdminPublication } from "../../data/types";

/** Liste courte de publications : titre (lien vers la fiche), auteur, date, et une ligne de détail facultative. */
export default function PublicationList({
  items,
  empty,
  detail,
  limit = 5,
}: {
  items: AdminPublication[];
  /** Affiché quand la liste est vide (voir EmptyState). */
  empty: ReactNode;
  detail?: (publication: AdminPublication) => ReactNode;
  limit?: number;
}) {
  if (items.length === 0) return <>{empty}</>;

  return (
    <ul className="-my-1">
      {items.slice(0, limit).map((publication) => (
        <li key={publication.id} className="flex items-start justify-between gap-4 border-b border-line py-3 last:border-b-0">
          <div className="min-w-0">
            <a
              href={`#/admin/publications/modifier/${publication.id}`}
              className="text-[0.95rem] leading-snug font-semibold hover:text-paddy hover:underline underline-offset-4"
            >
              {publication.title}
            </a>
            {publication.createdByName && <p className="mt-0.5 text-xs text-muted">par {publication.createdByName}</p>}
            {detail?.(publication)}
          </div>
          <span className="shrink-0 pt-0.5 text-xs whitespace-nowrap text-muted tabular-nums">{formatDate(publication.date)}</span>
        </li>
      ))}
      {items.length > limit && (
        <li className="pt-3 text-xs text-muted">
          et {items.length - limit} autre{items.length - limit > 1 ? "s" : ""}…
        </li>
      )}
    </ul>
  );
}
