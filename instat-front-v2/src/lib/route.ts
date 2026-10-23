import { useEffect, useState } from "react";

/**
 * Routage minimal par « hash » (#/admin/publications).
 * Les ancres de la page d'accueil (#chiffres, #publications…) ne commencent pas par « #/ » :
 * elles ne sont donc pas des routes et la page d'accueil reste affichée.
 * À remplacer par React Router quand le site public aura ses propres pages.
 */
function parse(hash: string): string[] {
  if (!hash.startsWith("#/")) return [];
  return hash
    .slice(2)
    .split("?")[0]!
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));
}

function same(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((segment, i) => segment === b[i]);
}

/** Segments de la route courante : « #/admin/chiffres/types » → ["admin", "chiffres", "types"]. */
export function useRoute(): string[] {
  const [segments, setSegments] = useState(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = () => {
      const next = parse(window.location.hash);
      setSegments((previous) => (same(previous, next) ? previous : next));
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return segments;
}

export function navigate(href: string): void {
  window.location.hash = href.startsWith("#") ? href : `#${href}`;
}
