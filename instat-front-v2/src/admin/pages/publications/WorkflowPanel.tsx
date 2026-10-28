import { useEffect, useState } from "react";
import { CircleAlert } from "lucide-react";
import { errorMessage } from "../../../lib/api";
import { formatDateTime } from "../../../lib/format";
import { useAdminData } from "../../data/AdminDataContext";
import type { AdminPublication, PublicationReview } from "../../data/types";
import Badge from "../../ui/Badge";
import { BlockTitle } from "../../ui/PageHeader";
import { statusLabels, statusTones } from "../../workflow";

const reviewLabels: Record<PublicationReview["action"], string> = {
  submitted: "Soumise à validation",
  returned: "Renvoyée pour correction",
  published: "Mise en ligne",
};

/** État de la publication dans le circuit de validation : statut, commentaire à corriger, historique. */
export default function WorkflowPanel({ publication, lockedReason }: { publication: AdminPublication; lockedReason?: string }) {
  const { loadReviews } = useAdminData();
  const [reviews, setReviews] = useState<PublicationReview[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Rechargé quand le statut change (soumission, renvoi, publication depuis cette page).
  useEffect(() => {
    let cancelled = false;
    loadReviews(publication.id).then(
      (items) => !cancelled && setReviews(items),
      (cause: unknown) => !cancelled && setError(errorMessage(cause, "Historique indisponible.")),
    );
    return () => {
      cancelled = true;
    };
  }, [loadReviews, publication.id, publication.status]);

  return (
    <section aria-labelledby="workflow-title" className="mb-6 max-w-4xl border border-t-2 border-line border-t-ink bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BlockTitle>
          <span id="workflow-title">Circuit de validation</span>
        </BlockTitle>
        <Badge tone={statusTones[publication.status]}>{statusLabels[publication.status]}</Badge>
      </div>
      {publication.createdByName && <p className="mt-1.5 text-sm text-muted">Rédigée par {publication.createdByName}.</p>}

      {publication.returnComment && (
        <div role="note" className="mt-5 flex gap-3 border-l-[3px] border-laterite bg-laterite/[0.06] px-4 py-3">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-laterite" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-laterite">À corriger avant de soumettre à nouveau</p>
            <p className="mt-1 text-[0.95rem] whitespace-pre-line">{publication.returnComment}</p>
          </div>
        </div>
      )}

      {lockedReason && <p className="mt-5 border-l-[3px] border-rule bg-paper px-4 py-3 text-sm">{lockedReason}</p>}

      <h3 className="mt-6 font-mono text-xs text-muted">Historique</h3>
      {error ? (
        <p className="mt-2 text-sm text-muted">{error}</p>
      ) : reviews === null ? (
        <p className="mt-2 text-sm text-muted">Chargement…</p>
      ) : reviews.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Pas encore soumise à validation.</p>
      ) : (
        <ol className="mt-2 border-t border-line">
          {reviews.map((review) => (
            <li key={review.id} className="grid gap-x-4 gap-y-0.5 border-b border-line py-2.5 text-sm sm:grid-cols-[11rem_minmax(0,1fr)]">
              <span className="font-mono text-xs text-muted">{formatDateTime(review.createdAt)}</span>
              <span>
                <span className="font-medium">{reviewLabels[review.action]}</span> · {review.authorName}
                {review.comment && <span className="mt-0.5 block whitespace-pre-line text-muted">« {review.comment} »</span>}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
