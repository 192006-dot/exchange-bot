'use client';
import { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import worldData from 'world-atlas/countries-110m.json';
import { universities } from '@/data/universities';
import { uniCoordinates } from '@/data/uni-coordinates';

/**
 * Landing-page world map.
 * Uses react-simple-maps + world-atlas topojson (110m resolution).
 * Pins every partner uni that has a known coordinate.
 * Client-only render to avoid SSR hydration-mismatch on Marker transforms.
 */

// react-simple-maps expects topojson as URL or object. We import the
// JSON directly and cast to the expected shape.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const topoData = worldData as any;

export function WorldMap() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const locations = universities
    .map(u => ({ uni: u, coords: uniCoordinates[u.id] }))
    .filter((x): x is { uni: typeof universities[number]; coords: [number, number] } => Boolean(x.coords));

  if (!mounted) {
    return (
      <div className="relative w-full aspect-[2/1] bg-gradient-to-b from-zinc-50 to-zinc-100 overflow-hidden">
        <div className="absolute top-6 left-6 md:top-10 md:left-10 max-w-sm">
          <h3 className="text-2xl md:text-3xl font-bold tracking-[-0.02em] text-zinc-950 mb-2">
            Weltkarte
          </h3>
          <p className="text-[14px] md:text-[15px] text-zinc-600">
            Karte wird geladen…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[2/1] bg-gradient-to-b from-zinc-50 to-zinc-100 overflow-hidden">
      <ComposableMap
        projectionConfig={{ scale: 155 }}
        viewBox="0 0 800 400"
        width={800}
        height={400}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={topoData}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#e4e4e7"
                stroke="#d4d4d8"
                strokeWidth={0.4}
                style={{
                  default: { outline: 'none' },
                  hover: { outline: 'none', fill: '#d4d4d8' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>
        {locations.map(({ uni, coords }) => (
          <Marker key={uni.id} coordinates={coords}>
            <circle r={2.2} fill="#10b981" stroke="#fff" strokeWidth={0.6} opacity={0.9} />
          </Marker>
        ))}
      </ComposableMap>

      {/* Overlay label */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 max-w-sm pointer-events-none">
        <h3 className="text-2xl md:text-3xl font-bold tracking-[-0.02em] text-zinc-950 mb-2">
          Weltkarte
        </h3>
        <p className="text-[14px] md:text-[15px] text-zinc-600">
          {locations.length} Partner-Unis weltweit — jeder grüne Pin ein möglicher Zielort.
        </p>
      </div>
    </div>
  );
}
