import { useState } from "react";
import { ArrowRight, ArrowDownToLine } from "lucide-react";
import { publications as samplePublications } from "../../data/publications";
import { useApiData } from "../../hooks/useApiData";
import { formatDate } from "../../lib/format";
import type { Publication } from "../../types";
import SectionHead, { sectionLinkClass, StatusLine } from "./SectionHead";

/** Nombre de publications affichées par onglet. */
const LIMIT = 6;

const sample = (scope: Publication["scope"]) => samplePublications.filter((p) => p.scope === scope).slice(0, LIMIT);

const tabs: { id: Publication["scope"]; label: string }[] = [
  { id: "national", label: "Nationales" },
  { id: "regional", label: "Régionales" },
];

export default function Publications() {
  const [scope, setScope] = useState<Publication["scope"]>("national");
  const lists = {
    national: useApiData<Publication[]>(`/publications?scope=national&limit=${LIMIT}`, sample("national")),
    regional: useApiData<Publication[]>(`/publications?scope=regional&limit=${LIMIT}`, sample("regional")),
  };
  const current = lists[scope];
  const items = current.status === "ready" ? current.data : [];

  return (
    <section id="publications" className="scroll-mt-20 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHead
          number="02"
          kicker="Dernières parutions"
          title="Publications récentes"
          action={
            <a href="#/publications" className={sectionLinkClass}>
              Toutes les publications
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          }
        />

        <div role="tablist" aria-label="Type de publications" className="mt-10 flex gap-8 border-b-2 border-ink">
          {tabs.map((tab) => {
            const selected = tab.id === scope;
            const list = lists[tab.id];
            const count = list.status === "ready" ? list.data.length : "…";
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls="publications-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setScope(tab.id)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                    const next = tabs.find((candidate) => candidate.id !== tab.id)!;
                    setScope(next.id);
                    document.getElementById(`tab-${next.id}`)?.focus();
                  }
                }}
                className={`relative -mb-[2px] flex items-baseline gap-2 pb-3 font-medium ${
                  selected ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {tab.label}
                <span className="font-mono text-xs text-muted tabular-nums">({count})</span>
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-0 h-[3px] ${selected ? "bg-laterite" : "bg-transparent"}`}
                />
              </button>
            );
          })}
        </div>

        <ol id="publications-panel" role="tabpanel" aria-labelledby={`tab-${scope}`}>
          {current.status !== "ready" || items.length === 0 ? (
            <li>
              <StatusLine>
                {current.status === "loading"
                  ? "Chargement des publications…"
                  : current.status === "error"
                    ? `Publications indisponibles. ${current.message}`
                    : "Aucune publication pour le moment."}
              </StatusLine>
            </li>
          ) : null}
          {items.map((publication, index) => (
            <li
              key={publication.id}
              className="group relative grid gap-x-8 gap-y-2 border-b border-line py-5 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] lg:grid-cols-[2.5rem_minmax(0,1fr)_11rem_auto]"
            >
              <span aria-hidden="true" className="hidden pt-1 font-mono text-xs text-muted tabular-nums sm:block">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <a
                  href={publication.href}
                  className="font-display text-xl leading-snug decoration-paddy/40 underline-offset-4 group-hover:text-paddy hover:underline"
                >
                  {publication.title}
                </a>
                <p className="mt-1 text-sm text-muted">
                  {publication.kind}
                  <span className="lg:hidden">
                    {" · "}
                    <time dateTime={publication.date}>{formatDate(publication.date)}</time>
                  </span>
                </p>
              </div>
              <time dateTime={publication.date} className="hidden pt-1.5 font-mono text-xs text-muted tabular-nums lg:block">
                {formatDate(publication.date)}
              </time>
              <a
                href={publication.href}
                aria-label={`Télécharger : ${publication.title}`}
                className="inline-flex h-9 w-fit items-center gap-2 border border-line px-3 font-mono text-xs text-paddy hover:border-paddy hover:bg-paddy-soft"
              >
                <ArrowDownToLine className="size-3.5" aria-hidden="true" />
                PDF
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
