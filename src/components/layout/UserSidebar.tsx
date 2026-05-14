'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/kit/Icon';
import './UserSidebar.css';
import '@/app/user/user.css';

export function UserSidebar() {
  const [publicationYear, setPublicationYear] = useState(1910);
  const [rating, setRating] = useState(1);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Link href="/user" className="sidebar-logo-link">
          <span className="sidebar-logo-icon">
            <Icon name="logo" size={26} />
          </span>
          <span className="sidebar-logo-name">Charting the Years</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {/* Filters header */}
        <div className="filters-header">
          <Icon name="grid" size={20} />
          <h2>Filters</h2>
        </div>

        <div className="filters-body">
          {/* Language */}
          <div className="filter-group">
            <h3 className="filter-group-title">Language</h3>
            <div className="filter-checkboxes">
              <label className="kit-checkbox-label">
                <div className="kit-checkbox-wrapper">
                  <input type="checkbox" className="kit-checkbox-input" defaultChecked />
                  <svg className="kit-checkbox-checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="kit-checkbox-text">English</span>
              </label>
              <label className="kit-checkbox-label">
                <div className="kit-checkbox-wrapper">
                  <input type="checkbox" className="kit-checkbox-input" />
                  <svg className="kit-checkbox-checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="kit-checkbox-text">French</span>
              </label>
            </div>
          </div>

          <hr className="divider" />

          {/* Type */}
          <div className="filter-group">
            <h3 className="filter-group-title">Type</h3>
            <div className="filter-checkboxes">
              <label className="kit-checkbox-label">
                <div className="kit-checkbox-wrapper">
                  <input type="checkbox" className="kit-checkbox-input" />
                  <svg className="kit-checkbox-checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="kit-checkbox-text">Fiction</span>
              </label>
              <label className="kit-checkbox-label">
                <div className="kit-checkbox-wrapper">
                  <input type="checkbox" className="kit-checkbox-input" defaultChecked />
                  <svg className="kit-checkbox-checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="kit-checkbox-text">Non-Fiction</span>
              </label>
            </div>
          </div>

          <hr className="divider" />

          {/* Publication Year */}
          <div className="kit-slider-wrap">
            <div className="kit-slider-header">
              <span className="kit-slider-label">Publication Year</span>
              <span className="kit-slider-value">{publicationYear}–1920</span>
            </div>
            <input
              type="range"
              className="kit-slider-input"
              min={1900}
              max={1920}
              value={publicationYear}
              onChange={(e) => setPublicationYear(Number(e.target.value))}
            />
          </div>

          <hr className="divider" />

          {/* Book Rating */}
          <div className="kit-slider-wrap">
            <div className="kit-slider-header">
              <span className="kit-slider-label">Book Rating</span>
              <span className="kit-slider-value">{rating}+ stars</span>
            </div>
            <input
              type="range"
              className="kit-slider-input"
              min={1}
              max={5}
              step={1}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
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
              />
            </div>
            <div className="tag-select-wrap">
              <select className="tag-select">
                <option>All tags</option>
              </select>
              <span className="tag-select-chevron">
                <Icon name="chevron-down" size={14} />
              </span>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
