'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface FilterState {
  lang: string[];
  type: string[];
  yearRange: [number, number];
  rating: number;
  tags: string;
  mobileFiltersOpen: boolean;
  mobileRLOpen: boolean;
}

interface FilterContextType {
  filters: FilterState;
  filtersLoading: boolean;
  setLang: (lang: string[]) => void;
  setType: (type: string[]) => void;
  setYearRange: (range: [number, number]) => void;
  setRating: (rating: number) => void;
  setTags: (tags: string) => void;
  setMobileFiltersOpen: (isOpen: boolean) => void;
  setMobileRLOpen: (isOpen: boolean) => void;
  setFiltersLoading: (loading: boolean) => void;
  resetFilters: () => void;
}

const defaultState: FilterState = {
  lang: [],
  type: [],
  yearRange: [-1250, 2026],
  rating: 0,
  tags: '',
  mobileFiltersOpen: false,
  mobileRLOpen: false,
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultState);
  // Separate from filters so updates here never retrigger effects that depend
  // on the filters object (avoids infinite fetch loops).
  const [filtersLoading, setFiltersLoading] = useState(false);

  const setLang = useCallback(
    (lang: string[]) => setFilters((prev) => ({ ...prev, lang })),
    [],
  );

  const setType = useCallback(
    (type: string[]) => setFilters((prev) => ({ ...prev, type })),
    [],
  );

  // Equality guard: if the range values haven't changed, return the same prev
  // object so referential equality is preserved and dependent effects don't
  // fire unnecessarily (prevents spurious fetch cancellations on mount).
  const setYearRange = useCallback(
    (yearRange: [number, number]) =>
      setFilters((prev) => {
        if (prev.yearRange[0] === yearRange[0] && prev.yearRange[1] === yearRange[1]) return prev;
        return { ...prev, yearRange };
      }),
    [],
  );

  const setRating = useCallback(
    (rating: number) => setFilters((prev) => ({ ...prev, rating })),
    [],
  );

  const setTags = useCallback(
    (tags: string) => setFilters((prev) => ({ ...prev, tags })),
    [],
  );

  const setMobileFiltersOpen = useCallback(
    (mobileFiltersOpen: boolean) => setFilters((prev) => ({ ...prev, mobileFiltersOpen })),
    [],
  );

  const setMobileRLOpen = useCallback(
    (mobileRLOpen: boolean) => setFilters((prev) => ({ ...prev, mobileRLOpen })),
    [],
  );

  const resetFilters = useCallback(() => setFilters(defaultState), []);

  return (
    <FilterContext.Provider
      value={{
        filters,
        filtersLoading,
        setLang,
        setType,
        setYearRange,
        setRating,
        setTags,
        setMobileFiltersOpen,
        setMobileRLOpen,
        setFiltersLoading,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
