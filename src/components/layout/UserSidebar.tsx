'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/kit/Icon';
import { DualSlider } from '@/components/ui/kit/DualSlider';
import { TagSelect } from '@/components/ui/kit/TagSelect';
import { useFilter } from '@/contexts/FilterContext';
import { useSettings } from '@/contexts/SettingsContext';
import './UserSidebar.css';
import '@/app/user/user.css';

function SidebarContent({ isMobileOpen, onClose }: { isMobileOpen?: boolean; onClose?: () => void }) {
  const { settings } = useSettings();
  const {
    filters,
    setLang,
    setType,
    setYearRange,
    setRating,
    setTags,
  } = useFilter();

  const handleLangToggle = (l: string) => {
    const next = filters.lang.includes(l) 
      ? filters.lang.filter((x) => x !== l) 
      : [...filters.lang, l];
    setLang(next);
  };

  const handleTypeToggle = (t: string) => {
    const next = filters.type.includes(t) 
      ? filters.type.filter((x) => x !== t) 
      : [...filters.type, t];
    setType(next);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="sidebar-mobile-overlay" onClick={onClose} aria-hidden="true" />
      )}
      <aside className={`sidebar ${isMobileOpen ? 'sidebar--mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <Link href="/user" className="sidebar-logo-link" onClick={onClose}>
            <span className="sidebar-logo-icon">
              <Icon name="logo" size={26} />
            </span>
            <span className="sidebar-logo-name">{settings.siteName}</span>
          </Link>
          {isMobileOpen && (
            <button className="sidebar-close-btn" onClick={onClose}>
              <Icon name="plus" size={24} style={{ transform: 'rotate(45deg)' }} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="filters-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <h2>Filters</h2>
          </div>

          <div className="filters-body">
            {/* Language */}
            <div className="filter-group">
              <h3 className="filter-group-title">Language</h3>
              <div className="filter-checkboxes">
                {['English', 'French'].map((l) => (
                  <label key={l} className="kit-checkbox-label">
                    <div className="kit-checkbox-wrapper">
                      <input 
                        type="checkbox" 
                        className="kit-checkbox-input" 
                        checked={filters.lang.includes(l)}
                        onChange={() => handleLangToggle(l)} 
                      />
                      <svg className="kit-checkbox-checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="kit-checkbox-text">{l}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="divider" />

            {/* Type */}
            <div className="filter-group">
              <h3 className="filter-group-title">Type</h3>
              <div className="filter-checkboxes">
                {['Fiction', 'Non-Fiction'].map((t) => (
                  <label key={t} className="kit-checkbox-label">
                    <div className="kit-checkbox-wrapper">
                      <input 
                        type="checkbox" 
                        className="kit-checkbox-input" 
                        checked={filters.type.includes(t)}
                        onChange={() => handleTypeToggle(t)} 
                      />
                      <svg className="kit-checkbox-checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="kit-checkbox-text">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="divider" />

            {/* Publication Year */}
            <div className="kit-slider-wrap">
              <div className="kit-slider-header">
                <span className="kit-slider-label">Publication Year</span>
                <span className="kit-slider-value">{filters.yearRange[0]}–{filters.yearRange[1]}</span>
              </div>
              <DualSlider 
                min={1800} 
                max={2026} 
                value={filters.yearRange} 
                onChange={setYearRange} 
              />
            </div>

            <hr className="divider" />

            {/* Book Rating */}
            <div className="kit-slider-wrap">
              <div className="kit-slider-header">
                <span className="kit-slider-label">Book Rating</span>
                <span className="kit-slider-value">{filters.rating > 0 ? `${filters.rating}+ stars` : 'All'}</span>
              </div>
              <input
                type="range"
                className="kit-slider-input"
                min={0}
                max={5}
                step={1}
                value={filters.rating}
                onChange={(e) => setRating(Number(e.target.value))}
              />
              <div className="rating-stars-display" aria-label="Select rating">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    className="rating-star-btn"
                    onClick={() => setRating(i)}
                    aria-label={`${i} stars`}
                  >
                    <Icon 
                      name="star" 
                      size={20} 
                      style={{ 
                        color: i <= filters.rating ? 'var(--ink)' : 'var(--line)', 
                        transition: 'color 0.2s'
                      }} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <hr className="divider" />

            {/* Tags */}
            <div className="filter-group">
              <h3 className="filter-group-title">Tags</h3>
              <div className="tag-search-wrap">
                <span className="tag-search-icon">
                  <Icon name="search" size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Type to search tags"
                  className="tag-search-input"
                  value={filters.tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
              <div className="tag-select-wrap">
                <TagSelect value={filters.tags} onChange={setTags} />
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}

export function UserSidebar() {
  const { filters, setMobileFiltersOpen } = useFilter();

  const handleClose = () => {
    setMobileFiltersOpen(false);
  };

  return (
    <Suspense fallback={<aside className="sidebar" />}>
      <SidebarContent isMobileOpen={filters.mobileFiltersOpen} onClose={handleClose} />
    </Suspense>
  );
}
