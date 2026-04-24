import type { Dimension, DimensionScores } from '@/lib/types';

const AXES: { dim: Dimension; label: string }[] = [
  { dim: 'academic', label: 'Academic' },
  { dim: 'career', label: 'Career' },
  { dim: 'city', label: 'City' },
  { dim: 'climate', label: 'Climate' },
  { dim: 'travel', label: 'Travel' },
  { dim: 'social', label: 'Social' },
];

type Props = {
  scores: DimensionScores;
  size?: number;
  color?: string;
};

/**
 * 6-axis radar chart visualising a uni profile across the most-important
 * scoring dimensions. Scores are normalised 0–1 from the 1–5 uni scale.
 */
export function RadarChart({ scores, size = 300, color = '#10b981' }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 44;
  const count = AXES.length;

  // Compute axis endpoints
  const axisPoints = AXES.map((_, i) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      angle,
    };
  });

  // Concentric polygons at 25/50/75/100%
  const gridPolygons = [0.25, 0.5, 0.75, 1].map(ratio =>
    axisPoints
      .map(p => `${cx + (p.x - cx) * ratio},${cy + (p.y - cy) * ratio}`)
      .join(' '),
  );

  // Uni polygon
  const normalised = AXES.map((a, i) => {
    const score = scores[a.dim]; // 1..5
    const ratio = (score - 1) / 4; // 0..1
    return {
      x: cx + (axisPoints[i].x - cx) * ratio,
      y: cy + (axisPoints[i].y - cy) * ratio,
    };
  });
  const uniPolyPoints = normalised.map(p => `${p.x},${p.y}`).join(' ');

  // Label positions (slightly outside axis ends)
  const labelPositions: Array<{ x: number; y: number; label: string; anchor: 'middle' | 'start' | 'end' }> = AXES.map((axis, i) => {
    const { angle } = axisPoints[i];
    const labelR = radius + 22;
    const cos = Math.cos(angle);
    const anchor: 'middle' | 'start' | 'end' =
      Math.abs(cos) < 0.1 ? 'middle' : cos > 0 ? 'start' : 'end';
    return {
      x: cx + cos * labelR,
      y: cy + Math.sin(angle) * labelR,
      label: axis.label,
      anchor,
    };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" aria-hidden>
      {/* Grid polygons */}
      {gridPolygons.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="#e4e4e7"
          strokeWidth="1"
        />
      ))}
      {/* Axis lines */}
      {axisPoints.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e4e4e7" strokeWidth="1" />
      ))}
      {/* Uni polygon */}
      <polygon
        points={uniPolyPoints}
        fill={color}
        fillOpacity="0.18"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Dots */}
      {normalised.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} />
      ))}
      {/* Labels */}
      {labelPositions.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={l.y}
          textAnchor={l.anchor}
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="600"
          fill="#52525b"
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
}
