'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useReadingList } from '@/hooks/useReadingList';
import apiClient from '@/lib/apiClient';
import './reading-list.css';

interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  language: string;
  rating: number;
  imageUrl?: string;
  publicationYear: number;
  reviewText?: string;
}

function ReadingListContent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const activeCategory = searchParams?.get('category') || 'All';

  // Unified reading list hook — handles guest vs. authenticated seamlessly
  const { ids, removeBook, isReady } = useReadingList();

  // Fetch full book details whenever the IDs list changes
  useEffect(() => {
    if (!isReady) return;

    if (ids.length === 0) {
      setBooks([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled(
          ids.map((id) =>
            apiClient.get<{ data: Book }>(`/api/books/${id}`).then((r) => r.data.data)
          )
        );
        if (!cancelled) {
          const valid = results
            .filter((r): r is PromiseFulfilledResult<Book> => r.status === 'fulfilled')
            .map((r) => r.value);
          setBooks(valid);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBooks();
    return () => { cancelled = true; };
  }, [ids, isReady]);

  const handleRemove = useCallback((id: string) => {
    removeBook(id);
    setBooks((prev) => prev.filter((b) => b._id !== id));
  }, [removeBook]);

  const filteredBooks = books.filter((book) =>
    activeCategory === 'All' || book.category === activeCategory
  );

  return (
    <div className="rl-page">
      <div className="rl-header">
        <h1 className="rl-title">Reading list</h1>
        {!loading && filteredBooks.length > 0 && (
          <span className="rl-count-pill">{filteredBooks.length} saved</span>
        )}
      </div>

      {loading ? (
        <div className="rl-skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rl-skeleton-card" />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="rl-empty">
          <div className="rl-empty-icon" aria-hidden="true">☆</div>
          <h2 className="rl-empty-title">Your reading list is empty</h2>
          <p className="rl-empty-subtitle">
            {books.length === 0
              ? 'Discover books on the Atlas and add them to your list.'
              : `No books found in the "${activeCategory}" category.`}
          </p>
          <Link href="/user" className="rl-empty-cta">
            Explore the Atlas
          </Link>
        </div>
      ) : (
        <div className="rl-list">
          {filteredBooks.map((book) => (
            <div key={book._id} className="rl-card">
              <Link href={`/user/books/${book._id}`} className="rl-card-cover-link">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    book.imageUrl ||
                    `https://placehold.co/400x533/EADCCB/453C38?text=${encodeURIComponent(book.title)}`
                  }
                  alt={`Cover of ${book.title}`}
                  className="rl-card-cover"
                  loading="lazy"
                />
              </Link>

              <div className="rl-card-body">
                <Link href={`/user/books/${book._id}`} className="rl-card-title-link">
                  <h2 className="rl-card-title">
                    {book.title} {book.publicationYear ? `(${book.publicationYear})` : ''}
                  </h2>
                </Link>
                <p className="rl-card-author">{book.author}</p>

                <div className="rl-card-meta">
                  <span className="rl-card-badge">{book.category}</span>
                  <div className="rl-card-stars" aria-label={`Rating: ${book.rating} out of 5`}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className={`rl-star${i <= Math.round(book.rating) ? ' rl-star--filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {book.reviewText && (
                  <p className="rl-card-desc">{book.reviewText}</p>
                )}
              </div>

              <div className="rl-card-actions">
                <button
                  type="button"
                  className="rl-card-remove"
                  onClick={() => handleRemove(book._id)}
                  aria-label={`Remove ${book.title} from reading list`}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReadingListPage() {
  return (
    <Suspense fallback={<div className="rl-page" />}>
      <ReadingListContent />
    </Suspense>
  );
}
