import PageBanner from "../components/layout/PageBanner";
import { StatusLine } from "../components/home/SectionHead";
import { LoadingRegion, Skeleton } from "../components/ui/Skeleton";
import { news as sampleNews } from "../data/news";
import { useApiData } from "../hooks/useApiData";
import { newsDateLabel, paragraphs } from "../lib/news";
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
        {result.status === "loading" ? (
          <LoadingRegion label="Chargement des actualités…" className="border-t-2 border-ink">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="grid gap-x-8 gap-y-2 border-b border-line py-6 sm:grid-cols-[13rem_minmax(0,1fr)]">
                <Skeleton className="mt-1.5 h-3 w-32" />
                <div>
                  <Skeleton className={`h-5 ${i % 2 ? "w-2/3" : "w-5/6"}`} />
                  <Skeleton className="mt-3 h-3 w-48" />
                </div>
              </div>
            ))}
          </LoadingRegion>
        ) : result.status === "error" || result.data.length === 0 ? (
          <StatusLine className="border-t-2 border-ink">
            {result.status === "error" ? `Actualités indisponibles. ${result.message}` : "Aucune actualité pour le moment."}
          </StatusLine>
        ) : (
          <ul className="border-t-2 border-ink">
            {result.data.map((item) => (
              <li key={item.id} className="border-b border-line">
                <a href={item.href} className="group grid gap-x-8 gap-y-3 py-6 sm:grid-cols-[13rem_minmax(0,1fr)_12rem]">
                  <p className="pt-1 text-xs text-muted">{newsDateLabel(item) ?? "Date non précisée"}</p>
                  <div className="min-w-0">
                    <h2 className="text-xl leading-snug font-semibold group-hover:text-paddy">{item.title}</h2>
                    {item.context && <p className="mt-1 text-sm text-muted">{item.context}</p>}
                    {item.content && <p className="mt-3 line-clamp-2 text-[0.95rem] text-ink/80">{paragraphs(item.content)[0]}</p>}
                  </div>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" className="aspect-video w-full border border-line bg-paper object-cover sm:order-none" />
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
