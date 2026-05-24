'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { HistoricalMap } from '@/components/features/HistoricalMap';
import { BookCard } from '@/components/features/BookCard';
import { BookPopupModal } from '@/components/features/BookPopupModal';
import { useReadingList } from '@/hooks/useReadingList';
import { useFilter } from '@/contexts/FilterContext';
import { useSettings } from '@/contexts/SettingsContext';
import apiClient from '@/lib/apiClient';
import './user.css';

interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  language: string;
  type: string;
  rating: number;
  country: string;
  historicalYear: number;
  publicationYear: number;
  reviewText?: string;
  tags?: string[];
  imageUrl?: string;
}

const eras = ['All', 'Ancient', '1900-1920', '1940', '1980', '2000', '2026'];
const categories = [
  'All',
  'Social History',
  'Economic History',
  'Military History',
  'Political History',
  'General History',
  'Historical Novels',
];

function HomeContent() {
  const { settings } = useSettings();

  // null = no era selected (initial idle state)
  const [activeEra, setActiveEra] = useState<string | null>(null);
  const [eraInitialised, setEraInitialised] = useState(false);
  useEffect(() => {
    if (!eraInitialised && settings.defaultEra) {
      setActiveEra(settings.defaultEra);
      setEraInitialised(true);
    }
  }, [settings.defaultEra, eraInitialised]);

  const [activeCategory, setActiveCategory] = useState('All');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [popupBook, setPopupBook] = useState<Book | null>(null);

  const [visibleCount, setVisibleCount] = useState(20);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const { filters } = useFilter();

  // Unified reading list — works for guests (localStorage) and logged-in users (DB)
  const { isInList, toggleBook } = useReadingList();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<{ data: Book[] }>('/api/books?limit=1000&status=published');
        setBooks(response.data.data);
      } catch (err) {
        console.error('Failed to fetch books', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Reset visible count when settings or filters change
  useEffect(() => {
    setVisibleCount(settings.booksPerPage || 20);
  }, [activeEra, activeCategory, selectedCountry, filters, settings.booksPerPage]);

  // No era selected → show nothing until the user picks one
  const filteredBooks = activeEra === null ? [] : books.filter((book) => {
    if (activeCategory !== 'All' && book.category !== activeCategory) return false;
    if (selectedCountry && book.country !== selectedCountry) return false;

    if (activeEra === 'Ancient' && book.publicationYear >= 1900) return false;
    if (activeEra === '1900-1920' && (book.publicationYear < 1900 || book.publicationYear > 1920)) return false;
    if (activeEra === '1940' && (book.publicationYear <= 1920 || book.publicationYear > 1960)) return false;
    if (activeEra === '1980' && (book.publicationYear <= 1960 || book.publicationYear > 1990)) return false;
    if (activeEra === '2000' && (book.publicationYear <= 1990 || book.publicationYear > 2010)) return false;
    if (activeEra === '2026' && book.publicationYear <= 2010) return false;

    // Sidebar Filters
    if (filters.lang.length > 0 && !filters.lang.includes(book.language)) return false;
    if (filters.type.length > 0 && !filters.type.includes(book.type)) return false;
    if (book.publicationYear < filters.yearRange[0]) return false;
    if (book.publicationYear > filters.yearRange[1]) return false;
    if (filters.rating > 0 && book.rating < filters.rating) return false;
    if (filters.tags) {
      const tagSearch = filters.tags.toLowerCase();
      const match = book.tags?.some(t => t.toLowerCase().includes(tagSearch)) || false;
      if (!match) return false;
    }

    return true;
  });

  // Infinite scroll intersection observer
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + (settings.booksPerPage || 20), filteredBooks.length));
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [filteredBooks.length, visibleCount, settings.booksPerPage]);

  const pagedBooks = filteredBooks.slice(0, visibleCount);

  const highlightedCountries = Array.from(new Set(filteredBooks.map((b) => b.country)));

  // Book count per country — drives glow intensity in the map
  const bookCountByCountry: Record<string, number> = {};
  for (const book of filteredBooks) {
    bookCountByCountry[book.country] = (bookCountByCountry[book.country] ?? 0) + 1;
  }

  const handleAddToReadingList = useCallback((book: Book) => {
    toggleBook(book._id);
  }, [toggleBook]);

  return (
    <div className="user-page">
      {/* Header */}
      <div className="user-page-header">
        <div className="user-page-heading-group">
          <p className="user-page-eyebrow">Atlas Interaction</p>
          <h1 className="user-page-title">
            Countries {activeEra && <><span className="user-page-title-sep">•</span> {activeEra}</>}
          </h1>
          <p className="user-page-subtitle">
            Explore literature through time and geography. Select an era or click a country on the map.
          </p>
        </div>

        <div className="era-switcher">
          {eras.map((era) => (
            <button
              key={era}
              onClick={() => { setActiveEra(era); setSelectedCountry(null); }}
              className={`era-btn${activeEra === era ? ' era-btn--active' : ''}`}
            >
              {era}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <HistoricalMap
        highlightedCountries={highlightedCountries}
        selectedCountryName={selectedCountry}
        activeEra={activeEra}
        booksInSelection={filteredBooks.filter((b) => b.country === selectedCountry)}
        bookCountByCountry={bookCountByCountry}
        onCountryClick={(name) => setSelectedCountry(selectedCountry === name ? null : name)}
      />

      {/* Categories + Books */}
      {activeEra === null ? (
        <div className="section-idle-state">
          <div className="section-idle-icon">
            <img src="/icon-svgs/books.svg" alt="" width="48" height="48" />
          </div>
          <p className="section-idle-title">Select an era to get started</p>
          <p className="section-idle-sub">Choose a time period above — the map and book collection will come to life.</p>
        </div>
      ) : (
        <div className="category-section">
          <div className="category-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`cat-btn${activeCategory === cat ? ' cat-btn--active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="books-grid-wrap">
            {loading ? (
              <div className="skeleton-grid">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="book-skeleton" />
                ))}
              </div>
            ) : pagedBooks.length > 0 ? (
              <>
                <div className="books-grid">
                  {pagedBooks.map((book) => (
                    <BookCard
                      key={book._id}
                      _id={book._id}
                      title={book.title}
                      author={book.author}
                      category={book.category}
                      language={book.language}
                      rating={book.rating}
                      imageUrl={book.imageUrl}
                      onClick={() => setPopupBook(book)}
                    />
                  ))}
                </div>
                {visibleCount < filteredBooks.length && (
                  <div ref={observerTarget} className="load-more-trigger">
                    <div className="spinner" />
                    <span>Loading more books...</span>
                  </div>
                )}
              </>
            ) : (
              <div className="books-empty">
                <p>No books found for this selection.</p>
                <button
                  className="books-empty-clear"
                  onClick={() => { setSelectedCountry(null); setActiveCategory('All'); }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Book Popup Modal */}
      <BookPopupModal
        book={popupBook}
        onClose={() => setPopupBook(null)}
        onAddToReadingList={handleAddToReadingList}
        isInReadingList={popupBook ? isInList(popupBook._id) : false}
      />
    </div>
  );
}

export default function UserHomePage() {
  return (
    <Suspense fallback={<div className="user-page">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
