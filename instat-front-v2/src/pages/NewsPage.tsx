import PageBanner from "../components/layout/PageBanner";
import { StatusLine } from "../components/home/SectionHead";
import { news as sampleNews } from "../data/news";
import { useApiData } from "../hooks/useApiData";
import type { NewsItem } from "../types";

/** Fil complet des actualités, les plus récentes d'abord. */
export default function NewsPage() {
  const result = useApiData<NewsItem[]>("/news?limit=100", sampleNews);

  return (
    <>
      <PageBanner
        kicker="Actualités"
        title="Actualités de l'INSTAT"
        description="Partenariats, lancements, rencontres et temps forts de l'institut."
        crumbs={[{ label: "Actualités" }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {result.status !== "ready" || result.data.length === 0 ? (
          <StatusLine className="border-t-2 border-ink">
            {result.status === "loading"
              ? "Chargement des actualités…"
              : result.status === "error"
                ? `Actualités indisponibles. ${result.message}`
                : "Aucune actualité pour le moment."}
          </StatusLine>
        ) : (
          <ol className="border-t-2 border-ink">
            {result.data.map((item, index) => (
              <li
                key={item.id}
                className="grid gap-x-8 gap-y-1 border-b border-line py-6 sm:grid-cols-[3rem_13rem_minmax(0,1fr)]"
              >
                <span aria-hidden="true" className="hidden pt-1 font-mono text-xs text-laterite tabular-nums sm:block">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="pt-1 font-mono text-xs text-muted">{item.dateLabel ?? "Date non précisée"}</p>
                <div>
                  <h2 className="font-display text-xl leading-snug">{item.title}</h2>
                  {item.context && <p className="mt-1 text-sm text-muted">{item.context}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
