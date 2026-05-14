'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDropdown } from './AuthDropdown';
import './UserTopbar.css';

const navItems = [
  { label: 'Atlas Dashboard', href: '/user' },
  { label: 'Reading list', href: '/user/reading-list' },
  { label: 'About', href: '/user/about' },
];

export function UserTopbar() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="user-topbar">
      <nav className="user-topbar-nav">
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
        {/* Render nothing during auth initialization to prevent hydration flicker */}
        {!isLoading && (
          isAuthenticated ? (
            <AuthDropdown />
          ) : (
            <div className="user-topbar-auth-btns">
              <Link href="/auth/signin" className="user-topbar-auth-btn user-topbar-auth-btn--ghost">
                Sign In
              </Link>
              <Link href="/auth/signup" className="user-topbar-auth-btn user-topbar-auth-btn--primary">
                Sign Up
              </Link>
            </div>
          )
        )}
        <button className="user-topbar-lang">EN</button>
      </div>
    </header>
  );
}
