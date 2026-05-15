'use client';

import { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Annotation,
} from 'react-simple-maps';
import { Icon } from '@/components/ui/kit/Icon';
import { getCountryCode, getCountryName } from '@/lib/countries';
import { useSettings } from '@/contexts/SettingsContext';
import './HistoricalMap.css';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

/** Palette definitions for each map style */
const MAP_STYLES: Record<string, {
  ocean: string;
  countryFill: string;
  countryStroke: string;
  labelFill: string;
}> = {
  'Parchment': {
    ocean: '#F5EEE4',  // very light warm cream (background/ocean)
    countryFill: '#CDBFAA',  // warm tan/khaki (inactive countries)
    countryStroke: '#BDB0A0',  // subtle warm border
    labelFill: '#3D2F22',  // dark warm brown (labels)
  },
  'Dark Ocean': {
    ocean: '#2e2a24',
    countryFill: '#4a443c',
    countryStroke: '#5c5448',
    labelFill: 'oklch(0.85 0.02 70)',
  },
  'Light Ocean': {
    ocean: '#d6e8f0',
    countryFill: '#c8d8e2',
    countryStroke: '#9ab5c4',
    labelFill: 'oklch(0.28 0.03 220)',
  },
};

const DEFAULT_STYLE = MAP_STYLES['Parchment'];

/**
 * Country label configuration.
 * Each entry: [name, longitude, latitude, minZoom, tier]
 * - minZoom: zoom level at which this label becomes visible
 * - tier 1 = large country, tier 2 = medium, tier 3 = smaller
 */
