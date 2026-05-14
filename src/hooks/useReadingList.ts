'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';

const LS_KEY = 'reading_list_ids';
const RL_EVENT = 'readingListUpdated';

// ─── localStorage helpers (guest only) ───────────────────────────────────────

function lsGet(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

function lsSet(ids: string[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(RL_EVENT));
}

function lsClear() {
  localStorage.removeItem(LS_KEY);
  window.dispatchEvent(new Event(RL_EVENT));
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useReadingList() {
  const { isAuthenticated, isLoading } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const mergedRef = useRef(false); // ensure merge runs only once per session

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return; // wait for auth to settle

    if (isAuthenticated) {
      // Fetch from DB
      apiClient
        .get<{ success: boolean; data: { bookIds: string[] } }>('/api/reading-list')
        .then((res) => {
          if (res.data.success) setIds(res.data.data.bookIds);
        })
        .catch(() => {})
        .finally(() => setIsReady(true));
    } else {
      // Guest — read from localStorage
      setIds(lsGet());
      setIsReady(true);
    }
  }, [isAuthenticated, isLoading]);

  // ── Merge localStorage → DB on login (once) ───────────────────────────────
  useEffect(() => {
    if (isLoading || !isAuthenticated || mergedRef.current) return;
    mergedRef.current = true;

    const guestIds = lsGet();
    if (guestIds.length === 0) return;

    apiClient
      .put<{ success: boolean; data: { bookIds: string[] } }>('/api/reading-list/merge', {
        bookIds: guestIds,
      })
      .then((res) => {
        if (res.data.success) {
          setIds(res.data.data.bookIds);
          lsClear(); // clear guest list after successful merge
        }
      })
      .catch(() => {});
  }, [isAuthenticated, isLoading]);

  // ── Listen for cross-component localStorage changes (guest mode) ───────────
  useEffect(() => {
    if (isAuthenticated) return;
    const handleUpdate = () => setIds(lsGet());
    window.addEventListener(RL_EVENT, handleUpdate);
    return () => window.removeEventListener(RL_EVENT, handleUpdate);
  }, [isAuthenticated]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const addBook = useCallback(
    async (bookId: string) => {
      if (isAuthenticated) {
        try {
          const res = await apiClient.post<{ success: boolean; data: { bookIds: string[] } }>(
            '/api/reading-list',
            { bookId }
          );
          if (res.data.success) setIds(res.data.data.bookIds);
        } catch {}
      } else {
        const next = Array.from(new Set([...lsGet(), bookId]));
        lsSet(next);
        setIds(next);
      }
    },
    [isAuthenticated]
  );

  const removeBook = useCallback(
    async (bookId: string) => {
      if (isAuthenticated) {
        try {
          const res = await apiClient.delete<{ success: boolean; data: { bookIds: string[] } }>(
            '/api/reading-list',
            { data: { bookId } }
          );
          if (res.data.success) setIds(res.data.data.bookIds);
        } catch {}
      } else {
        const next = lsGet().filter((id) => id !== bookId);
        lsSet(next);
        setIds(next);
      }
    },
    [isAuthenticated]
  );

  const toggleBook = useCallback(
    (bookId: string) => {
      if (ids.includes(bookId)) {
        return removeBook(bookId);
      } else {
        return addBook(bookId);
      }
    },
    [ids, addBook, removeBook]
  );

  const isInList = useCallback((bookId: string) => ids.includes(bookId), [ids]);

  return { ids, isInList, toggleBook, addBook, removeBook, isReady };
}
