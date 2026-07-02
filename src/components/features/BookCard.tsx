'use client';

import { memo, useCallback } from 'react';
import { Stars } from '@/components/ui/kit/Stars';
import './BookCard.css';

interface BookCardProps {
  _id?: string;
  title: string;
  author: string;
  category: string;
  language: string;
  rating: number;
  imageUrl?: string;
  onClick?: () => void;
  onClickId?: (id: string) => void;
}

const PLACEHOLDER_BASE = 'https://placehold.co/400x533/EADCCB/453C38?text=';

export const BookCard = memo(function BookCard({
  _id,
  title,
  author,
  category,
  language,
  rating,
  imageUrl,
  onClick,
  onClickId,
}: BookCardProps) {
  const imgSrc = imageUrl || `${PLACEHOLDER_BASE}${encodeURIComponent(title)}`;

  // Stable handler — only recreates when _id / callbacks change.
  // Callers using onClickId with a parent useCallback let memo skip
  // re-renders on unrelated state changes like the popup opening/closing.
  const handleClick = useCallback(() => {
    if (onClickId && _id) onClickId(_id);
    else if (onClick) onClick();
  }, [_id, onClick, onClickId]);

  const isClickable = Boolean(onClick || (onClickId && _id));

  return (
    <div
      className={`book-card${isClickable ? ' book-card--clickable' : ''}`}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }
          : undefined
      }
      aria-label={isClickable ? `View details for ${title}` : undefined}
    >
      <div className="book-card-image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={title}
          loading="lazy"
        />
      </div>

      <div className="book-card-body">
        <div>
          <h3 className="book-card-title">{title}</h3>
          <p className="book-card-author">{author}</p>
        </div>

        <div className="book-card-badges">
          <span className="book-card-badge-category">{category}</span>
          <span className="book-card-badge-language">{language}</span>
        </div>

        <div className="book-card-stars">
          <Stars value={Math.round(rating)} size={14} />
        </div>
      </div>
    </div>
  );
});
