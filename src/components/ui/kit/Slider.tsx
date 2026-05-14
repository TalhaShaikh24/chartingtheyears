'use client';

import { type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface KitSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  valueDisplay?: string;
}

export function KitSlider({ className, label, valueDisplay, ...rest }: KitSliderProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex justify-between items-center">
        {label && <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">{label}</span>}
        {valueDisplay && <span className="text-sm font-medium text-accent">{valueDisplay}</span>}
      </div>
      <input
        type="range"
        className={cn(
          'w-full h-1.5 bg-line rounded-lg appearance-none cursor-pointer accent-accent',
          className,
        )}
        {...rest}
      />
    </div>
  );
}
