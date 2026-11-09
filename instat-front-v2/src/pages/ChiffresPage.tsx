import { useId, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import type { DataType, FigureRegion, FigureValue, IndicatorDef, Region } from "../admin/data/types";
import { quantileClasses, regionKey } from "../components/chiffres/choropleth";
import RegionMap, { MapLegend, MapSkeleton } from "../components/chiffres/RegionMap";
import RegionSheet from "../components/chiffres/RegionSheet";
import { StatusLine } from "../components/home/SectionHead";
import PageBanner from "../components/layout/PageBanner";
import { LoadingRegion, Skeleton, SkeletonText } from "../components/ui/Skeleton";
import { mapRegions } from "../data/regionMap";
import { useApiData } from "../hooks/useApiData";
import { byName, byPeriodDesc, formatValue } from "../lib/format";
import { useHashQuery } from "../lib/route";

const fieldClass =
  "mt-1.5 h-11 w-full border border-rule bg-white px-3 text-[0.95rem] font-normal hover:border-muted focus-visible:border-paddy focus-visible:shadow-[inset_0_0_0_1px_var(--color-paddy)] focus-visible:outline-none";

const mapChoices = mapRegions.map((region) => ({ key: regionKey(region.name), name: region.name })).sort(byName);

/**
 * « Madagascar en chiffres » : carte des régions colorée selon un indicateur, et fiche de la région choisie.
 * Choix gardés dans l'adresse (#/madagascar-en-chiffres?region=analamanga&indicateur=ind-densite&annee=2018).
 */
export default function ChiffresPage() {
  const [query, setQuery] = useHashQuery();
  const types = useApiData<DataType[]>("/chiffres/types", []);
  const indicators = useApiData<IndicatorDef[]>("/chiffres/indicators", []);
  const figureRegions = useApiData<FigureRegion[]>("/chiffres/regions", []);
  const values = useApiData<FigureValue[]>("/chiffres/values", []);
  // Région du service Publications : nom à jour et lien vers ses publications.
  const regions = useApiData<Region[]>("/regions", []);
  const sheetRef = useRef<HTMLDivElement>(null);
  const indicatorFieldId = useId();

  const loads = [types, indicators, figureRegions, values];
  const failed = loads.find((load) => load.status === "error");
  if (failed?.status === "error" || loads.some((load) => load.status !== "ready")) {
    return (
      <>
        <Banner />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {failed?.status === "error" ? (
            <StatusLine className="border-t-2 border-ink">Données indisponibles. {failed.message}</StatusLine>
          ) : (
            <ChiffresSkeleton />
          )}
        </div>
      </>
    );
  }

  const typeList = types.status === "ready" ? types.data : [];
  const indicatorList = indicators.status === "ready" ? indicators.data : [];
  const figureList = figureRegions.status === "ready" ? figureRegions.data : [];
  const valueList = values.status === "ready" ? values.data : [];
  const regionList = regions.status === "ready" ? regions.data : [];

  // Chaque « région en chiffres » est rattachée à une région du fond de carte par son nom
  // (celui de la région du service Publications quand elle y est reliée).
  const regionName = (figure: FigureRegion) => regionList.find((r) => r.id === figure.regionId)?.name ?? figure.name;
  const national = figureList.find((figure) => !figure.regionId);
  const figureByKey = new Map(figureList.filter((f) => f.regionId).map((f) => [regionKey(regionName(f)), f]));
  const keyByFigure = new Map([...figureByKey].map(([key, figure]) => [figure.id, key]));
  const regionalValues = valueList.filter((v) => keyByFigure.has(v.figureRegionId));

  // Indicateurs proposés pour la carte : ceux qui ont au moins une valeur régionale, groupés par type.
  const coverage = new Map<string, Set<string>>();
  for (const v of regionalValues) coverage.set(v.indicatorId, (coverage.get(v.indicatorId) ?? new Set()).add(v.figureRegionId));
  const mapIndicators = indicatorList.filter((indicator) => coverage.has(indicator.id));
  const mostCovered = mapIndicators.reduce<IndicatorDef | undefined>(
    (best, indicator) => (!best || coverage.get(indicator.id)!.size > coverage.get(best.id)!.size ? indicator : best),
    undefined,
  );
  const indicator = mapIndicators.find((i) => i.id === query.get("indicateur")) ?? mostCovered;

  const indicatorValues = regionalValues.filter((v) => v.indicatorId === indicator?.id);
  const years = [...new Set(indicatorValues.map((v) => v.year))].sort((a, b) => b - a);
  const year = years.find((y) => String(y) === query.get("annee")) ?? years[0];
  // Valeurs mensuelles d'une même année : la plus récente l'emporte (classées de la plus ancienne à la plus récente).
  const shown = indicatorValues.filter((v) => v.year === year).sort((a, b) => byPeriodDesc(b, a));
  const byKey = new Map(shown.map((v) => [keyByFigure.get(v.figureRegionId)!, v.value]));
  const unit = shown[0]?.unit ?? "";
  const classes = quantileClasses([...byKey.values()]);
  const withUnit = (value: number) => `${formatValue(value)}${unit ? ` ${unit}` : ""}`;

  const selected = mapChoices.find((choice) => choice.key === query.get("region"))?.key ?? null;
  const selectedName = mapChoices.find((choice) => choice.key === selected)?.name;
  const sheetFigure = selected ? figureByKey.get(selected) : national;
  const sheetValues = sheetFigure ? valueList.filter((v) => v.figureRegionId === sheetFigure.id) : [];
  const selectedValue = selected ? byKey.get(selected) : undefined;
  const publicationsRegion = selected ? regionList.find((r) => regionKey(r.name) === selected) : undefined;

  const update = (patch: { region?: string | null; indicateur?: string; annee?: string | null }) =>
    setQuery({
      region: patch.region === undefined ? (selected ?? undefined) : (patch.region ?? undefined),
      indicateur: patch.indicateur ?? (indicator && indicator !== mostCovered ? indicator.id : undefined),
      annee: patch.annee === undefined ? query.get("annee") ?? undefined : (patch.annee ?? undefined),
    });

  const selectRegion = (key: string | null) => {
    update({ region: key });
    // Sur petit écran, la fiche est sous la carte : on y descend.
    if (key && !window.matchMedia("(min-width: 1024px)").matches) {
      requestAnimationFrame(() => sheetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  return (
    <>
      <Banner />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-6">
              {indicator ? (
                <>
                  <div className={`grid gap-4 border-t-2 border-ink pt-5 ${years.length > 1 ? "sm:grid-cols-[minmax(0,1fr)_8rem]" : ""}`}>
                    <label htmlFor={indicatorFieldId} className="text-sm font-medium">
                      Colorer la carte selon
                      <select
                        id={indicatorFieldId}
                        value={indicator.id}
                        onChange={(event) => update({ indicateur: event.target.value, annee: null })}
                        className={fieldClass}
                      >
                        {typeList.map((type) => {
                          const options = mapIndicators.filter((i) => i.typeId === type.id);
                          return (
                            options.length > 0 && (
                              <optgroup key={type.id} label={type.name}>
                                {options.map((i) => (
                                  <option key={i.id} value={i.id}>
                                    {i.name}
                                  </option>
                                ))}
                              </optgroup>
                            )
                          );
                        })}
                      </select>
                    </label>
                    {years.length > 1 && (
                      <label className="text-sm font-medium">
                        Année
                        <select
                          value={year}
                          onChange={(event) => update({ annee: event.target.value })}
                          className={fieldClass}
                        >
                          {years.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>

                  <figure className="mt-6 border border-line bg-white p-4 sm:p-6">
                    <figcaption className="text-sm">
                      <span className="font-semibold">{indicator.name}</span>
                      <span className="text-muted">
                        {unit && ` (${unit})`}, {year} · {byKey.size} régions sur {mapChoices.length}
                      </span>
                    </figcaption>
                    <div className="mt-4">
                      <RegionMap
                        values={byKey}
                        classes={classes}
                        format={withUnit}
                        selected={selected}
                        onSelect={selectRegion}
                        title={`${indicator.name} en ${year}, par région`}
                      />
                    </div>
                    <div className="mt-5 border-t border-line pt-4">
                      <MapLegend classes={classes} format={formatValue} />
                    </div>
                  </figure>
                </>
              ) : (
                <p className="border-t-2 border-ink pt-5 text-[0.95rem] text-muted">
                  Aucune valeur régionale n'est encore publiée : la carte s'affichera dès la première saisie.
                </p>
              )}

              <label className="mt-6 block text-sm font-medium">
                Choisir une région
                <select
                  value={selected ?? ""}
                  onChange={(event) => selectRegion(event.target.value || null)}
                  className={fieldClass}
                >
                  <option value="">Madagascar (niveau national)</option>
                  {mapChoices.map((choice) => (
                    <option key={choice.key} value={choice.key}>
                      {choice.name}
                    </option>
                  ))}
                </select>
              </label>
              <p className="mt-4 text-xs leading-relaxed text-muted">
                Découpage régional de 2021 (23 régions). Fond de carte : geoBoundaries, d'après BNGRC / OCHA et OpenStreetMap.
              </p>
            </div>
          </div>

          <div ref={sheetRef} className="scroll-mt-6 lg:col-span-7">
            {selected && (
              <button
                type="button"
                onClick={() => selectRegion(null)}
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-paddy hover:underline hover:underline-offset-4"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Madagascar (niveau national)
              </button>
            )}
            <RegionSheet
              name={selectedName ?? national?.name ?? "Madagascar"}
              national={!selected}
              values={sheetValues}
              types={typeList}
              indicators={indicatorList}
              rank={
                indicator && selectedValue !== undefined
                  ? {
                      indicator: `${indicator.name} en ${year}`,
                      value: withUnit(selectedValue),
                      position: 1 + [...byKey.values()].filter((v) => v > selectedValue).length,
                      count: byKey.size,
                    }
                  : undefined
              }
              publicationsHref={
                publicationsRegion ? `#/publications?scope=regional&region=${encodeURIComponent(publicationsRegion.id)}` : undefined
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}

function Banner() {
  return (
    <PageBanner
      kicker="Données régionales"
      title="Madagascar en chiffres"
      description="Les principaux indicateurs du pays et de ses 23 régions. Choisissez un indicateur pour colorer la carte, puis une région pour ouvrir sa fiche."
      crumbs={[{ label: "Madagascar en chiffres" }]}
    />
  );
}

/** Même disposition que la page : réglages et carte à gauche, fiche à droite. */
function ChiffresSkeleton() {
  return (
    <LoadingRegion label="Chargement des données…" className="grid gap-12 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-5">
        <div className="border-t-2 border-ink pt-5">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="mt-2 h-11 w-full" />
        </div>
        <div className="mt-6 border border-line bg-white p-4 sm:p-6">
          <Skeleton className="h-4 w-2/3" />
          <div className="mt-4">
            <MapSkeleton />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-4 sm:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-3.5 w-24" />
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-7">
        <div className="border-t-2 border-ink pt-5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-3 h-9 w-56" />
        </div>
        {Array.from({ length: 3 }, (_, group) => (
          <div key={group} className="mt-10">
            <Skeleton className="h-3 w-44" />
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                <SkeletonText lines={1} className="w-1/2" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}
