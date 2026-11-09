import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Search } from "lucide-react";
import { news as sampleNews } from "../../data/news";
import { publications as samplePublications } from "../../data/publications";
import { useApiData } from "../../hooks/useApiData";
import { formatDate } from "../../lib/format";
import type { NewsItem, Publication } from "../../types";
import DecorativeBars from "../layout/DecorativeBars";
import { LoadingRegion, Skeleton, SkeletonText } from "../ui/Skeleton";

/** Distance (px) d'un glissement du doigt pour changer d'actualité. */
const SWIPE = 50;

/**
 * Temps passé sur une actualité : celui de la lire, comme le ferait quelqu'un.
 * 6 s de base, un quart de seconde par mot, entre 7 et 12 s.
 */
function dwellFor(item: NewsItem): number {
  const words = `${item.title} ${item.context ?? ""}`.split(/\s+/).filter(Boolean).length;
  return Math.min(12_000, Math.max(7_000, 6_000 + words * 250));
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Rubriques les plus demandées, en accès direct sous la recherche. */
const shortcuts = [
  { label: "Indices des prix (NIPC)", href: "#/themes/ipc" },
  { label: "RGPH-3", href: "#/themes/rgph-3" },
  { label: "Enquêtes et recensements", href: "#/themes/enquetes-recensements" },
  { label: "Annuaires", href: "#/themes/annuaires" },
  { label: "Madagascar en chiffres", href: "#/madagascar-en-chiffres" },
];

function NewsCarousel({ news }: { news: NewsItem[] }) {
  const [index, setIndex] = useState(0);
  // Pause choisie par la personne (bouton) ; sans mouvement demandé par le système : pas de défilement du tout.
  const [stopped, setStopped] = useState(prefersReducedMotion);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const [offscreen, setOffscreen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const swipeStart = useRef<number | null>(null);
  const item = news[index]!;
  const go = (step: number) => setIndex((current) => (current + step + news.length) % news.length);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry!.isIntersecting), { threshold: 0.3 });
    if (rootRef.current) observer.observe(rootRef.current);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
    };
  }, []);

  const autoplay = news.length > 1 && !stopped;
  // On ne défile pas sous les yeux de quelqu'un qui lit, survole ou manipule le bloc, ni quand il n'est pas visible.
  const running = autoplay && !hovered && !focused && !hidden && !offscreen;

  return (
    <section
      ref={rootRef}
      aria-roledescription="carrousel"
      aria-label="Actualités"
      className="bg-white text-ink shadow-[0_18px_40px_-24px_rgb(0_0_0/0.55)] [&_:focus-visible]:outline-laterite"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // Seul le focus clavier suspend le défilement : un clic sur « suivant » ne doit pas l'arrêter pour de bon.
      onFocus={(event) => setFocused(event.target.matches(":focus-visible"))}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line py-2.5 pr-2 pl-5">
        <h2 className="flex items-baseline gap-2.5 text-sm font-semibold">
          Actualités
          <span className="text-xs font-normal text-muted tabular-nums">
            {index + 1} / {news.length}
          </span>
        </h2>
        <div className="flex items-center">
          {news.length > 1 && !prefersReducedMotion() && (
            <button
              type="button"
              onClick={() => setStopped((value) => !value)}
              aria-label={stopped ? "Reprendre le défilement des actualités" : "Mettre en pause le défilement des actualités"}
              className="inline-flex size-8 items-center justify-center text-muted hover:bg-paddy-soft hover:text-ink"
            >
              {stopped ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
            </button>
          )}
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

      {/* Temps restant sur l'actualité : un filet qui se remplit, arrêté pendant une pause.
          À la fin de son animation, on passe à la suivante ; la clé le relance à chaque changement. */}
      <div aria-hidden="true" className="h-0.5 bg-paddy-soft">
        {autoplay && (
          <span
            key={index}
            className="dwell block h-full bg-laterite"
            style={{ animationDuration: `${dwellFor(item)}ms`, animationPlayState: running ? "running" : "paused" }}
            onAnimationEnd={() => go(1)}
          />
        )}
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
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {news.map((entry, entryIndex) => {
            const current = entryIndex === index;
            return (
              <article
                key={entry.id}
                aria-roledescription="actualité"
                aria-hidden={!current}
                inert={!current}
                className={`flex min-h-56 w-full shrink-0 flex-col px-5 pt-5 pb-4 transition-opacity duration-500 ${current ? "opacity-100" : "opacity-0"}`}
              >
                <p className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted">
                  {entry.dateLabel && <span className="font-semibold tracking-[0.04em] text-laterite uppercase">{entry.dateLabel}</span>}
                  {entry.context && <span>{entry.context}</span>}
                </p>
                <h3 className="mt-3 text-[1.3rem] leading-snug font-semibold">
                  <a href={entry.href} className="hover:text-paddy hover:underline hover:decoration-paddy/40 hover:underline-offset-4">
                    {entry.title}
                  </a>
                </h3>
                <a
                  href={entry.href}
                  aria-label={`Lire l'actualité : ${entry.title}`}
                  className="group mt-auto inline-flex w-fit items-center gap-1.5 pt-5 text-sm font-medium text-paddy"
                >
                  Lire l'actualité
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
              </article>
            );
          })}
        </div>
      </div>
      {/* Défilement automatique : on n'annonce rien (ce serait bavard) ; navigation manuelle : on annonce. */}
      <p aria-live={autoplay ? "off" : "polite"} aria-atomic="true" className="sr-only">
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
              className={`h-1.5 rounded-full transition-all duration-300 ${entryIndex === index ? "w-5 bg-paddy" : "w-1.5 bg-line hover:bg-rule"}`}
            />
          ))}
        </div>
        <a href="#/actualites" className="font-medium text-paddy hover:underline hover:underline-offset-4">
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
    <form role="search" onSubmit={submit} className="mt-8 flex max-w-xl shadow-[0_12px_30px_-18px_rgb(0_0_0/0.6)]">
      <label htmlFor="hero-search" className="sr-only">
        Rechercher une publication
      </label>
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-4 hidden size-4 -translate-y-1/2 text-muted sm:block" aria-hidden="true" />
        <input
          id="hero-search"
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="NIPC, RGPH-3, enquête, région…"
          className="h-13 w-full bg-white pr-4 pl-4 text-ink placeholder:text-muted focus-visible:outline-offset-0 sm:pl-11"
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-13 items-center gap-2 bg-laterite px-4 font-medium text-white hover:bg-[#9a2f23] sm:px-6"
      >
        <Search className="size-4 sm:hidden" aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">Rechercher</span>
      </button>
    </form>
  );
}

