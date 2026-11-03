/**
 * Carte décorative de Madagascar pour le panneau de la page de connexion : l'île en trame de points (comme une
 * carte de densité), son contour, trois parallèles en pointillé et Antananarivo en rouge.
 * Contour simplifié à partir des coordonnées de la côte (projection équirectangulaire, ~50 points).
 */
const ISLAND =
  "M237.8 18.0 L244.7 34.0 L263.6 62.0 L265.5 76.0 L272.0 110.8 L276.2 136.0 L283.7 150.8 L273.1 170.0 L259.8 158.0 L254.2 168.0 L263.6 192.0 L256.0 214.0 L246.6 236.0 L242.8 266.0 L229.5 302.0 L226.8 313.2 L212.4 356.0 L202.9 389.2 L190.4 426.0 L183.2 452.8 L174.5 474.0 L161.2 516.0 L151.0 541.2 L129.0 548.0 L98.6 562.0 L81.6 564.0 L56.9 552.0 L37.9 538.0 L26.6 512.0 L25.4 474.0 L17.1 436.0 L14.0 410.0 L28.4 380.0 L48.6 351.2 L55.0 324.0 L45.5 288.0 L37.9 262.4 L37.9 232.0 L53.1 188.0 L79.7 180.0 L110.0 170.0 L125.9 168.8 L147.9 150.0 L163.1 136.0 L180.2 125.2 L187.8 100.0 L201.0 84.0 L218.1 74.0 L227.6 58.0 L231.4 40.0 Z";

/** Parallèles tracés : 14°, 18° et 22° sud, en ordonnée dans le repère de la carte. */
const PARALLELS = [14, 18, 22].map((lat) => (lat - 11.5) * 40);

const ANTANANARIVO = { x: 171.5, y: 296.4 };

export default function MadagascarMap({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-40 0 374 580" aria-hidden="true" className={className}>
      <defs>
        <pattern id="map-dots" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="1.5" fill="rgb(255 255 255 / 0.32)" />
        </pattern>
        <clipPath id="map-island">
          <path d={ISLAND} />
        </clipPath>
      </defs>

      {PARALLELS.map((y) => (
        <line key={y} x1="-40" x2="334" y1={y} y2={y} stroke="rgb(255 255 255 / 0.12)" strokeDasharray="2 6" />
      ))}

      <rect x="0" y="0" width="300" height="580" fill="url(#map-dots)" clipPath="url(#map-island)" />
      <path d={ISLAND} fill="none" stroke="rgb(255 255 255 / 0.35)" strokeWidth="1.2" strokeLinejoin="round" />

      <circle cx={ANTANANARIVO.x} cy={ANTANANARIVO.y} r="11" fill="var(--color-laterite)" opacity="0.25" />
      <circle cx={ANTANANARIVO.x} cy={ANTANANARIVO.y} r="4.5" fill="var(--color-laterite)" />
      <text x={ANTANANARIVO.x - 12} y={ANTANANARIVO.y + 4} textAnchor="end" fill="rgb(255 255 255 / 0.75)" fontSize="12">
        Antananarivo
      </text>
    </svg>
  );
}
