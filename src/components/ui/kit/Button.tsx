import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'ghost' | 'outline' | 'accent' | 'danger' | 'muted';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-canvas hover:bg-ink-soft',
  muted: 'bg-coffee-2/90 text-canvas hover:bg-coffee-2',
  ghost: 'bg-transparent text-ink hover:bg-surface-2',
  outline: 'border border-line bg-transparent text-ink hover:bg-surface-2',
  accent: 'bg-accent text-ink hover:brightness-95',
  danger: 'bg-danger text-danger-fg hover:brightness-110',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-12 px-5 text-base rounded-lg',
};

export const KitButton = forwardRef<HTMLButtonElement, Props>(function KitButton(
  { variant = 'primary', size = 'md', className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  );
});
