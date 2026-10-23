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

function readQuery(): URLSearchParams {
  const hash = window.location.hash;
  const index = hash.indexOf("?");
  return new URLSearchParams(index >= 0 ? hash.slice(index + 1) : "");
}

/**
 * Paramètres après « ? » dans le hash (« #/publications?scope=regional&page=2 »).
 * Les filtres d'une liste y sont gardés : ils survivent au retour depuis une fiche.
 */
export function useHashQuery(): [URLSearchParams, (next: Record<string, string | undefined>) => void] {
  const [query, setQuery] = useState(readQuery);

  useEffect(() => {
    const onChange = () => setQuery(readQuery());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const update = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) if (value) params.set(key, value);
    const path = window.location.hash.split("?")[0]!;
    const search = params.toString();
    // Remplace l'entrée d'historique : changer de filtre ne doit pas remplir le bouton « Retour ».
    history.replaceState(null, "", search ? `${path}?${search}` : path);
    setQuery(params);
  };

  return [query, update];
}

export function navigate(href: string): void {
  window.location.hash = href.startsWith("#") ? href : `#${href}`;
}
