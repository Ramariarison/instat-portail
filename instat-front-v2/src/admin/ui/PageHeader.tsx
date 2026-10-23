import type { ReactNode } from "react";
import { useAdminSection } from "./SectionContext";

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted">
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
          <span className="font-medium text-laterite tabular-nums">{section.number}</span>
          <span>{section.group}</span>
        </p>
      )}
      {breadcrumb && <div className="mt-4">{breadcrumb}</div>}

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-[2.4rem] leading-[1.02] font-normal tracking-[-0.02em] text-balance sm:text-[2.9rem]">
            {title}
            {count !== undefined && " "}
            {count !== undefined && (
              <span className="ml-1 align-super font-mono text-sm font-normal tracking-normal text-muted tabular-nums">
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

/** Titre de bloc à l'intérieur d'une page (formulaire, carte…), numéroté comme un sous-chapitre. */
export function BlockTitle({ number, children, as: Tag = "h2" }: { number?: string; children: ReactNode; as?: "h2" | "h3" }) {
  return (
    <Tag className="flex items-baseline gap-3 font-display text-[1.55rem] leading-tight font-normal tracking-[-0.01em]">
      {number && <span className="font-mono text-xs font-normal tracking-normal text-laterite tabular-nums">{number}</span>}
      <span>{children}</span>
    </Tag>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border border-t-2 border-line border-t-ink bg-white px-6 py-14 text-center">
      <p className="font-mono text-xs text-muted">0 résultat</p>
      <p className="mt-3 font-display text-2xl font-normal">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-muted">{children}</div>}
    </div>
  );
}
