import { useId, useRef, useState, type KeyboardEvent } from "react";
import { MAP_HEIGHT, MAP_WIDTH, mapRegions } from "../../data/regionMap";
import { colorOf, regionKey, type ColorClass } from "./choropleth";

interface RegionMapProps {
  /** Valeur de l'indicateur choisi, par région (clé regionKey) ; une région absente n'a pas de donnée. */
  values: Map<string, number>;
  classes: ColorClass[];
  /** Valeur avec son unité, pour l'infobulle et les lecteurs d'écran. */
  format: (value: number) => string;
  selected: string | null;
  onSelect: (key: string) => void;
  /** Titre de la carte pour les lecteurs d'écran (« Densité en 2018, par région »). */
  title: string;
}

interface Tip {
  key: string;
  x: number;
  y: number;
}

const regions = mapRegions.map((region) => ({ ...region, key: regionKey(region.name) }));

/** Carte des 23 régions, colorée selon l'indicateur choisi ; clic ou Entrée sur une région pour l'ouvrir. */
export default function RegionMap({ values, classes, format, selected, onSelect, title }: RegionMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const hatchId = useId();
  const titleId = useId();

  const place = (key: string, clientX: number, clientY: number) => {
    const box = containerRef.current?.getBoundingClientRect();
    if (box) setTip({ key, x: clientX - box.left, y: clientY - box.top });
  };
  // Au clavier, l'infobulle se place au centre de la région.
  const placeOnElement = (key: string, element: Element) => {
    const box = element.getBoundingClientRect();
    place(key, box.left + box.width / 2, box.top + box.height / 2);
  };
  const onKeyDown = (event: KeyboardEvent, key: string) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect(key);
  };

  // La région ouverte est dessinée en dernier : son contour passe au-dessus de ceux des voisines.
  const ordered = selected ? [...regions.filter((r) => r.key !== selected), ...regions.filter((r) => r.key === selected)] : regions;
  const tipRegion = tip ? regions.find((r) => r.key === tip.key) : undefined;
  const tipValue = tip ? values.get(tip.key) : undefined;
  const label = (key: string) => {
    const value = values.get(key);
    return value === undefined ? "pas de donnée" : format(value);
  };

  return (
    <div ref={containerRef} className="relative" onMouseLeave={() => setTip(null)}>
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="group"
        aria-labelledby={titleId}
        className="mx-auto block h-auto max-h-[62vh] w-full"
      >
        <title id={titleId}>{title}</title>
        <defs>
          <pattern id={hatchId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#ffffff" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-rule)" strokeWidth="1.5" />
          </pattern>
        </defs>
        {ordered.map((region) => {
          const value = values.get(region.key);
          const active = region.key === selected;
          return (
            <path
              key={region.key}
              d={region.d}
              role="button"
              tabIndex={0}
              aria-pressed={active}
              aria-label={`${region.name} : ${label(region.key)}`}
              fill={value === undefined ? `url(#${hatchId})` : colorOf(classes, value)}
              stroke={active ? "var(--color-laterite)" : "#ffffff"}
              strokeWidth={active ? 2.5 : 0.8}
              strokeLinejoin="round"
              className="cursor-pointer transition-[filter] outline-none hover:brightness-90 focus-visible:brightness-90"
              onClick={() => onSelect(region.key)}
              onKeyDown={(event) => onKeyDown(event, region.key)}
              onMouseMove={(event) => place(region.key, event.clientX, event.clientY)}
              onFocus={(event) => placeOnElement(region.key, event.currentTarget)}
              onBlur={() => setTip(null)}
            />
          );
        })}
      </svg>

      {tipRegion && tip && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-10 w-max max-w-56 -translate-x-1/2 -translate-y-[calc(100%+12px)] border border-ink bg-white px-3 py-2 text-sm shadow-[0_6px_16px_-8px_rgb(16_35_27/0.45)]"
          style={{ left: tip.x, top: tip.y }}
        >
          <span className="block font-semibold">{tipRegion.name}</span>
          <span className={tipValue === undefined ? "text-muted" : "tabular-nums"}>{label(tip.key)}</span>
        </div>
      )}
    </div>
  );
}

/** Légende : une ligne par teinte, puis « Pas de donnée » (hachures). */
export function MapLegend({ classes, format }: { classes: ColorClass[]; format: (value: number) => string }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
      {classes.map((c) => (
        <li key={c.color} className="flex items-center gap-2.5 tabular-nums">
          <span aria-hidden="true" className="size-3.5 shrink-0 border border-black/10" style={{ backgroundColor: c.color }} />
          {c.min === c.max ? format(c.min) : `${format(c.min)} à ${format(c.max)}`}
        </li>
      ))}
      <li className="flex items-center gap-2.5 text-muted">
        <span
          aria-hidden="true"
          className="size-3.5 shrink-0 border border-rule"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--color-rule) 0 1.5px, #fff 1.5px 4px)" }}
        />
        Pas de donnée
      </li>
    </ul>
  );
}

/** Fond de carte en attente des données : les 23 régions en gris, qui pulsent doucement. */
export function MapSkeleton() {
  return (
    <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} aria-hidden="true" className="mx-auto block h-auto max-h-[62vh] w-full animate-pulse">
      {regions.map((region) => (
        <path key={region.key} d={region.d} fill="var(--color-line)" stroke="#ffffff" strokeWidth={0.8} strokeLinejoin="round" />
      ))}
    </svg>
  );
}
