'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/kit/Card';
import { KitButton } from '@/components/ui/kit/Button';
import { KitBadge } from '@/components/ui/kit/Badge';
import { Stars } from '@/components/ui/kit/Stars';
import { Icon } from '@/components/ui/kit/Icon';
import apiClient from '@/lib/apiClient';

interface Stats {
  totalBooks: number;
  totalCategories: number;
  totalTags: number;
  averageRating: number;
  activeCountries: number;
}

interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  rating: number;
  status: 'draft' | 'published';
  createdAt?: string;
}

function StatTile({
  icon,
  value,
  label,
  pill,
}: {
  icon: 'grid' | 'books' | 'star';
  value: string;
  label: string;
  pill: string;
}) {
  return (
    <Card className="relative">
      <div className="flex items-start justify-between">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-canvas">
          <Icon name={icon} size={22} />
        </span>
        <span className="rounded-full bg-ink text-canvas text-xs px-3 py-1">{pill}</span>
      </div>
      <div className="mt-6">
        <div className="text-5xl font-semibold text-ink">{value}</div>
        <div className="mt-2 text-[11px] tracking-[0.18em] uppercase text-ink-mute">{label}</div>
      </div>
    </Card>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statsResponse = await apiClient.get<{ data: Stats }>('/api/settings/stats');
        setStats(statsResponse.data.data);

        const booksResponse = await apiClient.get<{ data: Book[] }>('/api/books?limit=5');
        setBooks(booksResponse.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-surface-2 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-surface-2 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-danger/10 border border-danger/30 rounded-2xl text-danger text-sm">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stat tiles */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatTile
          icon="grid"
          value={String(stats?.totalBooks ?? 0)}
          label="Total books"
          pill="+2 this week"
        />
        <StatTile
          icon="books"
          value={String(stats?.activeCountries ?? 0)}
          label="Countries"
          pill="7 active"
        />
        <StatTile
          icon="star"
          value={(stats?.averageRating ?? 0).toFixed(1)}
          label="Avg. Rating"
          pill="out of 5.0"
        />
      </div>

      {/* Recent books table */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <h2 className="text-2xl font-semibold">Recent books</h2>
          <Link href="/admin/books">
            <KitButton variant="accent" size="sm">View all books</KitButton>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.14em] text-ink-mute border-t border-line/60">
                <Th>Title</Th>
                <Th>Author</Th>
                <Th>Category</Th>
                <Th>Rating</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b._id} className="border-t border-line/40 hover:bg-surface-2/40 transition-colors">
                  <Td className="font-medium text-ink">{truncate(b.title, 24)}</Td>
                  <Td>{b.author}</Td>
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
                    </div>
                  </Td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-ink-mute text-sm">
                    No books yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-semibold px-6 py-4">{children}</th>;
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-5 text-ink-soft ${className}`}>{children}</td>;
}
