'use client';

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
}

const PLACEHOLDER_BASE = 'https://placehold.co/400x533/EADCCB/453C38?text=';

export function BookCard({
  title,
  author,
  category,
  language,
  rating,
  imageUrl,
  onClick,
}: BookCardProps) {
  const imgSrc = imageUrl || `${PLACEHOLDER_BASE}${encodeURIComponent(title)}`;

  return (
    <div
      className={`book-card${onClick ? ' book-card--clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      aria-label={onClick ? `View details for ${title}` : undefined}
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
}
