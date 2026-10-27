import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import type { Region, Thematique } from "../admin/data/types";
import PageBanner from "../components/layout/PageBanner";
import { SAMPLE_DATA } from "../config";
import { publications as samplePublications } from "../data/publications";
import { useApiData } from "../hooks/useApiData";
import { api, errorMessage, type Page } from "../lib/api";
import { formatDate, formatNumber } from "../lib/format";
import { useHashQuery } from "../lib/route";
import type { Publication } from "../types";

const PER_PAGE = 10;

const scopes: { id: "" | Publication["scope"]; label: string }[] = [
  { id: "", label: "Toutes" },
  { id: "national", label: "Nationales" },
  { id: "regional", label: "Régionales" },
];

const fieldClass =
  "h-11 w-full border border-rule bg-white px-3 text-[0.95rem] hover:border-muted focus-visible:border-paddy focus-visible:shadow-[inset_0_0_0_1px_var(--color-paddy)] focus-visible:outline-none";

type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; page: Page<Publication> };

/** Rubrique du menu « Thèmes et données » : même liste, avec un filtre imposé. */
export interface Preset {
  kicker: string;
  title: string;
  description: string;
  /** Thématique imposée (le sélecteur de thématique est alors masqué). */
  thematiqueId?: string;
  /** Secteurs : une publication y figure si elle porte au moins l'un d'eux. */
  sectors?: string[];
}

