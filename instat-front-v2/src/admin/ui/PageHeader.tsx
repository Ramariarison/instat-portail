import type { ReactNode } from "react";
import { useAdminSection } from "./SectionContext";

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && (
              <span aria-hidden="true" className="text-rule">
                /
              </span>
            )}
            {item.href ? (
              <a href={item.href} className="underline decoration-rule underline-offset-4 hover:text-paddy hover:decoration-paddy">
                {item.label}
              </a>
            ) : (
              <span aria-current="page" className="text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
  /** Nombre total d'éléments de la page, affiché en exposant après le titre. */
  count?: number;
}

export default function PageHeader({ title, description, actions, breadcrumb, count }: PageHeaderProps) {
  const section = useAdminSection();

  return (
    <header className="mb-8">
      {section && (
        <p className="running-head">
          <span aria-hidden="true" className="h-[3px] w-6 shrink-0 bg-laterite" />
          <span>{section.group}</span>
        </p>
      )}
      {breadcrumb && <div className="mt-4">{breadcrumb}</div>}

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl leading-tight font-bold tracking-[-0.01em] text-balance sm:text-4xl">
            {title}
            {count !== undefined && " "}
            {count !== undefined && (
              <span className="ml-1 align-super text-sm font-normal tracking-normal text-muted tabular-nums">
                ({count})
              </span>
            )}
          </h1>
          {description && <p className="mt-3 max-w-2xl text-[1.0125rem] leading-relaxed text-muted">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/** Titre de bloc à l'intérieur d'une page (formulaire, carte…). */
export function BlockTitle({ children, as: Tag = "h2" }: { children: ReactNode; as?: "h2" | "h3" }) {
  return <Tag className="text-[1.55rem] leading-tight font-semibold tracking-[-0.01em]">{children}</Tag>;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border border-t-2 border-line border-t-ink bg-white px-6 py-14 text-center">
      <p className="text-xs text-muted">0 résultat</p>
      <p className="mt-3 text-2xl font-semibold">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-muted">{children}</div>}
    </div>
  );
}
