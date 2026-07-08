'use client';

import { useState, useRef, useEffect, useCallback, useMemo, useId } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
}

export function SearchableSelect({
  options,
  value = '',
  onChange,
  placeholder = 'Select…',
  className,
  disabled,
  name,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const listRef      = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? '',
    [options, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
  }, [options, query]);

  // Re-centre highlight when filter changes
  useEffect(() => { setActiveIdx(0); }, [query]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[activeIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  // Close on outside interaction
  useEffect(() => {
    const close = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, []);

  const openDropdown = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 10);
  }, [disabled]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const selectOption = useCallback(
    (opt: SearchableSelectOption) => {
      onChange?.(opt.value);
      closeDropdown();
    },
    [onChange, closeDropdown],
  );

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      openDropdown();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Escape':
        closeDropdown();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[activeIdx]) selectOption(filtered[activeIdx]);
        break;
      case 'Tab':
        closeDropdown();
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Hidden native input keeps the value accessible to form libraries */}
      {name && (
        <input type="hidden" name={name} value={value} />
      )}

      {/* Trigger / search input */}
      {open ? (
        <div className="h-11 w-full flex items-center rounded-lg bg-surface-2 px-4 pr-9 ring-2 ring-accent/50 transition">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type to search…"
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded
            role="combobox"
            className="w-full bg-transparent outline-none text-sm text-ink placeholder:text-ink-mute"
          />
        </div>
      ) : (
        <div
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={false}
          aria-controls={listId}
          tabIndex={disabled ? -1 : 0}
          onClick={openDropdown}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            'h-11 w-full flex items-center rounded-lg bg-surface-2 px-4 pr-9 text-sm outline-none',
            'cursor-pointer select-none transition',
            'focus:ring-2 focus:ring-accent/50',
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-3',
          )}
        >
          <span className={selectedLabel ? 'text-ink' : 'text-ink-mute'}>
            {selectedLabel || placeholder}
          </span>
        </div>
      )}

      {/* Chevron — rotates when open */}
      <Icon
        name="chevron-down"
        size={16}
        className={cn(
          'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft transition-transform duration-200',
          open && 'rotate-180',
        )}
      />

      {/* Dropdown list */}
      {open && (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          className={cn(
            'absolute z-50 mt-1 w-full overflow-y-auto',
            'rounded-lg border border-line/60 bg-surface shadow-xl',
            'max-h-60 py-1',
          )}
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-ink-mute">No results</li>
          ) : (
            filtered.map((opt, idx) => (
              <li
                key={opt.value}
                id={`${listId}-opt-${opt.value}`}
                role="option"
                aria-selected={opt.value === value}
                className={cn(
                  'px-4 py-2.5 text-sm cursor-pointer transition-colors',
                  idx === activeIdx
                    ? 'bg-accent/10 text-ink'
                    : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
                  opt.value === value && 'font-semibold',
                )}
                onMouseDown={(e) => { e.preventDefault(); selectOption(opt); }}
                onMouseEnter={() => setActiveIdx(idx)}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
