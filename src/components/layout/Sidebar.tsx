'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type Item = { label: string; href: string; icon: string };

const overview: Item[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '/icon-svgs/dashboard.svg' },
];

const content: Item[] = [
  { label: 'Books', href: '/admin/books', icon: '/icon-svgs/books.svg' },
  { label: 'Add Book', href: '/admin/books/add', icon: '/icon-svgs/add-book.svg' },
  { label: 'Import Books', href: '/admin/books/import', icon: '/icon-svgs/import.svg' },
  { label: 'Categories', href: '/admin/categories', icon: '/icon-svgs/categories.svg' },
  { label: 'Tags', href: '/admin/tags', icon: '/icon-svgs/tags.svg' },
];

const settings: Item[] = [
  { label: 'Settings', href: '/admin/settings', icon: '/icon-svgs/settings.svg' },
];

function Section({
  title,
  items,
  current,
  onNavClick,
}: {
  title: string;
  items: Item[];
  current: string;
  onNavClick?: () => void;
}) {
  return (
    <div className="mb-8">
      <p className="px-6 mb-3 text-[11px] font-semibold tracking-[0.18em] text-ink-mute uppercase">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((it) => {
          const active = current === it.href || current.startsWith(it.href + '/');
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                onClick={onNavClick}
                className={cn(
                  'flex items-center gap-3 px-6 py-2.5 text-[15px] transition-colors',
                  active ? 'text-accent font-semibold' : 'text-ink hover:text-ink-soft',
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-9 w-9 items-center justify-center rounded-lg',
                    active ? 'text-accent' : 'text-ink',
                  )}
                >
                  <img
                    src={it.icon}
                    alt=""
                    width="22"
                    height="22"
                    className={active ? '' : 'opacity-80'}
                  />
                </span>
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'w-72 shrink-0 flex-col bg-surface border-r border-line/60 min-h-screen',
          'fixed top-0 left-0 z-50 flex',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:z-auto lg:translate-x-0',
        )}
      >
        <div className="px-6 py-7 border-b border-line/50 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-coffee-2 text-canvas">
              <img src="/icon-svgs/logo-icon.svg" alt="" width="26" height="26" />
            </span>
            <span>
              <span className="block text-lg font-bold leading-tight text-ink">
                Charting the Years
              </span>
              <span className="block text-sm text-accent">Admin panel</span>
            </span>
          </Link>

          {/* Close button — mobile only */}
          <button
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-2 transition-colors text-ink-mute hover:text-ink"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="pt-8 flex-1 overflow-y-auto">
          <Section title="Overview" items={overview} current={pathname} onNavClick={onClose} />
          <Section title="Content" items={content} current={pathname} onNavClick={onClose} />
          <Section title="Settings" items={settings} current={pathname} onNavClick={onClose} />
        </nav>
      </aside>
    </>
  );
}
