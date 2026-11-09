import { ArrowUpRight } from "lucide-react";
import { SAMPLE_DATA } from "../../config";
import { indicators as sampleIndicators } from "../../data/indicators";
import { useApiData } from "../../hooks/useApiData";
import { formatNumber } from "../../lib/format";
import type { Indicator } from "../../types";
import { LoadingRegion, Skeleton } from "../ui/Skeleton";
import SectionHead, { sectionLinkClass, StatusLine } from "./SectionHead";

export default function KeyFigures() {
  const result = useApiData<Indicator[]>("/indicators", sampleIndicators);
  const [lead, ...others] = result.status === "ready" ? result.data : [];

  return (
    <section id="chiffres" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        <SectionHead
          number="01"
          kicker="Indicateurs clés"
          title="Madagascar en chiffres"
          description="Population, croissance, inflation et indices des prix, en un coup d'œil."
          action={
            <a href="#/madagascar-en-chiffres" className={sectionLinkClass}>
              Explorer la carte interactive
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          }
        />

        {result.status === "loading" && <KeyFiguresSkeleton />}
        {result.status === "error" && (
          <StatusLine className="mt-12 border-t-2 border-ink">Indicateurs indisponibles. {result.message}</StatusLine>
        )}

        <dl hidden={!lead} className="mt-12 grid border-t-2 border-ink lg:grid-cols-12">
          {lead && (
            <div className="flex flex-col justify-between gap-8 border-b border-line py-8 lg:col-span-5 lg:border-r lg:border-b-0 lg:pr-10">
              <dt className="flex items-baseline gap-3 text-[0.95rem] text-muted">
                <span className="text-xs text-laterite">1.0</span>
                {lead.label}
              </dt>
              <dd>
                <span className="block text-[clamp(3rem,6vw,4.75rem)] leading-[0.95] font-bold tracking-[-0.02em] tabular-nums">
                  {formatNumber(lead.value, lead.decimals)}
                </span>
                <span className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-3 text-xs text-muted">
                  <span>{lead.unit}</span>
                  <span>{lead.period}</span>
                </span>
              </dd>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:col-span-7 lg:pl-10">
            {others.map((indicator, i) => (
              <div
                key={indicator.id}
                className="border-b border-line py-6 last:border-b-0 sm:odd:pr-8 sm:even:border-l sm:even:pl-8 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0"
              >
                <dt className="flex items-baseline gap-3 text-[0.95rem] text-muted">
                  <span className="text-xs text-laterite">{`2.${i + 1}`}</span>
                  {indicator.label}
                </dt>
                <dd className="mt-3 flex items-baseline justify-between gap-4">
                  <span>
                    <span className="text-[2.75rem] leading-none font-semibold tracking-[-0.02em] tabular-nums">
                      {formatNumber(indicator.value, indicator.decimals)}
                    </span>
                    <span className="ml-1.5 text-lg text-muted">{indicator.unit}</span>
                  </span>
                  <span className="text-xs whitespace-nowrap text-muted">{indicator.period}</span>
                </dd>
              </div>
            ))}
          </div>
        </dl>

        <p className="mt-4 border-t border-line pt-3 text-xs text-muted">
          Source : INSTAT, service « Madagascar en chiffres ».
          {SAMPLE_DATA && " Valeurs d'exemple, à remplacer par les données du service."}
        </p>
      </div>
    </section>
  );
}

/** Même grille que les chiffres : un grand chiffre à gauche, cinq petits à droite. */
function KeyFiguresSkeleton() {
  return (
    <LoadingRegion label="Chargement des indicateurs…" className="mt-12 grid border-t-2 border-ink lg:grid-cols-12">
      <div className="flex flex-col justify-between gap-8 border-b border-line py-8 lg:col-span-5 lg:border-r lg:border-b-0 lg:pr-10">
        <Skeleton className="h-4 w-48" />
        <div>
          <Skeleton className="h-16 w-4/5 sm:h-[4.5rem]" />
          <div className="mt-4 flex justify-between border-t border-line pt-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:col-span-7 lg:pl-10">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="border-b border-line py-6 last:border-b-0 sm:odd:pr-8 sm:even:border-l sm:even:pl-8 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0"
          >
            <Skeleton className="h-4 w-44" />
            <div className="mt-4 flex items-end justify-between">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}
