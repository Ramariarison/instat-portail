import { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { news as sampleNews } from "../../data/news";
import { useApiData } from "../../hooks/useApiData";
import type { NewsItem } from "../../types";

/** Hauteurs (en %) des barres de l'histogramme décoratif. */
const bars = [18, 24, 30, 22, 36, 44, 38, 52, 60, 48, 66, 72, 58, 82, 70, 64, 56, 48, 52, 40, 44, 34, 30, 36, 26, 22, 28, 20, 16, 22, 14, 18];
const HIGHLIGHT = 13;

const pad = (n: number) => String(n).padStart(2, "0");

function NewsCarousel({ news }: { news: NewsItem[] }) {
  const [index, setIndex] = useState(0);
  const item = news[index]!;
  const go = (step: number) => setIndex((current) => (current + step + news.length) % news.length);

  return (
    <section aria-label="Actualités" className="relative border border-white/15 bg-paddy-night/70 backdrop-blur-[2px]">
      {/* Onglet laterite : repère de la rubrique, comme un signet dans un rapport. */}
      <span aria-hidden="true" className="absolute -top-px left-6 h-[3px] w-14 bg-laterite" />

      <div className="flex items-center justify-between border-b border-white/15 px-5 py-3 sm:px-6">
        <h2 className="font-mono text-xs tracking-[0.02em] text-white/70">Fil d'actualités</h2>
        <div className="flex items-center gap-1">
          <span className="mr-2 font-mono text-xs text-white/70 tabular-nums" aria-hidden="true">
            <span className="text-white">{pad(index + 1)}</span> / {pad(news.length)}
          </span>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Actualité précédente"
            className="inline-flex size-8 items-center justify-center border border-white/20 hover:border-white/60 hover:bg-white/10"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Actualité suivante"
            className="inline-flex size-8 items-center justify-center border border-white/20 hover:border-white/60 hover:bg-white/10"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div aria-live="polite" aria-atomic="true" className="min-h-64 px-5 py-6 sm:px-6">
        <article key={item.id} className="fade-in flex h-full min-h-52 flex-col">
          <p className="font-mono text-xs text-white/60">
            {[item.dateLabel, item.context].filter(Boolean).join("  ·  ")}
          </p>
          <h3 className="mt-3 font-display text-[1.6rem] leading-[1.2] font-normal sm:text-[1.8rem]">{item.title}</h3>
          <a
            href={item.href}
            className="group mt-auto inline-flex w-fit items-center gap-2 pt-6 text-[0.95rem] font-medium text-white underline decoration-white/30 underline-offset-[6px] hover:decoration-white"
          >
            Lire l'actualité
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        </article>
      </div>

      <div className="flex gap-1 px-5 pb-4 sm:px-6">
        {news.map((entry, entryIndex) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setIndex(entryIndex)}
            aria-label={`Actualité ${entryIndex + 1} sur ${news.length}`}
            aria-current={entryIndex === index}
            className="group flex h-5 flex-1 items-center"
          >
            <span
              className={`h-[3px] w-full ${entryIndex === index ? "bg-laterite" : "bg-white/20 group-hover:bg-white/50"}`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

export default function Hero() {
  const result = useApiData<NewsItem[]>("/news?limit=10", sampleNews);

  return (
    <section id="accueil" className="on-dark graph-paper relative overflow-hidden bg-paddy-deep text-white">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-36 sm:px-6 sm:pb-44 lg:px-8 lg:pt-14">
        <p className="running-head">
          <span className="text-white">INSTAT</span>
          <span>
            <span className="hidden sm:inline">Institut national de la statistique · </span>Madagascar
          </span>
        </p>

        <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <h1 className="font-display text-[2.6rem] leading-[1.02] font-normal tracking-[-0.02em] sm:text-6xl lg:text-[4.4rem]">
              La statistique, <em className="text-[#f2d7cf] italic">un outil de gouvernance</em> au service du développement
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-white/75">
              Publications, bases de données et indicateurs produits par l'Institut national de la statistique de
              Madagascar.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <a
                href="#publications"
                className="group inline-flex h-12 items-center gap-3 bg-white pr-5 pl-6 font-medium text-paddy-deep hover:bg-paddy-soft"
              >
                Consulter les publications
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
              <a
                href="#chiffres"
                className="font-medium text-white underline decoration-white/35 underline-offset-[6px] hover:decoration-white"
              >
                Madagascar en chiffres
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 lg:pt-2">
            {result.status === "ready" && result.data.length > 0 ? (
              <NewsCarousel news={result.data} />
            ) : (
              <p role="status" className="border border-white/15 bg-paddy-night/70 px-6 py-8 font-mono text-xs text-white/70">
                {result.status === "loading"
                  ? "Chargement des actualités…"
                  : result.status === "error"
                    ? `Actualités indisponibles. ${result.message}`
                    : "Aucune actualité pour le moment."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Histogramme décoratif : il se dessine au chargement et fait la transition avec la page. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 flex h-24 items-end gap-[3px] px-[3px] sm:h-32">
        {bars.map((height, i) => (
          <span
            key={i}
            className={`bar-grow flex-1 ${i === HIGHLIGHT ? "bg-laterite" : "bg-paper"}`}
            style={{ height: `${height}%`, animationDelay: `${i * 22}ms` }}
          />
        ))}
      </div>
    </section>
  );
}