/** Liste publique des publications : filtres gardés dans l'adresse (#/publications?scope=…&page=2). */
export default function PublicationsPage({ preset }: { preset?: Preset }) {
  const [query, setQuery] = useHashQuery();
  const scope = (query.get("scope") ?? "") as "" | Publication["scope"];
  const thematiqueId = preset?.thematiqueId ?? query.get("theme") ?? "";
  const presetSectors = preset?.sectors?.join(",") ?? "";
  const regionId = query.get("region") ?? "";
  const q = query.get("q") ?? "";
  const page = Math.max(1, Number(query.get("page")) || 1);

  const thematiques = useApiData<Thematique[]>("/thematiques", []);
  const regions = useApiData<Region[]>("/regions", []);
  const [search, setSearch] = useState(q);
  // Adresse modifiée de l'extérieur (lien, bouton « Retour ») : le champ reprend la recherche de l'adresse.
  const [lastQ, setLastQ] = useState(q);
  if (q !== lastQ) {
    setLastQ(q);
    setSearch(q);
  }
  const [state, setState] = useState<State>({ status: "loading" });
  const searchId = useId();

  const filters = { scope, theme: preset?.thematiqueId ? undefined : thematiqueId, region: regionId, q };
  const change = (patch: Partial<typeof filters & { page: string }>) =>
    setQuery({ ...filters, page: undefined, ...patch });
  // Changement de page : on remonte au début des résultats une fois la nouvelle page affichée
  // (avant, la page est encore courte et le navigateur garderait la position du bouton).
  const resultsRef = useRef<HTMLDivElement>(null);
  const scrollOnLoad = useRef(false);
  const goTo = (target: number) => {
    scrollOnLoad.current = true;
    change({ page: target > 1 ? String(target) : undefined });
  };

  // Recherche : on attend une courte pause dans la frappe avant d'interroger le service.
  useEffect(() => {
    if (search.trim() === q) return;
    const timer = window.setTimeout(() => change({ q: search.trim() }), 350);
    return () => window.clearTimeout(timer);
  });

  useEffect(() => {
    if (SAMPLE_DATA) {
      const items = samplePublications.filter((p) => !scope || p.scope === scope);
      setState({ status: "ready", page: { items: items.slice((page - 1) * PER_PAGE, page * PER_PAGE), total: items.length } });
      return;
    }
    const params = new URLSearchParams({ limit: String(PER_PAGE), offset: String((page - 1) * PER_PAGE) });
    if (scope) params.set("scope", scope);
    if (thematiqueId) params.set("thematiqueId", thematiqueId);
    if (regionId) params.set("regionId", regionId);
    if (q) params.set("q", q);
    for (const sector of presetSectors.split(",").filter(Boolean)) params.append("sector", sector);

    const controller = new AbortController();
    setState({ status: "loading" });
    api.page<Publication>(`/publications?${params}`, controller.signal).then(
      (result) => setState({ status: "ready", page: result }),
      (error: unknown) => {
        if (!controller.signal.aborted) setState({ status: "error", message: errorMessage(error, "Publications indisponibles.") });
      },
    );
    return () => controller.abort();
  }, [scope, thematiqueId, regionId, q, page, presetSectors]);

  useEffect(() => {
    if (state.status !== "ready" || !scrollOnLoad.current) return;
    scrollOnLoad.current = false;
    resultsRef.current?.scrollIntoView({ block: "start" });
    resultsRef.current?.focus({ preventScroll: true });
  }, [state]);

  const total = state.status === "ready" ? state.page.total : 0;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const first = (page - 1) * PER_PAGE;
  const sortedThemes =
    thematiques.status === "ready"
      ? thematiques.data.filter((t) => t.inMenuPublications).sort((a, b) => a.name.localeCompare(b.name, "fr"))
      : [];
  const sortedRegions =
    regions.status === "ready" ? regions.data.slice().sort((a, b) => a.name.localeCompare(b.name, "fr")) : [];
  const filtered = Boolean(scope || filters.theme || regionId || q);

  return (
    <>
      {preset ? (
        <PageBanner
          kicker={preset.kicker}
          title={preset.title}
          description={preset.description}
          crumbs={[{ label: "Publications", href: "#/publications" }, { label: preset.title }]}
        />
      ) : (
        <PageBanner
          kicker="Publications"
          title="Toutes les publications"
          description="Tableaux de bord, indices des prix, enquêtes et publications régionales de l'INSTAT."
          crumbs={[{ label: "Publications" }]}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <form
          role="search"
          aria-label="Filtrer les publications"
          onSubmit={(event) => {
            event.preventDefault();
            change({ q: search.trim() });
          }}
          className={`grid gap-4 border-t-2 border-ink pt-6 ${
            preset?.thematiqueId
              ? "md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
              : "md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]"
          }`}
        >
          <div>
            <label htmlFor={searchId} className="text-sm font-medium">
              Rechercher dans les titres
            </label>
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted" aria-hidden="true" />
              <input
                id={searchId}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="NIPC, enquête, Atsinanana…"
                className={`${fieldClass} pl-9`}
              />
            </div>
          </div>
          <label hidden={Boolean(preset?.thematiqueId)} className="text-sm font-medium">
            Thématique
            <select
              value={thematiqueId}
              onChange={(event) => change({ theme: event.target.value })}
              className={`${fieldClass} mt-1.5`}
            >
              <option value="">Toutes les thématiques</option>
              {sortedThemes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Région
            <select
              value={regionId}
              onChange={(event) => change({ region: event.target.value, scope: event.target.value ? "regional" : scope })}
              className={`${fieldClass} mt-1.5`}
            >
              <option value="">Toutes les régions</option>
              {sortedRegions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
        </form>

        <div
          ref={resultsRef}
          tabIndex={-1}
          className="mt-8 flex scroll-mt-24 flex-wrap items-end justify-between gap-4 border-b-2 border-ink focus:outline-none"
        >
          <div role="group" aria-label="Niveau" className="flex gap-8">
            {scopes.map((option) => {
              const selected = option.id === scope;
              return (
                <button
                  key={option.id || "all"}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => change({ scope: option.id, region: option.id === "national" ? "" : regionId })}
                  className={`relative -mb-[2px] pb-3 font-medium ${selected ? "text-ink" : "text-muted hover:text-ink"}`}
                >
                  {option.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0 h-[3px] ${selected ? "bg-laterite" : "bg-transparent"}`}
                  />
                </button>
              );
            })}
          </div>
          <p role="status" className="pb-3 font-mono text-xs text-muted tabular-nums">
            {state.status === "loading"
              ? "Chargement…"
              : state.status === "error"
                ? ""
                : `${formatNumber(total)} publication${total > 1 ? "s" : ""}`}
          </p>
        </div>

        {state.status === "error" && (
          <p role="alert" className="py-8 font-mono text-sm text-muted">
            Publications indisponibles. {state.message}
          </p>
        )}

        {state.status === "ready" && state.page.items.length === 0 && (
          <div className="py-10">
            <p className="text-[1.05rem]">
              {preset && !filtered
                ? "Aucune publication dans cette rubrique pour le moment."
                : "Aucune publication ne correspond à ces critères."}
            </p>
            {filtered && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setQuery({});
                }}
                className="mt-3 font-medium text-paddy underline decoration-paddy/30 underline-offset-4 hover:decoration-paddy"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        )}

        {state.status === "ready" && state.page.items.length > 0 && (
          <ol start={first + 1}>
            {state.page.items.map((publication, index) => (
              <li
                key={publication.id}
                className="group relative grid gap-x-8 gap-y-1 border-b border-line py-5 sm:grid-cols-[3rem_minmax(0,1fr)_11rem]"
              >
                <span aria-hidden="true" className="hidden pt-1 font-mono text-xs text-muted tabular-nums sm:block">
                  {String(first + index + 1).padStart(2, "0")}
                </span>
                <div>
                  <a
                    href={publication.href}
                    className="font-display text-xl leading-snug decoration-paddy/40 underline-offset-4 group-hover:text-paddy hover:underline"
                  >
                    {publication.title}
                  </a>
                  <p className="mt-1 text-sm text-muted">
                    {publication.kind}
                    {" · "}
                    {publication.scope === "regional" ? "Régionale" : "Nationale"}
                    <span className="sm:hidden">
                      {" · "}
                      <time dateTime={publication.date}>{formatDate(publication.date)}</time>
                    </span>
                  </p>
                </div>
                <time dateTime={publication.date} className="hidden pt-1.5 font-mono text-xs text-muted tabular-nums sm:block">
                  {formatDate(publication.date)}
                </time>
              </li>
            ))}
          </ol>
        )}

        {state.status === "ready" && pages > 1 && (
          <nav aria-label="Pages de résultats" className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goTo(page - 1)}
              className="inline-flex h-11 items-center gap-2 border border-rule bg-white px-4 font-medium hover:border-paddy hover:text-paddy disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Précédentes
            </button>
            <p className="font-mono text-xs text-muted tabular-nums">
              Page {page} / {pages}
            </p>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => goTo(page + 1)}
              className="inline-flex h-11 items-center gap-2 border border-rule bg-white px-4 font-medium hover:border-paddy hover:text-paddy disabled:cursor-not-allowed disabled:opacity-50"
            >
              Suivantes
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </nav>
        )}
      </div>
    </>
  );
}
