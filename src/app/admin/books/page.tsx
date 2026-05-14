'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/kit/Card';
import { KitButton } from '@/components/ui/kit/Button';
import { KitBadge } from '@/components/ui/kit/Badge';
import { Stars } from '@/components/ui/kit/Stars';
import { Icon } from '@/components/ui/kit/Icon';
import { Modal } from '@/components/ui/kit/Modal';
import apiClient from '@/lib/apiClient';
import { getApiErrorMessage, showApiToast } from '@/components/ui/kit/Toast';

interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  historicalYear: number;
  rating: number;
  status: 'draft' | 'published';
  createdAt?: string;
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<{ data: Book[] }>('/api/books');
        setBooks(response.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const filtered = useMemo(
    () =>
      books.filter(
        (b) =>
          b.title.toLowerCase().includes(q.toLowerCase()) ||
          b.author.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, books],
  );

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    try {
      setDeletingId(bookToDelete._id);
      await apiClient.delete(`/api/books/${bookToDelete._id}`);
      setBooks((prev) => prev.filter((b) => b._id !== bookToDelete._id));
      showApiToast({
        variant: 'success',
        title: 'Book deleted',
        message: `"${bookToDelete.title}" was removed from the catalog.`,
      });
      setBookToDelete(null);
    } catch (err) {
      showApiToast({
        variant: 'error',
        title: 'Unable to delete book',
        message: getApiErrorMessage(err, 'Delete request failed'),
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="h-96 bg-surface-2 rounded-2xl animate-pulse" />;
  }

  if (error) {
    return (
      <div className="p-6 bg-danger/10 border border-danger/30 rounded-2xl text-danger text-sm">
        Error: {error}
      </div>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6">
        <h2 className="text-2xl font-semibold">
          All books{' '}
          <span className="text-ink-mute font-normal text-base">
            {filtered.length} of {books.length}
          </span>
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Icon
              name="search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search books..."
              className="h-10 w-64 rounded-lg bg-surface-2 pl-9 pr-4 text-sm text-ink placeholder:text-ink-mute outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <Link href="/admin/books/add">
            <KitButton variant="accent" size="md" className="rounded-md">
              <Icon name="plus" size={14} /> Add book
            </KitButton>
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.14em] text-ink-mute border-t border-line/60">
              <Th>Title</Th>
              <Th>Author</Th>
              <Th>Year</Th>
              <Th>Category</Th>
              <Th>Rating</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr
                key={b._id}
                className="border-t border-line/40 hover:bg-surface-2/40 transition-colors"
              >
                <Td className="font-medium text-ink">{truncate(b.title, 22)}</Td>
                <Td>{b.author}</Td>
                <Td>{b.historicalYear}</Td>
                <Td>
                  <KitBadge variant="category">{b.category}</KitBadge>
                </Td>
                <Td>
                  <Stars value={Math.round(b.rating)} />
                </Td>
                <Td>
                  <KitBadge variant={b.status === 'published' ? 'publish' : 'draft'}>
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </KitBadge>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <Link href={`/admin/books/${b._id}/edit`}>
                      <KitButton variant="primary" size="sm">
                        <Icon name="edit" size={12} /> Edit
                      </KitButton>
                    </Link>
                    <KitButton
                      variant="danger"
                      size="sm"
                      onClick={() => setBookToDelete(b)}
                      disabled={deletingId === b._id}
                    >
                      <Icon name="delete" size={12} /> Delete
                    </KitButton>
                  </div>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-ink-mute text-sm">
                  No books match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal open={!!bookToDelete} onClose={() => setBookToDelete(null)} size="sm">
        <div className="p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 ring-8 ring-danger/5">
            <Icon name="delete" size={28} className="text-danger" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-ink">Delete this book?</h3>
          <p className="mb-8 text-sm text-ink-soft leading-relaxed">
            You're about to permanently remove <span className="font-semibold text-ink">"{bookToDelete?.title}"</span> by <span className="font-medium text-ink">{bookToDelete?.author}</span> from the catalog. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <KitButton variant="outline" className="w-full flex-1" onClick={() => setBookToDelete(null)} disabled={!!deletingId}>
              Cancel
            </KitButton>
            <KitButton variant="danger" className="w-full flex-1" onClick={confirmDelete} disabled={!!deletingId}>
              {deletingId ? 'Deleting...' : (
                <><Icon name="delete" size={16} /> Delete book</>
              )}
            </KitButton>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-semibold px-6 py-4">{children}</th>;
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-5 text-ink-soft ${className}`}>{children}</td>;
}
