import { useEffect, useState, type ReactNode } from "react";
import { onActivity } from "../../lib/api";

/** Bloc gris à la forme du contenu attendu (taille et forme données par className). */
export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`skeleton block rounded-sm ${className}`} />;
}

/** Lignes de texte simulées ; la dernière est plus courte, comme une fin de paragraphe. */
export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <span aria-hidden="true" className={`block space-y-2.5 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={`h-3.5 ${i === lines - 1 && lines > 1 ? "w-3/5" : "w-full"}`} />
      ))}
    </span>
  );
}

/**
 * Zone en cours de chargement : annoncée aux lecteurs d'écran par `label`, affichée après 150 ms seulement.
 * Les squelettes à l'intérieur sont masqués aux technologies d'assistance.
 */
export function LoadingRegion({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={`loading-reveal ${className}`}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Barre fine en haut de la fenêtre pendant les requêtes vers l'API (au-delà de 300 ms). */
export function ActivityBar() {
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => onActivity(setBusy), []);
  useEffect(() => {
    if (!busy) return;
    const timer = window.setTimeout(() => setVisible(true), 300);
    return () => {
      window.clearTimeout(timer);
      setVisible(false);
    };
  }, [busy]);

  return visible ? <div aria-hidden="true" className="activity-bar" /> : null;
}
