'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterState {
  lang: string[];
  type: string[];
  yearRange: [number, number];
  rating: number;
  tags: string;
  mobileFiltersOpen: boolean;
}

interface FilterContextType {
  filters: FilterState;
  setLang: (lang: string[]) => void;
  setType: (type: string[]) => void;
  setYearRange: (range: [number, number]) => void;
  setRating: (rating: number) => void;
  setTags: (tags: string) => void;
  setMobileFiltersOpen: (isOpen: boolean) => void;
  resetFilters: () => void;
}

const defaultState: FilterState = {
  lang: [],
  type: [],
  yearRange: [1900, 2026],
  rating: 0,
  tags: '',
  mobileFiltersOpen: false,
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultState);

  const setLang = (lang: string[]) => setFilters((prev) => ({ ...prev, lang }));
  const setType = (type: string[]) => setFilters((prev) => ({ ...prev, type }));
  const setYearRange = (yearRange: [number, number]) => setFilters((prev) => ({ ...prev, yearRange }));
  const setRating = (rating: number) => setFilters((prev) => ({ ...prev, rating }));
  const setTags = (tags: string) => setFilters((prev) => ({ ...prev, tags }));
  const setMobileFiltersOpen = (mobileFiltersOpen: boolean) => setFilters((prev) => ({ ...prev, mobileFiltersOpen }));

  const resetFilters = () => setFilters(defaultState);

  return (
    <FilterContext.Provider
      value={{
        filters,
        setLang,
        setType,
        setYearRange,
        setRating,
        setTags,
        setMobileFiltersOpen,
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
