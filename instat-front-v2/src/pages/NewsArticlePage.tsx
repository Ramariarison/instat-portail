import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import PageBanner from "../components/layout/PageBanner";
import { LoadingRegion, Skeleton, SkeletonText } from "../components/ui/Skeleton";
import { useApiData } from "../hooks/useApiData";
import { newsDateLabel, paragraphs } from "../lib/news";
import type { NewsItem } from "../types";

const backLinkClass =
  "inline-flex items-center gap-2 font-medium text-paddy underline decoration-paddy/30 underline-offset-4 hover:decoration-paddy";

/** Page publique d'une actualité : image, texte, et les autres actualités récentes. */
export default function NewsArticlePage({ id }: { id: string }) {
  const result = useApiData<NewsItem | null>(`/news/${encodeURIComponent(id)}`, null);
  const recent = useApiData<NewsItem[]>("/news?limit=5", []);

  const item = result.status === "ready" ? result.data : null;

  useEffect(() => {
    if (!item) return;
    const previous = document.title;
    document.title = `${item.title} – INSTAT Madagascar`;
    return () => {
      document.title = previous;
    };
  }, [item]);

  if (result.status === "loading") {
    return (
      <>
        <PageBanner kicker="Actualité" title="Chargement de l'actualité" loading crumbs={[{ label: "Actualités", href: "#/actualites" }]} />
        <LoadingRegion label="Chargement de l'actualité…" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Skeleton className="aspect-video w-full" />
            <SkeletonText lines={4} className="mt-10" />
            <SkeletonText lines={3} className="mt-8" />
          </div>
        </LoadingRegion>
      </>
    );
  }

  if (!item) {
    const missing = result.status === "error" && result.httpStatus === 404;
    return (
      <>
        <PageBanner
          kicker={missing ? "404" : "Actualité"}
          title={missing ? "Actualité introuvable" : "Actualité indisponible"}
          description={
            missing
              ? "Cette actualité n'existe pas ou a été retirée du site."
              : result.status === "error"
                ? result.message
                : "Le service des actualités n'a pas répondu."
          }
          crumbs={[{ label: "Actualités", href: "#/actualites" }]}
        />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <a href="#/actualites" className={backLinkClass}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Toutes les actualités
          </a>
        </div>
      </>
    );
  }

  const dateLabel = newsDateLabel(item);
  const others = recent.status === "ready" ? recent.data.filter((n) => n.id !== item.id).slice(0, 4) : [];

  return (
    <>
      <PageBanner
        kicker="Actualité"
        title={item.title}
        description={
          (dateLabel || item.context) && (
            <p className="text-sm text-white/70">
              {dateLabel && (item.date ? <time dateTime={item.date}>{dateLabel}</time> : dateLabel)}
              {dateLabel && item.context && " · "}
              {item.context}
            </p>
          )
        }
        crumbs={[{ label: "Actualités", href: "#/actualites" }, { label: item.title }]}
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8">
        <article className="min-w-0 lg:col-span-8">
          {item.imageUrl && (
            <img src={item.imageUrl} alt="" className="mb-10 aspect-video w-full border border-line bg-paper object-cover" />
          )}
          <div className="space-y-5 text-[1.05rem] leading-relaxed">
            {paragraphs(item.content).map((paragraph, index) => (
              <p key={index} className={`whitespace-pre-line ${index === 0 ? "text-[1.2rem] leading-snug font-medium" : ""}`}>
                {paragraph}
              </p>
            ))}
          </div>
          <a href="#/actualites" className={`${backLinkClass} mt-12`}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Toutes les actualités
          </a>
        </article>

        {others.length > 0 && (
          <aside aria-labelledby="autres-actualites" className="lg:col-span-4">
            <h2 id="autres-actualites" className="border-b-2 border-ink pb-2 text-xs">
              Autres actualités
            </h2>
            <ul>
              {others.map((other) => (
                <li key={other.id} className="border-b border-line">
                  <a href={other.href} className="group flex gap-4 py-4">
                    {other.imageUrl && (
                      <img src={other.imageUrl} alt="" className="h-16 w-24 shrink-0 border border-line bg-paper object-cover" />
                    )}
                    <span className="min-w-0">
                      <span className="block leading-snug font-semibold group-hover:text-paddy">{other.title}</span>
                      {newsDateLabel(other) && <span className="mt-1 block text-xs text-muted">{newsDateLabel(other)}</span>}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </>
  );
}
