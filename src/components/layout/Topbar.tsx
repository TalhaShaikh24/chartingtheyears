'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { KitButton } from '@/components/ui/kit/Button';
import { Icon } from '@/components/ui/kit/Icon';
import { useHeaderAction } from './HeaderContext';
import { AuthDropdown } from './AuthDropdown';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { action } = useHeaderAction();

  const parts = pathname.split('/').filter((p) => p && p !== 'admin');
  const raw = parts[parts.length - 1] ?? 'dashboard';
  const page = raw
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4 lg:py-6 border-b border-line/60">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hamburger — mobile only */}
        <button
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-2 transition-colors text-ink-mute hover:text-ink"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="flex items-center gap-2 text-lg">
          <Link href="/admin/dashboard" className="text-accent font-medium hidden sm:block">
            Admin
          </Link>
          <span className="text-ink-mute hidden sm:block">/</span>
          <span className="font-semibold text-ink">{page}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {action ? (
          <KitButton
            variant="primary"
            size="md"
            onClick={action.onClick}
            className="rounded-md"
          >
            <Icon name="plus" size={14} />
            <span className="hidden sm:inline">{action.label}</span>
          </KitButton>
        ) : (
          <Link href="/admin/books/add">
            <KitButton variant="primary" size="md" className="rounded-md">
              <Icon name="plus" size={14} />
              <span className="hidden sm:inline">Add book</span>
            </KitButton>
          </Link>
        )}
        <KitButton variant="muted" size="md" className="rounded-md hidden sm:inline-flex">
          Save changes
        </KitButton>

        <div className="w-px h-6 bg-line/60 mx-1 hidden sm:block" />
        <AuthDropdown />
      </div>
    </header>
  );
}
