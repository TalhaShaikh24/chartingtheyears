'use client';

import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import './BookPopupModal.css';

interface PopupBook {
  _id: string;
  title: string;
  author: string;
  category: string;
  language: string;
  type: string;
  rating: number;
  historicalYear: number;
  publicationYear: number;
  reviewText?: string;
  tags?: string[];
  imageUrl?: string;
  country: string;
}

interface BookPopupModalProps {
  book: PopupBook | null;
  onClose: () => void;
  onAddToReadingList: (book: PopupBook) => void;
  isInReadingList: boolean;
}

const PLACEHOLDER_BASE = 'https://placehold.co/400x533/1a1a1a/ff4500?text=';

export function BookPopupModal({
  book,
  onClose,
  onAddToReadingList,
  isInReadingList,
}: BookPopupModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!book) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [book, handleKeyDown]);

  if (!book || !mounted) return null;

  const imgSrc = book.imageUrl || `${PLACEHOLDER_BASE}${encodeURIComponent(book.title)}`;
  const historicalRange = `${book.historicalYear}–${book.publicationYear}`;

  return createPortal(
    <div
      className="bpm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Book details: ${book.title}`}
    >
      {/* Backdrop */}
      <div className="bpm-backdrop" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div className="bpm-panel">
        {/* Left — Cover */}
        <div className="bpm-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={`Cover of ${book.title}`}
            className="bpm-cover-img"
          />
        </div>

        {/* Right — Details */}
        <div className="bpm-content">
          {/* Close button */}
          <button
            className="bpm-close"
            onClick={onClose}
            aria-label="Close popup"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <h2 className="bpm-title">{book.title}</h2>

          {/* Tags row */}
          <div className="bpm-tags-row">
            {book.country && <span className="bpm-tag bpm-tag--dark">{book.country}</span>}
            <span className="bpm-tag bpm-tag--outline">{book.category}</span>
            <span className="bpm-tag bpm-tag--outline">{book.language}</span>
            <span className="bpm-tag bpm-tag--outline">{book.type}</span>
          </div>

          {/* Star rating */}
          <div className="bpm-stars" aria-label={`Rating: ${book.rating} out of 5`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`bpm-star${i <= Math.round(book.rating) ? ' bpm-star--filled' : ''}`}
              >
                ★
              </span>
            ))}
          </div>

          {/* Year grid */}
          <div className="bpm-year-grid">
            <div className="bpm-year-cell">
              <span className="bpm-year-label">HISTORICAL RANGE</span>
              <span className="bpm-year-value">{historicalRange}</span>
            </div>
            <div className="bpm-year-cell">
              <span className="bpm-year-label">PUBLICATION YEAR</span>
              <span className="bpm-year-value">{book.publicationYear}</span>
            </div>
          </div>

          {/* Description */}
          {book.reviewText && (
            <div className="bpm-description">
              <p>{book.reviewText}</p>
            </div>
          )}

          {/* Assigned tags */}
          {book.tags && book.tags.length > 0 && (
            <div className="bpm-assigned-tags">
              <span className="bpm-assigned-tags-label">Assigned tags</span>
              <div className="bpm-assigned-tags-list">
                {book.tags.map((tag) => (
                  <span key={tag} className="bpm-assigned-tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="bpm-actions">
            <Link
              href={`/user/books/${book._id}`}
              className="bpm-btn bpm-btn--primary"
              onClick={onClose}
            >
              Open full review page
            </Link>
            <button
              type="button"
              className={`bpm-btn${isInReadingList ? ' bpm-btn--added' : ' bpm-btn--outline'}`}
              onClick={() => onAddToReadingList(book)}
            >
              {isInReadingList ? '✓ In reading list' : 'Add to reading list'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
