import { mapRegions } from "../../data/regionMap";
import { regionKey } from "./choropleth";

interface Shape {
  d: string;
  viewBox: string;
}

// Cadre de chaque région, calculé une fois : les tracés ne contiennent que des points absolus (M x,y L x,y … Z).
const shapes = new Map<string, Shape>(
  mapRegions.map((region) => {
    const numbers = region.d.match(/-?\d+(\.\d+)?/g)!.map(Number);
    const xs = numbers.filter((_, i) => i % 2 === 0);
    const ys = numbers.filter((_, i) => i % 2 === 1);
    const [x, y] = [Math.min(...xs), Math.min(...ys)];
    const [w, h] = [Math.max(...xs) - x, Math.max(...ys) - y];
    const pad = Math.max(w, h) * 0.04;
    return [regionKey(region.name), { d: region.d, viewBox: `${x - pad} ${y - pad} ${w + 2 * pad} ${h + 2 * pad}` }];
  }),
);

/** Vrai si le nom correspond à l'une des 23 régions du fond de carte. */
export function isOnMap(name: string): boolean {
  return shapes.has(regionKey(name));
}

/**
 * Silhouette d'une région, tirée du fond de carte (pas d'image à envoyer).
 * Rien n'est affiché si le nom ne correspond à aucune région de la carte.
 */
export default function RegionSilhouette({ name, className = "size-12" }: { name: string; className?: string }) {
  const shape = shapes.get(regionKey(name));
  if (!shape) return null;
  return (
    <svg viewBox={shape.viewBox} aria-hidden="true" className={`shrink-0 ${className}`}>
      <path d={shape.d} fill="currentColor" stroke="none" />
    </svg>
  );
}
