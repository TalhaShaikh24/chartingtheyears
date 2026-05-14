'use client';

import { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { Icon } from '@/components/ui/kit/Icon';
import { getCountryCode, getCountryName } from '@/lib/countries';
import './HistoricalMap.css';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

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
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1.2 });

  function handleZoomIn() {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  }

  function handleZoomOut() {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  }

  function handleMoveEnd(pos: { coordinates: [number, number]; zoom: number }) {
    setPosition(pos);
  }

  return (
    <div className="map-wrapper">
      <div className="map-dot-pattern" />

      <ComposableMap
        projectionConfig={{ rotate: [-10, 0, 0], scale: 200 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates as [number, number]}
          onMoveEnd={handleMoveEnd}
        >
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
                            : 'var(--surface-3)',
                        stroke: isSelected
                          ? 'var(--ink)'
                          : isHighlighted
                            ? 'var(--accent)'
                            : 'var(--line)',
                        strokeWidth: 0.5,
                        outline: 'none',
                        transition: 'all 300ms',
                        opacity: isSelected ? 0.9 : isHighlighted ? 0.6 : 0.4,
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
        </ZoomableGroup>
      </ComposableMap>

      {/* Country Selection Overlay */}
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
                <span className="map-book-row-icon">
                  <Icon name="chevron-down" size={14} />
                </span>
              </button>
            ))}
            {booksInSelection.length === 0 && (
              <p className="map-no-books">No books found for this era</p>
            )}
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="map-controls">
        <button onClick={handleZoomIn} className="map-zoom-btn" aria-label="Zoom in">
          <Icon name="plus" size={16} />
        </button>
        <button onClick={handleZoomOut} className="map-zoom-btn" aria-label="Zoom out">
          <span className="map-zoom-minus-bar" />
        </button>
      </div>
    </div>
  );
}
