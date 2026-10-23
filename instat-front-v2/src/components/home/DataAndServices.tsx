import { ArrowRight } from "lucide-react";
import { databases, services } from "../../data/services";
import type { ServiceLink } from "../../types";
import SectionHead from "./SectionHead";

function LinkList({ title, items }: { title: string; items: ServiceLink[] }) {
  return (
    <div>
      <h3 className="flex items-baseline justify-between border-b-2 border-ink pb-3 font-mono text-xs text-muted">
        <span className="text-ink">{title}</span>
        <span className="tabular-nums">{String(items.length).padStart(2, "0")}</span>
      </h3>
      <ul>
        {items.map(({ id, label, description, icon: Icon, href }) => (
          <li key={id} className="border-b border-line">
            <a href={href} className="group flex items-start gap-4 py-5">
              <span className="flex size-9 shrink-0 items-center justify-center border border-line text-paddy group-hover:border-paddy group-hover:bg-paddy group-hover:text-white">
                <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block font-display text-xl leading-snug group-hover:text-paddy">{label}</span>
                <span className="mt-0.5 block text-[0.95rem] text-muted">{description}</span>
              </span>
              <ArrowRight
                className="mt-2 size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-paddy"
                aria-hidden="true"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DataAndServices() {
  return (
    <section id="services" className="scroll-mt-20 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHead number="04" kicker="Accès aux données" title="Bases de données et services" />

        <div className="mt-12 grid gap-14 lg:grid-cols-2 lg:gap-16">
          <LinkList title="Bases de données" items={databases} />
          <LinkList title="Services et ressources" items={services} />
        </div>

        <div className="on-dark graph-paper relative mt-16 grid gap-8 bg-paddy-deep p-6 text-white sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <span aria-hidden="true" className="absolute top-0 left-0 h-full w-[3px] bg-laterite" />
          <div>
            <p className="font-mono text-xs text-white/60">Demande sur mesure</p>
            <h2 className="mt-3 font-display text-3xl leading-tight font-normal sm:text-4xl">
              Vous cherchez des données <em className="italic">précises</em> ?
            </h2>
            <p className="mt-3 max-w-xl text-white/75">
              Faites une demande de données ou consultez les microdonnées disponibles.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <a
              href="#/demande-de-donnees"
              className="group inline-flex h-12 items-center gap-3 bg-white pr-5 pl-6 font-medium text-paddy-deep hover:bg-paddy-soft"
            >
              Faire une demande
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <a
              href="#/microdonnees"
              className="font-medium underline decoration-white/35 underline-offset-[6px] hover:decoration-white"
            >
              Voir les microdonnées
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