const COUNTRY_LABELS: Array<{ name: string; lon: number; lat: number; minZoom: number }> = [
  // ── Tier 1: always visible (minZoom 1.0) ────────────────────────────────
  { name: 'Russia', lon: 96, lat: 62, minZoom: 1.0 },
  { name: 'Canada', lon: -96, lat: 60, minZoom: 1.0 },
  { name: 'United States', lon: -97, lat: 39, minZoom: 1.0 },
  { name: 'China', lon: 104, lat: 36, minZoom: 1.0 },
  { name: 'Brazil', lon: -52, lat: -10, minZoom: 1.0 },
  { name: 'Australia', lon: 134, lat: -27, minZoom: 1.0 },
  { name: 'India', lon: 80, lat: 22, minZoom: 1.0 },
  { name: 'Greenland', lon: -42, lat: 72, minZoom: 1.0 },
  { name: 'Algeria', lon: 3, lat: 28, minZoom: 1.0 },
  { name: 'Kazakhstan', lon: 66, lat: 48, minZoom: 1.0 },
  { name: 'Saudi Arabia', lon: 45, lat: 24, minZoom: 1.0 },
  { name: 'Mexico', lon: -102, lat: 24, minZoom: 1.0 },
  { name: 'Indonesia', lon: 117, lat: -2, minZoom: 1.0 },
  { name: 'Mongolia', lon: 103, lat: 46, minZoom: 1.0 },
  { name: 'Sudan', lon: 30, lat: 15, minZoom: 1.0 },
  { name: 'Argentina', lon: -64, lat: -36, minZoom: 1.0 },
  { name: 'Libya', lon: 18, lat: 27, minZoom: 1.0 },
  { name: 'Iran', lon: 53, lat: 32, minZoom: 1.0 },
  // ── Tier 2: visible at zoom ≥ 1.7 ───────────────────────────────────────
  { name: 'Nigeria', lon: 8, lat: 10, minZoom: 1.7 },
  { name: 'Egypt', lon: 30, lat: 27, minZoom: 1.7 },
  { name: 'South Africa', lon: 25, lat: -29, minZoom: 1.7 },
  { name: 'Pakistan', lon: 70, lat: 30, minZoom: 1.7 },
  { name: 'Turkey', lon: 35, lat: 39, minZoom: 1.7 },
  { name: 'France', lon: 2.5, lat: 46, minZoom: 1.7 },
  { name: 'Germany', lon: 10, lat: 51, minZoom: 1.7 },
  { name: 'Ukraine', lon: 32, lat: 49, minZoom: 1.7 },
  { name: 'Spain', lon: -3, lat: 40, minZoom: 1.7 },
  { name: 'Peru', lon: -75, lat: -10, minZoom: 1.7 },
  { name: 'Colombia', lon: -74, lat: 4, minZoom: 1.7 },
  { name: 'Angola', lon: 18, lat: -12, minZoom: 1.7 },
  { name: 'Ethiopia', lon: 40, lat: 8, minZoom: 1.7 },
  { name: 'Mali', lon: -2, lat: 18, minZoom: 1.7 },
  { name: 'Mozambique', lon: 35, lat: -18, minZoom: 1.7 },
  { name: 'Chad', lon: 18, lat: 15, minZoom: 1.7 },
  { name: 'Bolivia', lon: -65, lat: -17, minZoom: 1.7 },
  { name: 'Myanmar', lon: 96, lat: 20, minZoom: 1.7 },
  { name: 'Afghanistan', lon: 67, lat: 34, minZoom: 1.7 },
  { name: 'Iraq', lon: 44, lat: 33, minZoom: 1.7 },
  { name: 'Venezuela', lon: -66, lat: 8, minZoom: 1.7 },
  // ── Tier 3: visible at zoom ≥ 2.6 ───────────────────────────────────────
  { name: 'Poland', lon: 20, lat: 52, minZoom: 2.6 },
  { name: 'United Kingdom', lon: -2, lat: 54, minZoom: 2.6 },
  { name: 'Sweden', lon: 18, lat: 62, minZoom: 2.6 },
  { name: 'Norway', lon: 9, lat: 62, minZoom: 2.6 },
  { name: 'Finland', lon: 26, lat: 64, minZoom: 2.6 },
  { name: 'Morocco', lon: -6, lat: 32, minZoom: 2.6 },
  { name: 'Uzbekistan', lon: 63, lat: 41, minZoom: 2.6 },
  { name: 'Thailand', lon: 101, lat: 15, minZoom: 2.6 },
  { name: 'Vietnam', lon: 108, lat: 16, minZoom: 2.6 },
  { name: 'Malaysia', lon: 110, lat: 2, minZoom: 2.6 },
  { name: 'Romania', lon: 25, lat: 46, minZoom: 2.6 },
  { name: 'Chile', lon: -71, lat: -35, minZoom: 2.6 },
  { name: 'Tanzania', lon: 35, lat: -6, minZoom: 2.6 },
  { name: 'Kenya', lon: 38, lat: 0, minZoom: 2.6 },
  { name: 'Somalia', lon: 46, lat: 6, minZoom: 2.6 },
  { name: 'Zambia', lon: 28, lat: -13, minZoom: 2.6 },
  { name: 'Zimbabwe', lon: 30, lat: -20, minZoom: 2.6 },
  { name: 'Japan', lon: 138, lat: 37, minZoom: 2.6 },
  { name: 'South Korea', lon: 128, lat: 36, minZoom: 2.6 },
  { name: 'Philippines', lon: 122, lat: 12, minZoom: 2.6 },
  { name: 'Italy', lon: 12, lat: 43, minZoom: 2.6 },
  { name: 'Greece', lon: 22, lat: 39, minZoom: 2.6 },
  { name: 'Belarus', lon: 28, lat: 53, minZoom: 2.6 },
  { name: 'Syria', lon: 38, lat: 35, minZoom: 2.6 },
  { name: 'Cameroon', lon: 12, lat: 5, minZoom: 2.6 },
  { name: 'Niger', lon: 8, lat: 17, minZoom: 2.6 },
  { name: 'New Zealand', lon: 172, lat: -42, minZoom: 2.6 },
];

interface HistoricalMapProps {
  highlightedCountries: string[];
  selectedCountryName: string | null;
  activeEra: string;
  booksInSelection: { title: string }[];
  onCountryClick?: (countryName: string) => void;
}

