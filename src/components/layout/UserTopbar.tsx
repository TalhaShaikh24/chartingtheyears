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
  { label: 'Atlas Dashboard', href: '/user' },
  { label: 'Reading list', href: '/user/reading-list' },
  { label: 'About', href: '/user/about' },
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
            <Icon name="logo" size={26} />
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
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
              >
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
