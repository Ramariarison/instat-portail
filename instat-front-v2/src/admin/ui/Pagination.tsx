import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

/** `resetKey` : valeur qui change quand la recherche ou un filtre change, pour revenir à la page 1. */
export function usePagination<T>(items: T[], pageSize: number, resetKey: string) {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [resetKey]);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pageCount);
  const pageItems = useMemo(
    () => items.slice((current - 1) * pageSize, current * pageSize),
    [items, current, pageSize],
  );

  return { page: current, setPage, pageCount, pageItems, total: items.length, pageSize };
}

interface PaginationProps {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pageCount, total, pageSize, onChange }: PaginationProps) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-4 font-mono text-xs text-muted">
      <p>
        {from}–{to} sur {total}
      </p>
      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <Button size="sm" aria-label="Page précédente" disabled={page <= 1} onClick={() => onChange(page - 1)}>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <span aria-current="page" className="tabular-nums">
            Page {page} / {pageCount}
          </span>
          <Button size="sm" aria-label="Page suivante" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </nav>
  );
}
