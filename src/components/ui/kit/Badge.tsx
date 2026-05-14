import { cn } from '@/lib/utils';

type BadgeVariant = 'category' | 'publish' | 'draft' | 'tag';

const variants: Record<BadgeVariant, string> = {
  category: 'bg-coffee/30 text-ink-soft',
  publish: 'bg-publish text-publish-fg',
  draft: 'bg-draft text-draft-fg',
  tag: 'bg-coffee text-canvas',
};

export function KitBadge({
  variant = 'category',
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
