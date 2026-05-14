'use client';

import { useEffect, useState } from 'react';
import { BookForm } from '@/components/features/BookForm';
import { Book } from '@/lib/schemas';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';

export default function EditBookPage() {
  const params = useParams();
  const id = params.id as string;
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await apiClient.get<{ data: Book }>(`/api/books/${id}`);
        setBook(response.data.data);
      } catch (err) {
        console.error('[v0] Fetch book error:', err);
        const message =
          typeof err === 'object' &&
          err !== null &&
          'response' in err &&
          typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
            ? (err as { response: { data: { error: string } } }).response.data.error
            : err instanceof Error
              ? err.message
              : 'An error occurred';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

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

  if (!book) {
    return <div className="text-center text-muted-foreground">Book not found</div>;
  }

  return <BookForm initialData={book} />;
}
