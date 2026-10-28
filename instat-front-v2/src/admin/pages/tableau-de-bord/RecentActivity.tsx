import { formatDateTime } from "../../../lib/format";
import type { PublicationActivity } from "../../data/types";

const actionLabels: Record<PublicationActivity["action"], string> = {
  submitted: "a soumis",
  returned: "a renvoyé",
  published: "a mis en ligne",
};

/** Dernières étapes du circuit de validation, toutes publications confondues. */
export default function RecentActivity({ items }: { items: PublicationActivity[] }) {
  if (items.length === 0) return <p className="text-sm text-muted">Aucune activité pour le moment.</p>;

  return (
    <ol>
      {items.map((item) => (
        <li key={item.id} className="border-b border-line py-2.5 text-[0.95rem] first:pt-0 last:border-b-0">
          <p className="font-mono text-xs text-muted">{formatDateTime(item.createdAt)}</p>
          <p className="mt-0.5">
            {item.authorName} {actionLabels[item.action]}{" "}
            <a
              href={`#/admin/publications/modifier/${item.publicationId}`}
              className="font-medium decoration-paddy/40 underline-offset-4 hover:text-paddy hover:underline"
            >
              {item.title}
            </a>
          </p>
          {item.comment && <p className="mt-0.5 line-clamp-2 text-sm text-muted">« {item.comment} »</p>}
        </li>
      ))}
    </ol>
  );
}
