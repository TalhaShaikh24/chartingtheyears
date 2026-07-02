'use client';

import { useState, useEffect, useCallback, Suspense, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { BookCard } from '@/components/features/BookCard';
import { BookPopupModal } from '@/components/features/BookPopupModal';
import { useReadingList } from '@/hooks/useReadingList';
import { useFilter } from '@/contexts/FilterContext';
import { useSettings } from '@/contexts/SettingsContext';
import apiClient from '@/lib/apiClient';
import './user.css';

// Dynamically import the heavy SVG map so it splits into its own JS chunk
const HistoricalMap = dynamic(
  () => import('@/components/features/HistoricalMap'),
  { ssr: false, loading: () => <div className="map-wrapper" style={{ backgroundColor: '#F5EEE4' }} /> },
);

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

const ERAS = ['All', 'Ancient', '1900-1920', '1940', '1980', '2000', '2026'];
const CATEGORIES = [
  'All',
  'Social History',
  'Economic History',
  'Military History',
  'Political History',
  'General History',
  'Historical Novels',
];

// Full allowed year range — only send yearMin/yearMax to API when user deviates
// Full allowed year range — only send yearMin/yearMax to API when user deviates
const FULL_YEAR_MIN = -1250;
const FULL_YEAR_MAX = 2026;

// Each era maps to the year range shown/used in the API filter
const ERA_YEAR_RANGES: Record<string, [number, number]> = {
  All:         [-1250, 2026],
  Ancient:     [-1250, 1899],
  '1900-1920': [1900, 1920],
  '1940':      [1921, 1960],
  '1980':      [1961, 1990],
  '2000':      [1991, 2010],
  '2026':      [2011, 2026],
};

function HomeContent() {
  const { settings } = useSettings();
  // Declare context hooks first — used in effects below
  const { filters, setYearRange } = useFilter();
  const { isInList, toggleBook } = useReadingList();

  // Default to 'All' so all countries with books are highlighted immediately.
  // Override once with settings.defaultEra when admin has configured one.
  const [activeEra, setActiveEra] = useState<string | null>('All');
  const [eraInitialised, setEraInitialised] = useState(false);
  useEffect(() => {
    if (!eraInitialised && settings.defaultEra) {
      setActiveEra(settings.defaultEra);
      setYearRange(ERA_YEAR_RANGES[settings.defaultEra] ?? [FULL_YEAR_MIN, FULL_YEAR_MAX]);
      setEraInitialised(true);
    }
  }, [settings.defaultEra, eraInitialised, setYearRange]);

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
  // Always-current books list for stable click handler (no re-creates on book changes)
  const booksRef = useRef<Book[]>([]);
  booksRef.current = books;

  const getQueryParams = useCallback((currentPage: number, extra?: Record<string, string>) => {
    const params = new URLSearchParams();
    params.set('status', 'published');

    const booksPerPage = settings.booksPerPage || 20;
    params.set('limit', booksPerPage.toString());
    params.set('skip', ((currentPage - 1) * booksPerPage).toString());

    if (activeEra) params.set('era', activeEra);
    if (activeCategory && activeCategory !== 'All') params.set('category', activeCategory);
    if (selectedCountry) params.set('country', selectedCountry);

    if (filters.lang.length > 0) params.set('lang', filters.lang.join(','));
    if (filters.type.length > 0) params.set('type', filters.type.join(','));

    // Only send year range if user actually narrowed it from the full range
    if (
      filters.yearRange &&
      (filters.yearRange[0] > FULL_YEAR_MIN || filters.yearRange[1] < FULL_YEAR_MAX)
    ) {
      params.set('yearMin', filters.yearRange[0].toString());
      params.set('yearMax', filters.yearRange[1].toString());
    }

    if (filters.rating > 0) params.set('rating', filters.rating.toString());
    if (filters.tags) params.set('tags', filters.tags);

    if (extra) {
      Object.entries(extra).forEach(([k, v]) => params.set(k, v));
    }

    return params.toString();
  }, [activeEra, activeCategory, selectedCountry, filters, settings.booksPerPage]);

  // Initial load — AbortController cancels in-flight request when deps change
  useEffect(() => {
    if (activeEra === null) {
      setBooks([]);
      setTotal(0);
      setHighlightedCountries([]);
      setBookCountByCountry({});
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchInitialBooks = async () => {
      try {
        setLoading(true);
        const queryStr = getQueryParams(1);
        const response = await apiClient.get<{
          data: Book[];
          total: number;
          highlightedCountries: string[];
          bookCountByCountry: Record<string, number>;
        }>(`/api/books?${queryStr}`, { signal: controller.signal });

        setBooks(response.data.data);
        setTotal(response.data.total);
        setHighlightedCountries(response.data.highlightedCountries || []);
        setBookCountByCountry(response.data.bookCountByCountry || {});
        setPage(1);
      } catch (err: any) {
        if (err?.code !== 'ERR_CANCELED' && err?.name !== 'CanceledError') {
          console.error('Failed to fetch books', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchInitialBooks();
    return () => controller.abort();
  }, [activeEra, activeCategory, selectedCountry, filters, settings.booksPerPage, getQueryParams]);

  const fetchNextPage = useCallback(async (nextPage: number) => {
    try {
      setLoadingNext(true);
      // skip_map skips the country aggregate; skip_count skips countDocuments
      const queryStr = getQueryParams(nextPage, { skip_map: '1', skip_count: '1' });
      const response = await apiClient.get<{ data: Book[] }>(`/api/books?${queryStr}`);
      setBooks((prev) => [...prev, ...response.data.data]);
      setPage(nextPage);
    } catch (err) {
      console.error('Failed to load next page', err);
    } finally {
      setLoadingNext(false);
    }
  }, [getQueryParams]);

  // Mutable ref so the stable IntersectionObserver callback always reads latest state
  const scrollStateRef = useRef({
    total,
    page,
    booksPerPage: settings.booksPerPage || 20,
    loadingNext,
    fetchNextPage,
  });
  scrollStateRef.current = { total, page, booksPerPage: settings.booksPerPage || 20, loadingNext, fetchNextPage };

  // Stable callback ref — never changes reference, so observer never disconnects/reconnects
  const observerTarget = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) {
      observer.current.disconnect();
      observer.current = null;
    }
    if (!node) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        const { total: t, page: p, booksPerPage: bpp, loadingNext: ln, fetchNextPage: fnp } =
          scrollStateRef.current;
        if (ln) return;
        const maxPages = Math.ceil(t / bpp);
        if (p + 1 <= maxPages) fnp(p + 1);
      },
      { threshold: 0.1, rootMargin: '100px' },
    );
    observer.current.observe(node);
  }, []); // empty deps — reads from scrollStateRef

  // Stable book card click — looks up the book from the always-current ref
  const handleBookCardClick = useCallback((id: string) => {
    const book = booksRef.current.find((b) => b._id === id);
    if (book) setPopupBook(book);
  }, []);

  const handleClosePopup = useCallback(() => setPopupBook(null), []);

  const handleAddToReadingList = useCallback((book: Book) => {
    toggleBook(book._id);
  }, [toggleBook]);

  // Stable country click — toggling the same code deselects
  const handleCountryClick = useCallback((code: string) => {
    setSelectedCountry((prev) => (prev === code ? null : code));
  }, []);

  // Stable era click — resets country + syncs the sidebar year-range slider
  const handleEraClick = useCallback((era: string) => {
    setActiveEra(era);
    setSelectedCountry(null);
    setYearRange(ERA_YEAR_RANGES[era] ?? [FULL_YEAR_MIN, FULL_YEAR_MAX]);
  }, [setYearRange]);

  // Only recalculate when the country selection or book list changes
  const booksInSelection = useMemo(
    () => (selectedCountry ? books.filter((b) => b.country === selectedCountry) : []),
    [selectedCountry, books],
  );

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
          {ERAS.map((era) => (
            <button
              key={era}
              onClick={() => handleEraClick(era)}
              className={`era-btn${activeEra === era ? ' era-btn--active' : ''}`}
            >
              {era}
            </button>
          ))}
        </div>
      </div>

      {/* Map — all props are stable references; memo prevents re-renders during loading */}
      <HistoricalMap
        highlightedCountries={highlightedCountries}
        selectedCountryName={selectedCountry}
        activeEra={activeEra}
        booksInSelection={booksInSelection}
        bookCountByCountry={bookCountByCountry}
        onCountryClick={handleCountryClick}
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
            {CATEGORIES.map((cat) => (
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
                      onClickId={handleBookCardClick}
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
        onClose={handleClosePopup}
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
