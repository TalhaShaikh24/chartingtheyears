'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/kit/Card';
import { TagFormModal } from '@/components/features/TagFormModal';
import { useHeaderAction } from '@/components/layout/HeaderContext';
import apiClient from '@/lib/apiClient';

interface Tag {
  _id: string;
  name: string;
  bookCount: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setAction } = useHeaderAction();

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ data: Tag[] }>('/api/tags');
      setTags(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set header action for this page
    setAction({
      label: 'Add Tag',
      onClick: () => setIsModalOpen(true),
    });

    // Cleanup on unmount
    return () => setAction(null);
  }, [setAction]);

  useEffect(() => {
    fetchTags();
  }, []);

  const handleTagAdded = () => {
    // Refresh tags data
    fetchTags();
  };

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 bg-surface-2 rounded-2xl animate-pulse" />
        ))}
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
    <>
      <TagFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleTagAdded}
      />
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {tags.map((t) => (
          <Card key={t._id} className="bg-surface-2/70 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-ink">{t.name}</div>
                <div className="text-xs text-ink-mute mt-1">{t.bookCount} books</div>
              </div>
              <div className="text-3xl font-semibold text-ink-soft tabular-nums">{t.bookCount}</div>
            </div>
          </Card>
        ))}
        {tags.length === 0 && (
          <p className="col-span-full text-center text-ink-mute py-16 text-sm">No tags found.</p>
        )}
      </div>
    </>
  );
}
