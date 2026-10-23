import { ArrowLeft, ArrowRight } from "lucide-react";
import PageBanner from "../components/layout/PageBanner";

/** Rubrique prévue dans la navigation, mais pas encore rédigée. */
export default function ComingSoonPage() {
  return (
    <>
      <PageBanner
        kicker="En préparation"
        title="Cette page arrive bientôt"
        description="Cette rubrique du nouveau portail est en cours de rédaction. En attendant, les publications et les chiffres clés sont déjà disponibles."
        crumbs={[{ label: "Page en préparation" }]}
      />
      <div className="mx-auto flex max-w-7xl flex-wrap gap-x-8 gap-y-4 px-4 py-12 sm:px-6 lg:px-8">
        <a
          href="#accueil"
          className="inline-flex items-center gap-2 font-medium text-paddy underline decoration-paddy/30 underline-offset-4 hover:decoration-paddy"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Retour à l'accueil
        </a>
        <a
          href="#/publications"
          className="inline-flex items-center gap-2 font-medium text-paddy underline decoration-paddy/30 underline-offset-4 hover:decoration-paddy"
        >
          Toutes les publications
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </>
  );
}
