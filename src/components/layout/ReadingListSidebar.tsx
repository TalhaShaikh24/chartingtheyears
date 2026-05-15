'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/kit/Icon';
import { useReadingList } from '@/hooks/useReadingList';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import apiClient from '@/lib/apiClient';
import './ReadingListSidebar.css';

interface Book {
  _id: string;
  category: string;
}

const HISTORY_CATEGORIES = [
  'Social History',
  'Economic History',
  'Military History',
  'Political History',
  'General History',
  'Historical Novels',
];

function SidebarContent() {
  const [books, setBooks] = useState<Book[]>([]);
  const searchParams = useSearchParams();
  const activeCategory = searchParams?.get('category') || 'All';
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { settings } = useSettings();

  // Unified hook — IDs come from localStorage (guest) or DB (auth)
  const { ids, isReady } = useReadingList();

  // Fetch minimal book data (just category) for the sidebar counts
  useEffect(() => {
    if (!isReady) return;

    if (ids.length === 0) {
      setBooks([]);
      return;
    }

    let cancelled = false;
    Promise.allSettled(
      ids.map((id) =>
        apiClient.get<{ data: Book }>(`/api/books/${id}`).then((r) => r.data.data)
      )
    ).then((results) => {
      if (cancelled) return;
      const valid = results
        .filter((r): r is PromiseFulfilledResult<Book> => r.status === 'fulfilled')
        .map((r) => r.value);
      setBooks(valid);
    });

    return () => { cancelled = true; };
  }, [ids, isReady]);

  // Compute category counts from fetched books
  const categoryCounts = books.reduce((acc, book) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <aside className="rl-sidebar">
      <div className="rl-sidebar-logo">
        <Link href="/user" className="rl-sidebar-logo-link">
          <span className="rl-sidebar-logo-icon">
            <Icon name="logo" size={26} />
          </span>
          <span className="rl-sidebar-logo-name">{settings.siteName}</span>
        </Link>
      </div>

      <nav className="rl-sidebar-nav">
        <div className="rl-filters-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          <h2>Categories</h2>
        </div>

        <div className="rl-categories-list">
          <Link
            href="/user/reading-list"
            className={`rl-category-link${activeCategory === 'All' ? ' rl-category-link--active' : ''}`}
          >
            <span className="rl-category-name">All Books</span>
            <div className="rl-category-line" />
            <span className="rl-category-count">{ids.length}</span>
          </Link>

          {HISTORY_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isActive = activeCategory === cat;
            return (
              <Link
                key={cat}
                href={count > 0 ? `/user/reading-list?category=${encodeURIComponent(cat)}` : '#'}
                className={`rl-category-link${isActive ? ' rl-category-link--active' : ''}${count === 0 ? ' rl-category-link--disabled' : ''}`}
                onClick={(e) => { if (count === 0) e.preventDefault(); }}
              >
                <span className="rl-category-name">{cat}</span>
                <div className="rl-category-line" />
                <span className="rl-category-count">{count}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="rl-sidebar-footer">
        {isAdmin && (
          <Link href="/admin/dashboard" className="rl-admin-btn">
            Click Here to Visit Admin Dashboard
          </Link>
        )}
      </div>
    </aside>
  );
}

export function ReadingListSidebar() {
  return (
    <Suspense fallback={<aside className="rl-sidebar" />}>
      <SidebarContent />
    </Suspense>
  );
}
