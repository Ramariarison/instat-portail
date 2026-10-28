import { formatNumber } from "../../../lib/format";

interface StatTileProps {
  label: string;
  value: number;
  /** Complément sous le chiffre (« dont 2 ces 30 jours »). */
  detail?: string;
  /** Lien vers la liste correspondante. */
  href?: string;
  /** Mise en avant : chiffre qui appelle une action (à valider, à corriger). */
  emphasis?: boolean;
}

/** Un chiffre clé : le nombre est le graphique (pas de barre ni de camembert pour une seule valeur). */
export default function StatTile({ label, value, detail, href, emphasis = false }: StatTileProps) {
  const body = (
    <>
      <dt className="flex items-baseline gap-2 text-[0.95rem] text-muted">
        {emphasis && value > 0 && <span aria-hidden="true" className="size-1.5 shrink-0 translate-y-[-0.1em] bg-laterite" />}
        {label}
      </dt>
      <dd className="mt-3">
        <span className="block font-display text-[2.9rem] leading-none font-light tracking-[-0.02em] tabular-nums group-hover:text-paddy">
          {formatNumber(value)}
        </span>
        {detail && <span className="mt-2 block font-mono text-xs text-muted">{detail}</span>}
      </dd>
    </>
  );

  return (
    <div className="border-b border-line py-5 sm:border-b-0 sm:px-5 sm:first:pl-0 sm:[&+&]:border-l">
      {href ? (
        <a href={href} className="group block">
          {body}
        </a>
      ) : (
        body
      )}
    </div>
  );
}
