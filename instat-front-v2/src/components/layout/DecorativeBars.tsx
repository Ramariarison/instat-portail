/** Hauteurs (en %) des barres de l'histogramme décoratif. */
const bars = [18, 24, 30, 22, 36, 44, 38, 52, 60, 48, 66, 72, 58, 82, 70, 64, 56, 48, 52, 40, 44, 34, 30, 36, 26, 22, 28, 20, 16, 22, 14, 18];
const HIGHLIGHT = 13;

/**
 * Histogramme décoratif posé en bas du bandeau vert de l'accueil : il se dessine au chargement.
 * `color` : couleur des barres, celle du fond qui suit le bandeau.
 */
export default function DecorativeBars({ color = "bg-paper", className = "h-24 sm:h-32" }: { color?: string; className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-[3px] px-[3px] ${className}`}>
      {bars.map((height, i) => (
        <span
          key={i}
          className={`bar-grow flex-1 ${i === HIGHLIGHT ? "bg-laterite" : color}`}
          style={{ height: `${height}%`, animationDelay: `${i * 22}ms` }}
        />
      ))}
    </div>
  );
}
