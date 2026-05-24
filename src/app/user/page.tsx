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
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingNext, setLoadingNext] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [popupBook, setPopupBook] = useState<Book | null>(null);
  const [page, setPage] = useState(1);
  const [highlightedCountries, setHighlightedCountries] = useState<string[]>([]);
  const [bookCountByCountry, setBookCountByCountry] = useState<Record<string, number>>({});

  const observer = useRef<IntersectionObserver | null>(null);

  const { filters } = useFilter();

  // Unified reading list — works for guests (localStorage) and logged-in users (DB)
  const { isInList, toggleBook } = useReadingList();

  const getQueryParams = useCallback((currentPage: number) => {
    const params = new URLSearchParams();
    params.set('status', 'published');
    
    const booksPerPage = settings.booksPerPage || 20;
    params.set('limit', booksPerPage.toString());
    params.set('skip', ((currentPage - 1) * booksPerPage).toString());

    if (activeEra) params.set('era', activeEra);
    if (activeCategory && activeCategory !== 'All') params.set('category', activeCategory);
    if (selectedCountry) params.set('country', selectedCountry);

    // Sidebar filters
    if (filters.lang.length > 0) params.set('lang', filters.lang.join(','));
    if (filters.type.length > 0) params.set('type', filters.type.join(','));
    
    if (filters.yearRange) {
      params.set('yearMin', filters.yearRange[0].toString());
      params.set('yearMax', filters.yearRange[1].toString());
    }
    if (filters.rating > 0) params.set('rating', filters.rating.toString());
    if (filters.tags) params.set('tags', filters.tags);

    return params.toString();
  }, [activeEra, activeCategory, selectedCountry, filters, settings.booksPerPage]);

  // Initial load or reset
  useEffect(() => {
    if (activeEra === null) {
      setBooks([]);
      setTotal(0);
      setHighlightedCountries([]);
      setBookCountByCountry({});
      setLoading(false);
      return;
    }

    const fetchInitialBooks = async () => {
      try {
        setLoading(true);
        const queryStr = getQueryParams(1);
        const response = await apiClient.get<{
          data: Book[];
          total: number;
          highlightedCountries: string[];
          bookCountByCountry: Record<string, number>;
        }>(`/api/books?${queryStr}`);
        
        setBooks(response.data.data);
        setTotal(response.data.total);
        setHighlightedCountries(response.data.highlightedCountries || []);
        setBookCountByCountry(response.data.bookCountByCountry || {});
        setPage(1);
      } catch (err) {
        console.error('Failed to fetch books', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialBooks();
  }, [activeEra, activeCategory, selectedCountry, filters, settings.booksPerPage, getQueryParams]);

  const fetchNextPage = useCallback(async (nextPage: number) => {
    try {
      setLoadingNext(true);
      const queryStr = getQueryParams(nextPage);
      const response = await apiClient.get<{ data: Book[] }>(`/api/books?${queryStr}`);
      setBooks((prev) => [...prev, ...response.data.data]);
      setPage(nextPage);
    } catch (err) {
      console.error('Failed to load next page', err);
    } finally {
      setLoadingNext(false);
    }
  }, [getQueryParams]);

  // Infinite scroll intersection observer callback ref
  const observerTarget = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) {
      observer.current.disconnect();
      observer.current = null;
    }

    if (!node) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingNext) {
          const booksPerPage = settings.booksPerPage || 20;
          const maxPages = Math.ceil(total / booksPerPage);
          const nextPage = page + 1;
          if (nextPage <= maxPages) {
            fetchNextPage(nextPage);
          }
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.current.observe(node);
  }, [total, page, settings.booksPerPage, loadingNext, fetchNextPage]);

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
        booksInSelection={selectedCountry ? books.filter((b) => b.country === selectedCountry) : []}
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
            ) : books.length > 0 ? (
              <>
                <div className="books-grid">
                  {books.map((book) => (
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
                {books.length < total && (
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
