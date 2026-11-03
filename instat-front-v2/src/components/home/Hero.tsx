import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { news as sampleNews } from "../../data/news";
import { useApiData } from "../../hooks/useApiData";
import type { NewsItem } from "../../types";

/** Hauteurs (en %) des barres de l'histogramme décoratif. */
const bars = [18, 24, 30, 22, 36, 44, 38, 52, 60, 48, 66, 72, 58, 82, 70, 64, 56, 48, 52, 40, 44, 34, 30, 36, 26, 22, 28, 20, 16, 22, 14, 18];
const HIGHLIGHT = 13;

/** Distance (px) d'un glissement du doigt pour changer d'actualité. */
const SWIPE = 50;

function NewsCarousel({ news }: { news: NewsItem[] }) {
  const [index, setIndex] = useState(0);
  const swipeStart = useRef<number | null>(null);
  const item = news[index]!;
  const go = (step: number) => setIndex((current) => (current + step + news.length) % news.length);

  return (
    <section aria-label="Actualités" className="bg-white text-ink [&_:focus-visible]:outline-laterite">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h2 className="text-sm font-semibold">Actualités</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Actualité précédente"
            className="inline-flex size-8 items-center justify-center text-muted hover:bg-paddy-soft hover:text-ink"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Actualité suivante"
            className="inline-flex size-8 items-center justify-center text-muted hover:bg-paddy-soft hover:text-ink"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Toutes les actualités sont posées sur une bande qui glisse. Seule la visible est accessible
          (les autres sont inertes) ; le changement est annoncé à part, pour les lecteurs d'écran. */}
      <div
        className="touch-pan-y overflow-hidden"
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse") swipeStart.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (swipeStart.current === null) return;
          const distance = event.clientX - swipeStart.current;
          swipeStart.current = null;
          if (Math.abs(distance) > SWIPE) go(distance < 0 ? 1 : -1);
        }}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
      >
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,0.7,0.2,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {news.map((entry, entryIndex) => {
            const current = entryIndex === index;
            return (
              <article
                key={entry.id}
                aria-hidden={!current}
                inert={!current}
                className="flex min-h-48 w-full shrink-0 flex-col px-5 py-5"
              >
                <p className="text-sm text-muted">
                  {[entry.dateLabel, entry.context].filter(Boolean).join(" · ")}
                </p>
                <h3 className="mt-2 text-lg leading-snug font-semibold">{entry.title}</h3>
                <a href={entry.href} className="mt-auto pt-4 text-sm font-medium text-paddy underline underline-offset-4 hover:text-paddy-deep">
                  Lire l'actualité
                </a>
              </article>
            );
          })}
        </div>
      </div>
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {`Actualité ${index + 1} sur ${news.length} : ${item.title}`}
      </p>

      <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm">
        <div className="flex gap-1.5">
          {news.map((entry, entryIndex) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setIndex(entryIndex)}
              aria-label={`Actualité ${entryIndex + 1} sur ${news.length}`}
              aria-current={entryIndex === index}
              className={`size-2 rounded-full ${entryIndex === index ? "bg-paddy" : "bg-line hover:bg-rule"}`}
            />
          ))}
        </div>
        <a href="#/actualites" className="font-medium text-paddy hover:underline">
          Toutes les actualités
        </a>
      </div>
    </section>
  );
}


/** Recherche dans les publications : ouvre la liste filtrée (#/publications?q=…). */
function PublicationSearch() {
  const [text, setText] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const q = text.trim();
    window.location.hash = q ? `#/publications?${new URLSearchParams({ q })}` : "#/publications";
  };

  return (
    <form role="search" onSubmit={submit} className="mt-7 flex max-w-xl">
      <label htmlFor="hero-search" className="sr-only">
        Rechercher une publication
      </label>
      <input
        id="hero-search"
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Rechercher une publication, un indicateur…"
        className="h-12 min-w-0 flex-1 bg-white px-4 text-ink placeholder:text-muted focus-visible:outline-offset-0"
      />
      <button type="submit" className="inline-flex h-12 items-center gap-2 bg-laterite px-5 font-medium text-white hover:bg-[#9a2f23]">
        <Search className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Rechercher</span>
      </button>
    </form>
  );
}

export default function Hero() {
  const result = useApiData<NewsItem[]>("/news?limit=10", sampleNews);

  return (
    <section id="accueil" className="on-dark graph-paper relative overflow-hidden bg-paddy-deep text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-12 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-8 pb-36 sm:pb-44 lg:pt-14">
        <div className="lg:col-span-7">
          <h1 className="text-3xl leading-tight font-bold tracking-[-0.01em] sm:text-4xl">Les statistiques officielles de Madagascar</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Publications, bases de données et indicateurs produits par l'Institut national de la statistique.
          </p>
          <PublicationSearch />
          <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a href="#/publications" className="inline-flex items-center gap-1.5 font-medium underline underline-offset-4 hover:text-paddy-soft">
              Toutes les publications
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
            <a href="#chiffres" className="font-medium underline underline-offset-4 hover:text-paddy-soft">
              Madagascar en chiffres
            </a>
          </p>
        </div>

        {/* min-w-0 : sans lui, la colonne prendrait la largeur cumulée de toutes les actualités du carrousel. */}
        <div className="min-w-0 lg:col-span-5">
          {result.status === "ready" && result.data.length > 0 ? (
            <NewsCarousel news={result.data} />
          ) : (
            // Même hauteur que le carrousel : la page ne « saute » pas quand les actualités arrivent.
            <p role="status" className="flex min-h-[18rem] items-center bg-white px-5 py-8 text-sm text-muted">
              {result.status === "loading"
                ? "Chargement des actualités…"
                : result.status === "error"
                  ? `Actualités indisponibles. ${result.message}`
                  : "Aucune actualité pour le moment."}
            </p>
          )}
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
