import { ArrowRight } from "lucide-react";
import { themes } from "../../data/themes";
import SectionHead from "./SectionHead";

/** Présenté comme le sommaire d'un annuaire statistique : intitulé, points de conduite, renvoi. */
export default function Themes() {
  return (
    <section id="themes" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHead
          kicker="Sommaire thématique"
          title="Explorer par thème"
          description="Choisissez un secteur pour retrouver ses publications et ses données."
        />

        <ul className="mt-12 grid border-t-2 border-ink md:grid-cols-2 md:gap-x-14 lg:grid-cols-3">
          {themes.map(({ id, label, icon: Icon }) => (
            <li key={id} className="border-b border-line">
              <a href={`#/themes/${id}`} className="group flex items-center gap-4 py-4">
                <Icon className="size-[1.1rem] shrink-0 text-paddy/70 group-hover:text-paddy" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-lg leading-snug group-hover:text-paddy font-semibold">{label}</span>
                <span aria-hidden="true" className="leader group-hover:border-paddy/50" />
                <ArrowRight
                  className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-paddy"
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
