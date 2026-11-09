import { ArrowUpRight, ExternalLink } from "lucide-react";
import type { DataType, FigureValue, IndicatorDef } from "../../admin/data/types";
import { byPeriodDesc, formatValue, periodLabel } from "../../lib/format";
import RegionSilhouette from "./RegionSilhouette";

interface RegionSheetProps {
  name: string;
  national: boolean;
  /** Valeurs de cette région (ou du niveau national), toutes années confondues. */
  values: FigureValue[];
  types: DataType[];
  indicators: IndicatorDef[];
  /** Position de la région pour l'indicateur de la carte (« 3e sur 23 »). */
  rank?: { indicator: string; value: string; position: number; count: number };
  /** Publications régionales de cette région, s'il y en a une correspondante dans le service Publications. */
  publicationsHref?: string;
}

const SAFE_LINK = /^(https?:\/\/|\/|#)/i;

function ordinal(n: number): string {
  return n === 1 ? "1re" : `${n}e`;
}

/** Fiche d'une région : indicateurs groupés par type, dernière valeur en avant, valeurs précédentes en dessous. */
export default function RegionSheet({ name, national, values, types, indicators, rank, publicationsHref }: RegionSheetProps) {
  const groups = types
    .map((type) => ({
      type,
      rows: indicators
        .filter((indicator) => indicator.typeId === type.id)
        .map((indicator) => ({
          indicator,
          series: values.filter((v) => v.indicatorId === indicator.id).sort(byPeriodDesc),
        }))
        .filter((row) => row.series.length > 0),
    }))
    .filter((group) => group.rows.length > 0);

  return (
    <article aria-live="polite">
      <header className="border-t-2 border-ink pt-5">
        <div className="flex items-center gap-5">
          {!national && <RegionSilhouette name={name} className="size-16 text-paddy sm:size-20" />}
          <div>
            <p className="text-xs font-semibold tracking-[0.06em] text-laterite uppercase">{national ? "Niveau national" : "Région"}</p>
            <h2 className="mt-2 text-[1.75rem] leading-tight font-bold tracking-[-0.01em] sm:text-[2.1rem]">{name}</h2>
          </div>
        </div>
        {rank && (
          <p className="mt-3 text-[0.95rem] text-muted">
            {rank.indicator} : <strong className="font-semibold text-ink tabular-nums">{rank.value}</strong>, {ordinal(rank.position)} sur{" "}
            {rank.count} régions renseignées.
          </p>
        )}
        {publicationsHref && (
          <a
            href={publicationsHref}
            className="group mt-4 inline-flex items-center gap-2 border-b border-paddy/30 pb-0.5 text-sm font-medium text-paddy hover:border-paddy"
          >
            Publications sur la région
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        )}
      </header>

      {groups.length === 0 ? (
        <p className="mt-8 border-t border-line pt-6 text-[0.95rem] text-muted">
          Aucun indicateur n'est encore publié pour {national ? "le niveau national" : "cette région"}.
        </p>
      ) : (
        <div className="mt-8 grid gap-10">
          {groups.map(({ type, rows }) => (
            <section key={type.id} aria-labelledby={`type-${type.id}`}>
              <h3 id={`type-${type.id}`} className="running-head">
                <span>{type.name}</span>
              </h3>
              <dl className="mt-2">
                {rows.map(({ indicator, series }) => {
                  const [latest, ...older] = series;
                  return (
                    <div
                      key={indicator.id}
                      className="grid gap-x-6 gap-y-1 border-b border-line py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline"
                    >
                      <dt className="text-[0.95rem]">{indicator.name}</dt>
                      <dd className="text-lg font-semibold tabular-nums sm:text-right">
                        {formatValue(latest!.value)} <span className="text-sm font-normal text-muted">{latest!.unit}</span>
                      </dd>
                      <dd className="text-xs text-muted sm:col-span-2">
                        {periodLabel(latest!.year, latest!.month)} · Source :{" "}
                        {latest!.link && SAFE_LINK.test(latest!.link) ? (
                          <a
                            href={latest!.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-paddy"
                          >
                            {latest!.source}
                            <ExternalLink className="size-3" aria-hidden="true" />
                          </a>
                        ) : (
                          latest!.source
                        )}
                        {older.length > 0 && (
                          <span className="block tabular-nums">
                            Valeurs précédentes :{" "}
                            {older.map((v) => `${periodLabel(v.year, v.month)} : ${formatValue(v.value)} ${v.unit}`).join(" · ")}
                          </span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          ))}
        </div>
      )}
    </article>
  );
}
