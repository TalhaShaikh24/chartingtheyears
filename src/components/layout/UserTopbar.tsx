'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFilter } from '@/contexts/FilterContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Icon } from '@/components/ui/kit/Icon';
import { AuthDropdown } from './AuthDropdown';
import { LanguageSwitcher } from './LanguageSwitcher';
import './UserTopbar.css';

const navItems = [
  { label: 'Atlas Dashboard', href: '/user', icon: '/icon-svgs/dashboard.svg' },
  { label: 'Reading list', href: '/user/reading-list', icon: '/icon-svgs/books.svg' },
  { label: 'About', href: '/user/about', icon: '' },
];

export function UserTopbar() {
  const pathname = usePathname();
  const { setMobileFiltersOpen } = useFilter();
  const { settings } = useSettings();
  const isAboutPage = pathname === '/user/about';

  return (
    <header className="user-topbar">
      {/* Logo — only on About page, uses siteName from settings */}
      {isAboutPage && (
        <Link href="/user" className="user-topbar-logo-link">
          <span className="user-topbar-logo-icon">
            <img src="/icon-svgs/logo-icon.svg" alt="" width="26" height="26" />
          </span>
          <span className="user-topbar-logo-name">{settings.siteName}</span>
        </Link>
      )}

      {/* Right group: nav links + actions */}
      <div className="user-topbar-right">
        <nav className="user-topbar-nav">
          {!isAboutPage && (
            <button
              className="user-topbar-filters-btn d-lg-none"
              onClick={() => setMobileFiltersOpen(true)}
              aria-label="Open Filters"
            >
              <img src="/icon-svgs/filters-userside.svg" alt="" width="20" height="20" aria-hidden="true" />
              Filters
            </button>
          )}
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`user-topbar-nav-link${active ? ' active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {item.icon && <img src={item.icon} alt="" width="16" height="16" style={{ opacity: active ? 1 : 0.6 }} />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="user-topbar-actions">
          <LanguageSwitcher />
          <AuthDropdown />
        </div>
      </div>
    </header>
  );
}
