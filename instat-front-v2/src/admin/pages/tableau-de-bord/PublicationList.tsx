import type { ReactNode } from "react";
import { formatDate } from "../../../lib/format";
import type { AdminPublication } from "../../data/types";

/** Liste courte de publications : titre (lien vers la fiche), date, et une ligne de détail facultative. */
export default function PublicationList({
  items,
  empty,
  detail,
  limit = 5,
}: {
  items: AdminPublication[];
  empty: string;
  detail?: (publication: AdminPublication) => ReactNode;
  limit?: number;
}) {
  if (items.length === 0) return <p className="text-sm text-muted">{empty}</p>;

  return (
    <ul>
      {items.slice(0, limit).map((publication) => (
        <li key={publication.id} className="border-b border-line py-2.5 first:pt-0 last:border-b-0">
          <a
            href={`#/admin/publications/modifier/${publication.id}`}
            className="font-display text-[1.05rem] leading-snug decoration-paddy/40 underline-offset-4 hover:text-paddy hover:underline"
          >
            {publication.title}
          </a>
          <p className="mt-0.5 font-mono text-xs text-muted">
            {formatDate(publication.date)}
            {publication.createdByName && ` · ${publication.createdByName}`}
          </p>
          {detail?.(publication)}
        </li>
      ))}
      {items.length > limit && (
        <li className="pt-2.5 font-mono text-xs text-muted">et {items.length - limit} autre{items.length - limit > 1 ? "s" : ""}…</li>
      )}
    </ul>
  );
}