export function HistoricalMap({
  highlightedCountries,
  selectedCountryName,
  activeEra,
  booksInSelection,
  onCountryClick,
}: HistoricalMapProps) {
  const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1.2 });
  const { settings } = useSettings();

  // Resolve active palette from settings
  const palette = MAP_STYLES[settings.mapStyle] ?? DEFAULT_STYLE;

  function handleZoomIn() {
    if (position.zoom >= 6) return;
    setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 6) }));
  }

  function handleZoomOut() {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 1) }));
  }

  function handleMoveEnd(pos: { coordinates: [number, number]; zoom: number }) {
    setPosition(pos);
  }

  const zoom = position.zoom;

  // Labels scale inversely with zoom to stay readable in screen pixels
  // Base size at zoom=1 is 5px on the SVG — appears correct in screen space
  const baseFontSize = 5;
  const labelFontSize = baseFontSize / zoom;

  return (
    <div className="map-wrapper" style={{ backgroundColor: palette.ocean }}>
      <div className="map-dot-pattern" />

      <ComposableMap
        projectionConfig={{ rotate: [-10, 0, 0], scale: 200 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
        >
          {/* ── Country shapes ── */}
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const name = geo.properties.name;
                const countryCode = getCountryCode(name);
                const isSelected = selectedCountryName === countryCode;
                const isHighlighted = highlightedCountries.includes(countryCode);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => onCountryClick?.(countryCode)}
                    style={{
                      default: {
                        fill: isSelected
                          ? 'var(--ink)'
                          : isHighlighted
                            ? 'var(--accent)'
                            : palette.countryFill,
                        stroke: isSelected
                          ? 'var(--ink)'
                          : isHighlighted
                            ? 'var(--accent)'
                            : palette.countryStroke,
                        strokeWidth: 0.5,
                        outline: 'none',
                        transition: 'fill 300ms, stroke 300ms, opacity 300ms',
                        opacity: isSelected ? 0.9 : isHighlighted ? 0.7 : 1,
                      },
                      hover: {
                        fill: 'var(--accent)',
                        stroke: 'var(--accent)',
                        strokeWidth: 0.5,
                        outline: 'none',
                        cursor: 'pointer',
                        opacity: 0.8,
                      },
                      pressed: {
                        fill: 'var(--ink)',
                        stroke: 'var(--ink)',
                        strokeWidth: 0.5,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* ── Country labels (zoom-tiered) ── */}
          {COUNTRY_LABELS.filter((lbl) => zoom >= lbl.minZoom).map((lbl) => {
            const code = getCountryCode(lbl.name);
            const isHighlighted = highlightedCountries.includes(code);
            const isSelected = selectedCountryName === code;

            // Opacity fades in smoothly as zoom crosses the threshold
            const fadeOpacity = Math.min((zoom - lbl.minZoom + 0.3) / 0.3, 1);

            return (
              <Annotation
                key={lbl.name}
                subject={[lbl.lon, lbl.lat]}
                dx={0}
                dy={0}
                connectorProps={{}}
              >
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontSize: `${labelFontSize}px`,
                    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                    fontWeight: isHighlighted || isSelected ? 700 : 500,
                    fill: isSelected
                      ? 'var(--canvas)'
                      : isHighlighted
                        ? 'oklch(0.18 0.015 60)'
                        : palette.labelFill,
                    opacity: fadeOpacity,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    letterSpacing: '0.01em',
                    textShadow: '0 0 4px var(--surface-2)',
                  }}
                >
                  {lbl.name}
                </text>
              </Annotation>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* ── Country Selection Overlay ── */}
      {selectedCountryName && (
        <div className="map-selection-overlay">
          <div>
            <h2 className="map-overlay-country">{getCountryName(selectedCountryName)}</h2>
            <p className="map-overlay-era">Coverage: {activeEra}</p>
          </div>

          <div className="map-book-list">
            {booksInSelection.slice(0, 4).map((book, idx) => (
              <button key={idx} className="map-book-row">
                <span className="map-book-row-title">{book.title}</span>
                <span className="map-book-row-chevron">›</span>
              </button>
            ))}
            {booksInSelection.length === 0 && (
              <p className="map-no-books">No books found for this era</p>
            )}
          </div>
        </div>
      )}

      {/* ── Zoom Controls ── */}
      <div className="map-controls">
        <button onClick={handleZoomIn} className="map-zoom-btn" aria-label="Zoom in">
          <Icon name="plus" size={16} />
        </button>
        <button onClick={handleZoomOut} className="map-zoom-btn" aria-label="Zoom out">
          <span className="map-zoom-minus-bar" />
        </button>
      </div>

      {/* ── Zoom level indicator ── */}
      <div className="map-zoom-badge">
        {zoom < 1.7 ? 'World view' : zoom < 2.6 ? 'Regional view' : 'Country view'}
      </div>
    </div>
  );
}
