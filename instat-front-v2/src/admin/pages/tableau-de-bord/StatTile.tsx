import { ArrowRight, type LucideIcon } from "lucide-react";
import { formatNumber } from "../../../lib/format";

interface StatTileProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Complément sous le chiffre (« dont 2 ces 30 jours »). */
  detail?: string;
  /** Lien vers la liste correspondante. */
  href?: string;
  /** Mise en avant : chiffre qui appelle une action (à valider, à corriger). */
  emphasis?: boolean;
}

/** Un chiffre clé : le nombre est le graphique (pas de barre ni de camembert pour une seule valeur). */
export default function StatTile({ label, value, icon: Icon, detail, href, emphasis = false }: StatTileProps) {
  const alert = emphasis && value > 0;

  return (
    <div className={`flex flex-col border border-line bg-white p-5 ${alert ? "border-t-[3px] border-t-laterite" : ""}`}>
      <div className="flex min-h-10 items-start justify-between gap-3">
        <dt className="text-sm font-medium text-muted">{label}</dt>
        <span
          aria-hidden="true"
          className={`flex size-9 shrink-0 items-center justify-center ${alert ? "bg-laterite/10 text-laterite" : "bg-paddy-soft text-paddy"}`}
        >
          <Icon className="size-[1.1rem]" />
        </span>
      </div>
      <dd className="mt-1 flex flex-1 flex-col">
        <span className="text-4xl leading-none font-bold tracking-[-0.02em] tabular-nums">{formatNumber(value)}</span>
        {detail && <span className="mt-2 text-xs text-muted">{detail}</span>}
        {href && (
          <a href={href} className="group mt-auto inline-flex w-fit items-center gap-1 pt-4 text-sm font-medium text-paddy hover:underline underline-offset-4">
            Voir la liste
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        )}
      </dd>
    </div>
  );
}
