'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { KitButton } from '@/components/ui/kit/Button';
import { Icon } from '@/components/ui/kit/Icon';
import { useHeaderAction } from './HeaderContext';
import { AuthDropdown } from './AuthDropdown';

export function Topbar() {
  const pathname = usePathname();
  const { action } = useHeaderAction();

  // Derive page name from path: /admin/dashboard → Dashboard
  const parts = pathname.split('/').filter((p) => p && p !== 'admin');
  const raw = parts[parts.length - 1] ?? 'dashboard';
  const page = raw
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <header className="flex items-center justify-between px-6 lg:px-10 py-6 border-b border-line/60">
      <div className="flex items-center gap-2 text-lg">
        <Link href="/admin/dashboard" className="text-accent font-medium">
          Admin
        </Link>
        <span className="text-ink-mute">/</span>
        <span className="font-semibold text-ink">{page}</span>
      </div>
      <div className="flex items-center gap-4">
        {action ? (
          <KitButton
            variant="primary"
            size="md"
            onClick={action.onClick}
            className="rounded-md"
          >
            <Icon name="plus" size={14} /> {action.label}
          </KitButton>
        ) : (
          <Link href="/admin/books/add">
            <KitButton variant="primary" size="md" className="rounded-md">
              <Icon name="plus" size={14} /> Add book
            </KitButton>
          </Link>
        )}
        <KitButton variant="muted" size="md" className="rounded-md hidden sm:inline-flex">
          Save changes
        </KitButton>
        
        <div className="w-px h-6 bg-line/60 mx-1 hidden sm:block"></div>
        <AuthDropdown />
      </div>
    </header>
  );
}
