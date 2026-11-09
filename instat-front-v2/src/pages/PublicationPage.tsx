import { useEffect } from "react";
import { ArrowLeft, ArrowDownToLine, FileText } from "lucide-react";
import { sectors } from "../admin/data/sectors";
import type { AdminPublication, Region, Thematique } from "../admin/data/types";
import PageBanner from "../components/layout/PageBanner";
import { LoadingRegion, Skeleton, SkeletonText } from "../components/ui/Skeleton";
import { useApiData } from "../hooks/useApiData";
import { fileUrl } from "../lib/api";
import { formatBytes, formatDate } from "../lib/format";

const backLinkClass =
  "inline-flex items-center gap-2 font-medium text-paddy underline decoration-paddy/30 underline-offset-4 hover:decoration-paddy";

/** Fiche publique d'une publication : texte, informations et documents à télécharger. */
export default function PublicationPage({ id }: { id: string }) {
  const result = useApiData<AdminPublication | null>(`/publications/${encodeURIComponent(id)}`, null);
  const thematiques = useApiData<Thematique[]>("/thematiques", []);
  const regions = useApiData<Region[]>("/regions", []);

  const publication = result.status === "ready" ? result.data : null;

  useEffect(() => {
    if (!publication) return;
    const previous = document.title;
    document.title = `${publication.title} – INSTAT Madagascar`;
    return () => {
      document.title = previous;
    };
  }, [publication]);

  if (result.status === "loading") {
    return (
      <>
        <PageBanner kicker="Publication" title="Chargement de la publication" loading crumbs={[{ label: "Publications", href: "#/publications" }]} />
        <LoadingRegion
          label="Chargement de la publication…"
          className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8"
        >
          <div className="lg:col-span-8">
            <div className="border-l-[3px] border-line pl-5">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="mt-3 h-6 w-2/3" />
            </div>
            <SkeletonText lines={4} className="mt-10" />
            <SkeletonText lines={3} className="mt-8" />
          </div>
          <div className="space-y-4 lg:col-span-4">
            <Skeleton className="h-4 w-32" />
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-line py-3">
                <Skeleton className="size-5 shrink-0" />
                <span className="flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-16" />
                </span>
              </div>
            ))}
          </div>
        </LoadingRegion>
      </>
    );
  }

  if (!publication) {
    const missing = result.status === "error" && result.httpStatus === 404;
    return (
      <>
        <PageBanner
          kicker={missing ? "404" : "Publication"}
          title={missing ? "Publication introuvable" : "Publication indisponible"}
          description={
            missing
              ? "Cette publication n'existe pas ou a été retirée du site."
              : result.status === "error"
                ? result.message
                : "Le service des publications n'a pas répondu."
          }
          crumbs={[{ label: "Publications", href: "#/publications" }]}
        />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <a href="#/publications" className={backLinkClass}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Toutes les publications
          </a>
        </div>
      </>
    );
  }

  const thematique =
    thematiques.status === "ready" ? thematiques.data.find((t) => t.id === publication.thematiqueId)?.name : undefined;
  const region =
    regions.status === "ready" && publication.regionId
      ? regions.data.find((r) => r.id === publication.regionId)?.name
      : undefined;
  const sectorLabels = publication.sectors
    .map((sectorId) => sectors.find((s) => s.id === sectorId)?.label)
    .filter((label): label is string => Boolean(label));
  // Le contenu est du texte brut : une ligne vide sépare deux paragraphes.
  const paragraphs = publication.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <PageBanner
        kicker={thematique ?? "Publication"}
        title={publication.title}
        description={
          <p className="text-sm text-white/70">
            <time dateTime={publication.date}>{formatDate(publication.date)}</time>
            {" · "}
            {publication.level === "regional" ? `Région ${region ?? ""}`.trim() : "National"}
          </p>
        }
        crumbs={[{ label: "Publications", href: "#/publications" }, { label: publication.title }]}
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8">
        <article className="min-w-0 lg:col-span-8">
          {publication.imageUrl && (
            <img
              src={publication.imageUrl}
              alt=""
              className="mb-10 max-h-[36rem] w-full border border-line bg-paper object-contain"
            />
          )}
          <p className="border-l-[3px] border-laterite pl-5 text-[1.45rem] leading-snug font-semibold">{publication.excerpt}</p>
          <div className="mt-8 space-y-5 text-[1.05rem] leading-relaxed">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
          <a href="#/publications" className={`${backLinkClass} mt-12`}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Toutes les publications
          </a>
        </article>

        <aside className="space-y-10 lg:col-span-4">
          <section aria-labelledby="documents-title">
            <h2 id="documents-title" className="flex items-baseline justify-between border-b-2 border-ink pb-2 text-xs">
              <span>Documents à télécharger</span>
              <span className="text-muted tabular-nums">{String(publication.documents.length).padStart(2, "0")}</span>
            </h2>
            {publication.documents.length > 0 ? (
              <ul>
                {publication.documents.map((doc) => (
                  <li key={doc.id} className="border-b border-line">
                    <a
                      href={fileUrl(doc.id)}
                      download={doc.name}
                      className="group flex items-center gap-3 py-3 hover:bg-paddy-soft/60"
                    >
                      <FileText className="size-5 shrink-0 text-paddy" strokeWidth={1.5} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium group-hover:text-paddy">{doc.name}</span>
                        <span className="text-xs text-muted">{formatBytes(doc.size)}</span>
                      </span>
                      <ArrowDownToLine className="size-4 shrink-0 text-paddy" aria-hidden="true" />
                      <span className="sr-only">Télécharger</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-3 text-sm text-muted">Aucun document joint à cette publication.</p>
            )}
          </section>

          <section aria-labelledby="fiche-title">
            <h2 id="fiche-title" className="border-b-2 border-ink pb-2 text-xs">
              Fiche
            </h2>
            <dl className="text-[0.95rem]">
              {[
                ["Date", formatDate(publication.date)],
                ["Niveau", publication.level === "regional" ? "Régional" : "National"],
                ...(region ? [["Région", region]] : []),
                ...(thematique ? [["Thématique", thematique]] : []),
              ].map(([term, value]) => (
                <div key={term} className="flex items-baseline gap-3 border-b border-line py-2.5">
                  <dt className="text-muted">{term}</dt>
                  <span aria-hidden="true" className="leader" />
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            {sectorLabels.length > 0 && (
              <>
                <h3 className="mt-6 text-xs text-muted">Secteurs concernés</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {sectorLabels.map((label) => (
                    <li key={label} className="border border-line bg-white px-2.5 py-1 text-sm">
                      {label}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
