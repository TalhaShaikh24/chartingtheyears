'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/kit/Card';
import { KitBadge } from '@/components/ui/kit/Badge';
import { Stars } from '@/components/ui/kit/Stars';
import { CategoryFormModal } from '@/components/features/CategoryFormModal';
import { useHeaderAction } from '@/components/layout/HeaderContext';
import apiClient from '@/lib/apiClient';

interface Category {
  _id: string;
  name: string;
  bookCount: number;
}

interface Book {
  _id: string;
  category: string;
  rating: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setAction } = useHeaderAction();

  const fetchData = async () => {
    try {
      setLoading(true);
      const categoriesResponse = await apiClient.get<{ data: Category[] }>('/api/categories');
      setCategories(categoriesResponse.data.data);

      const booksResponse = await apiClient.get<{ data: Book[] }>('/api/books?limit=1000');
      setBooks(booksResponse.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set header action for this page
    setAction({
      label: 'Add Category',
      onClick: () => setIsModalOpen(true),
    });

    // Cleanup on unmount
    return () => setAction(null);
  }, [setAction]);

  useEffect(() => {
    fetchData();
  }, []);

  const getBreakdown = () => {
    const total = books.length;
    return categories.map((cat) => {
      const catBooks = books.filter((b) => b.category === cat.name);
      const avgRating =
        catBooks.length > 0
          ? catBooks.reduce((sum, b) => sum + b.rating, 0) / catBooks.length
          : 0;
      const pct = total > 0 ? Math.round((catBooks.length / total) * 100) : 0;
      return { name: cat.name, count: catBooks.length, pct, avgRating };
    });
  };

  if (loading) return <div className="h-96 bg-surface-2 rounded-2xl animate-pulse" />;

  if (error) {
    return (
      <div className="p-6 bg-danger/10 border border-danger/30 rounded-2xl text-danger text-sm">
        Error: {error}
      </div>
    );
  }

  const breakdown = getBreakdown();

  const handleCategoryAdded = () => {
    // Refresh categories and books data
    fetchData();
  };

  return (
    <>
      <CategoryFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleCategoryAdded}
      />
      <div className="space-y-8">
        {/* Category tiles */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Card key={c._id} className="bg-surface-2/70">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-ink" />
                <h3 className="font-semibold text-ink">{c.name}</h3>
              </div>
              <div className="mt-6 text-5xl font-semibold text-ink">{c.bookCount}</div>
              <div className="mt-2 text-[11px] tracking-[0.18em] uppercase text-accent">Books</div>
            </Card>
          ))}
        </div>

        {/* Breakdown table */}
        <Card className="p-0 overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold">Category breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.14em] text-ink-mute border-t border-line/60">
                  <th className="text-left font-semibold px-6 py-4">Title</th>
                  <th className="text-left font-semibold px-6 py-4">Books</th>
                  <th className="text-left font-semibold px-6 py-4">% of total</th>
                  <th className="text-left font-semibold px-6 py-4">Avg. Rating</th>
                  <th className="text-left font-semibold px-6 py-4 w-1/3">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((item) => (
                  <tr key={item.name} className="border-t border-line/40 hover:bg-surface-2/40 transition-colors">
                    <td className="px-6 py-5">
                      <KitBadge variant="category">{item.name}</KitBadge>
                    </td>
                    <td className="px-6 py-5 text-accent font-medium">{item.count}</td>
                    <td className="px-6 py-5 text-ink-soft">{item.pct}%</td>
                    <td className="px-6 py-5">
                      <Stars value={Math.round(item.avgRating)} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-1.5 w-full rounded-full bg-accent/40 overflow-hidden">
                        <div className="h-full bg-ink" style={{ width: `${item.pct}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
