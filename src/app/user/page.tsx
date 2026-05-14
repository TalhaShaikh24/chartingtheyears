'use client';

import { useState, useEffect, useCallback } from 'react';
import { HistoricalMap } from '@/components/features/HistoricalMap';
import { BookCard } from '@/components/features/BookCard';
import { BookPopupModal } from '@/components/features/BookPopupModal';
import { useReadingList } from '@/hooks/useReadingList';
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

const eras = ['Ancient', '1900-1920', '1940', '1980', '2000', '2026'];
const categories = [
  'All',
  'Social History',
  'Economic History',
  'Military History',
  'Political History',
  'General History',
  'Historical Novels',
];

export default function UserHomePage() {
  const [activeEra, setActiveEra] = useState('1900-1920');
  const [activeCategory, setActiveCategory] = useState('All');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [popupBook, setPopupBook] = useState<Book | null>(null);

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
    if (activeEra === '1900-1920' && (book.historicalYear < 1900 || book.historicalYear > 1920)) return false;
    if (activeEra === '1940' && (book.historicalYear < 1930 || book.historicalYear > 1950)) return false;
    if (selectedCountry && book.country !== selectedCountry) return false;
    return true;
  });

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
          ) : filteredBooks.length > 0 ? (
            <div className="books-grid">
              {filteredBooks.map((book) => (
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