/** Dernière publication mise en ligne, comme la « dernière parution » des instituts de statistique. */
function LatestRelease() {
  const result = useApiData<Publication[]>("/publications?limit=1", samplePublications.slice(0, 1));
  const latest = result.status === "ready" ? result.data[0] : undefined;

  return (
    <div className="mt-10 min-h-[3.25rem] max-w-xl border-t border-white/15 pt-4">
      {result.status === "loading" ? (
        <div className="loading-reveal" aria-hidden="true">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-2.5 h-4 w-4/5" />
        </div>
      ) : (
        latest && (
          <a href={latest.href} className="group block">
            <span className="flex items-center gap-2 text-xs text-white/60">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-laterite" />
              Dernière parution · <time dateTime={latest.date}>{formatDate(latest.date)}</time>
            </span>
            <span className="mt-1 flex items-start gap-2 font-medium text-white">
              <span className="underline decoration-white/25 underline-offset-4 group-hover:decoration-white">{latest.title}</span>
              <ArrowRight className="mt-1 size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </a>
        )
      )}
    </div>
  );
}

export default function Hero() {
  const result = useApiData<NewsItem[]>("/news?limit=10", sampleNews);

  return (
    <section id="accueil" className="on-dark graph-paper relative overflow-hidden bg-paddy-deep text-white">
      {/* Halo discret derrière le texte : le vert n'est pas un aplat uniforme. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,rgb(255_255_255/0.07),transparent_55%)]"
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pt-14 pb-36 sm:px-6 sm:pb-44 lg:grid-cols-12 lg:items-center lg:gap-14 lg:px-8 lg:pt-16">
        <div className="lg:col-span-7">
          <p className="running-head max-w-xl">
            <span className="text-white">Institut national de la statistique</span>
          </p>
          <h1 className="mt-6 max-w-[18ch] text-4xl leading-[1.08] font-bold tracking-[-0.02em] sm:text-5xl">
            Les statistiques officielles de Madagascar
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Publications, bases de données et indicateurs sur la population, l'économie et les conditions de vie, produits par
            l'INSTAT.
          </p>
          <PublicationSearch />
          <nav aria-label="Accès rapide" className="mt-5 flex max-w-xl flex-wrap items-center gap-2 text-sm">
            <span className="mr-1 text-white/60">Accès rapide :</span>
            {shortcuts.map((shortcut) => (
              <a
                key={shortcut.href}
                href={shortcut.href}
                className="border border-white/25 px-3 py-1 text-white/90 transition-colors hover:border-white/60 hover:bg-white/10 hover:text-white"
              >
                {shortcut.label}
              </a>
            ))}
          </nav>
          <LatestRelease />
        </div>

        {/* min-w-0 : sans lui, la colonne prendrait la largeur cumulée de toutes les actualités du carrousel. */}
        <div className="min-w-0 lg:col-span-5">
          {result.status === "ready" && result.data.length > 0 ? (
            <NewsCarousel news={result.data} />
          ) : result.status === "loading" ? (
            <NewsSkeleton />
          ) : (
            // Même hauteur que le carrousel : la page ne « saute » pas quand les actualités arrivent.
            <p role="status" className="flex min-h-[20rem] items-center bg-white px-5 py-8 text-sm text-muted">
              {result.status === "error" ? `Actualités indisponibles. ${result.message}` : "Aucune actualité pour le moment."}
            </p>
          )}
        </div>
      </div>

      {/* Histogramme décoratif : il fait la transition avec la page. */}
      <DecorativeBars />
    </section>
  );
}

/** Carte des actualités en attente, à la hauteur du carrousel (sur fond blanc, comme lui). */
function NewsSkeleton() {
  return (
    <LoadingRegion label="Chargement des actualités…" className="min-h-[20rem] bg-white text-ink">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="px-5 py-5">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="mt-4 h-6 w-11/12" />
        <Skeleton className="mt-2.5 h-6 w-3/4" />
        <SkeletonText lines={1} className="mt-5 w-1/2" />
        <Skeleton className="mt-8 h-4 w-28" />
      </div>
    </LoadingRegion>
  );
}
