import { ArrowUpRight } from "lucide-react";
import { SAMPLE_DATA } from "../../config";
import { indicators as sampleIndicators } from "../../data/indicators";
import { useApiData } from "../../hooks/useApiData";
import { formatNumber } from "../../lib/format";
import type { Indicator } from "../../types";
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

        {result.status !== "ready" && (
          <StatusLine className="mt-12 border-t-2 border-ink">
            {result.status === "loading" ? "Chargement des indicateurs…" : `Indicateurs indisponibles. ${result.message}`}
          </StatusLine>
        )}

        <dl hidden={!lead} className="mt-12 grid border-t-2 border-ink lg:grid-cols-12">
          {lead && (
            <div className="flex flex-col justify-between gap-8 border-b border-line py-8 lg:col-span-5 lg:border-r lg:border-b-0 lg:pr-10">
              <dt className="flex items-baseline gap-3 text-[0.95rem] text-muted">
                <span className="font-mono text-xs text-laterite">1.0</span>
                {lead.label}
              </dt>
              <dd>
                <span className="block font-display text-[clamp(3.5rem,8vw,6.5rem)] leading-[0.9] font-light tracking-[-0.03em] tabular-nums">
                  {formatNumber(lead.value, lead.decimals)}
                </span>
                <span className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-3 font-mono text-xs text-muted">
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
                  <span className="font-mono text-xs text-laterite">{`2.${i + 1}`}</span>
                  {indicator.label}
                </dt>
                <dd className="mt-3 flex items-baseline justify-between gap-4">
                  <span>
                    <span className="font-display text-[2.75rem] leading-none font-light tracking-[-0.02em] tabular-nums">
                      {formatNumber(indicator.value, indicator.decimals)}
                    </span>
                    <span className="ml-1.5 text-lg text-muted">{indicator.unit}</span>
                  </span>
                  <span className="font-mono text-xs whitespace-nowrap text-muted">{indicator.period}</span>
                </dd>
              </div>
            ))}
          </div>
        </dl>

        <p className="mt-4 border-t border-line pt-3 font-mono text-xs text-muted">
          Source : INSTAT, service « Madagascar en chiffres ».
          {SAMPLE_DATA && " Valeurs d'exemple, à remplacer par les données du service."}
        </p>
      </div>
    </section>
  );
}
