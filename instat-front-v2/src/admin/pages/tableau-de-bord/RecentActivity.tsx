import { History } from "lucide-react";
import { formatDateTime } from "../../../lib/format";
import type { PublicationActivity } from "../../data/types";
import { EmptyState } from "./Panel";

const actions: Record<PublicationActivity["action"], { label: string; dot: string }> = {
  submitted: { label: "a soumis", dot: "bg-rule" },
  returned: { label: "a renvoyé", dot: "bg-laterite" },
  published: { label: "a mis en ligne", dot: "bg-paddy" },
};

/** Dernières étapes du circuit de validation, toutes publications confondues, en fil chronologique. */
export default function RecentActivity({ items }: { items: PublicationActivity[] }) {
  if (items.length === 0) return <EmptyState icon={History}>Aucune activité pour le moment.</EmptyState>;

  return (
    <ol className="relative ml-1 border-l border-line">
      {items.map((item) => (
        <li key={item.id} className="relative pb-4 pl-5 last:pb-0">
          <span aria-hidden="true" className={`absolute top-1.5 -left-[5px] size-[9px] rounded-full ring-2 ring-white ${actions[item.action].dot}`} />
          <p className="text-[0.9rem] leading-snug">
            <span className="font-semibold">{item.authorName}</span> {actions[item.action].label}{" "}
            <a href={`#/admin/publications/modifier/${item.publicationId}`} className="text-paddy hover:underline underline-offset-4">
              {item.title}
            </a>
          </p>
          {item.comment && <p className="mt-1 line-clamp-2 text-sm text-muted">« {item.comment} »</p>}
          <p className="mt-1 text-xs text-muted">{formatDateTime(item.createdAt)}</p>
        </li>
      ))}
    </ol>
  );
}
