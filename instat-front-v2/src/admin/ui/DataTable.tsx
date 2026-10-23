import type { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Button, { buttonClass } from "./Button";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  align?: "right";
}

interface DataTableProps<T extends { id: string }> {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  /** Affiché à la place du tableau quand il n'y a aucune ligne. */
  empty: ReactNode;
}

export default function DataTable<T extends { id: string }>({ caption, columns, rows, empty }: DataTableProps<T>) {
  if (rows.length === 0) return <>{empty}</>;

  return (
    <div className="overflow-x-auto border border-t-2 border-line border-t-ink bg-white">
      <table className="w-full min-w-max text-left text-[0.95rem]">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-rule bg-white font-mono text-xs text-muted">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 pt-3.5 pb-3 font-normal whitespace-nowrap ${column.align === "right" ? "text-right" : ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-paddy-soft/40">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3.5 align-middle ${column.align === "right" ? "text-right" : ""} ${column.className ?? ""}`}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface RowActionsProps {
  /** Nom de l'élément, repris dans les libellés accessibles (« Modifier : Santé »). */
  label: string;
  onEdit?: () => void;
  editHref?: string;
  onDelete?: () => void;
  extra?: ReactNode;
}

export function RowActions({ label, onEdit, editHref, onDelete, extra }: RowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      {extra}
      {editHref && (
        <a href={editHref} aria-label={`Modifier : ${label}`} className={buttonClass("ghost", "sm")}>
          <Pencil className="size-4" aria-hidden="true" />
          Modifier
        </a>
      )}
      {onEdit && (
        <Button variant="ghost" size="sm" aria-label={`Modifier : ${label}`} onClick={onEdit}>
          <Pencil className="size-4" aria-hidden="true" />
          Modifier
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Supprimer : ${label}`}
          onClick={onDelete}
          className="text-laterite hover:bg-laterite/10"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Supprimer
        </Button>
      )}
    </div>
  );
}

/** Intitulé principal d'une ligne (nom, titre) : en serif, comme les titres du site. */
export const cellTitleClass = "font-display text-[1.07rem] leading-snug";
