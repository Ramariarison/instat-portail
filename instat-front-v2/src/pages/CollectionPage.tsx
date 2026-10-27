import type { Thematique } from "../admin/data/types";
import PageBanner from "../components/layout/PageBanner";
import { sectorCollections } from "../data/collections";
import { useApiData } from "../hooks/useApiData";
import PublicationsPage from "./PublicationsPage";

/**
 * Rubrique « Thèmes et données » (#/themes/<slug>) : les publications d'une thématique du back-office
 * (slug = alias de la thématique) ou d'un groupe de secteurs (data/collections.ts).
 */
export default function CollectionPage({ slug }: { slug: string }) {
  const thematiques = useApiData<Thematique[]>("/thematiques", []);
  const collection = sectorCollections.find((c) => c.slug === slug);

  if (collection) {
    return (
      <PublicationsPage
        key={slug}
        preset={{ kicker: collection.group, title: collection.label, description: collection.description, sectors: collection.sectors }}
      />
    );
  }

  const thematique = thematiques.status === "ready" ? thematiques.data.find((t) => t.alias === slug) : undefined;
  if (thematique) {
    return (
      <PublicationsPage
        key={thematique.id}
        preset={{
          kicker: "Thématique",
          title: thematique.name,
          description: `Publications de l'INSTAT classées dans la thématique « ${thematique.name} ».`,
          thematiqueId: thematique.id,
        }}
      />
    );
  }

  return (
    <>
      <PageBanner
        kicker="Thèmes et données"
        title={thematiques.status === "loading" ? "Chargement…" : "Rubrique introuvable"}
        description={
          thematiques.status === "error"
            ? thematiques.message
            : thematiques.status === "ready"
              ? "Cette rubrique n'existe pas ou sa thématique a été renommée."
              : undefined
        }
        crumbs={[{ label: "Publications", href: "#/publications" }, { label: "Rubrique" }]}
      />
      {thematiques.status === "ready" && (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <a
            href="#/publications"
            className="font-medium text-paddy underline decoration-paddy/30 underline-offset-4 hover:decoration-paddy"
          >
            Toutes les publications
          </a>
        </div>
      )}
    </>
  );
}
