import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const KitInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function KitInput({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-11 w-full rounded-lg bg-surface-2 px-4 text-sm text-ink placeholder:text-ink-mute outline-none focus:ring-2 focus:ring-accent/50 transition',
          className,
        )}
        {...rest}
      />
    );
  },
);

export const KitTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function KitTextarea({ className, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'min-h-32 w-full rounded-lg bg-surface-2 px-4 py-3 text-sm text-ink placeholder:text-accent/80 outline-none focus:ring-2 focus:ring-accent/50 transition resize-y',
          className,
        )}
        {...rest}
      />
    );
  },
);

export function KitLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft mb-2"
    >
      {children}
    </label>
  );
}
