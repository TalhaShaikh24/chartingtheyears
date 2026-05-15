'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
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

  // Initialise era from settings; update when settings load (once)
  const [activeEra, setActiveEra] = useState<string>('All');
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

  const { filters } = useFilter();

  // Unified reading list — works for guests (localStorage) and logged-in users (DB)
  const { isInList, toggleBook } = useReadingList();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<{ data: Book[] }>('/api/books');
        setBooks(response.data.data);
      } catch (err) {
        console.error('Failed to fetch books', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const filteredBooks = books.filter((book) => {
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

  // Respect booksPerPage setting from admin
  const booksPerPage = settings.booksPerPage || 20;
  const pagedBooks = filteredBooks.slice(0, booksPerPage);

  const highlightedCountries = Array.from(new Set(filteredBooks.map((b) => b.country)));

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
            Countries <span className="user-page-title-sep">•</span> {activeEra}
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
        onCountryClick={(name) => setSelectedCountry(selectedCountry === name ? null : name)}
      />

      {/* Categories + Books */}
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
