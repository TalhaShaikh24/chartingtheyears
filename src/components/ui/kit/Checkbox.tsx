'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface KitCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const KitCheckbox = forwardRef<HTMLInputElement, KitCheckboxProps>(
  function KitCheckbox({ className, label, ...rest }, ref) {
    return (
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            ref={ref}
            className={cn(
              'peer appearance-none h-5 w-5 rounded border-2 border-line bg-surface-2 checked:bg-accent checked:border-accent focus:ring-2 focus:ring-accent/40 transition-all outline-none',
              className,
            )}
            {...rest}
          />
          <svg
            className="absolute w-3.5 h-3.5 text-canvas pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        {label && <span className="text-sm text-ink-soft group-hover:text-ink transition-colors">{label}</span>}
      </label>
    );
  },
);
