'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from '@/components/ui/kit/Icon';
import './AuthDropdown.css';

export function AuthDropdown() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) return null;

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="auth-dropdown-wrap" ref={dropdownRef}>
      <button 
        className="auth-dropdown-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <div className="auth-avatar">{initials}</div>
        <span className="auth-user-name">{user.name}</span>
        <Icon name="chevron-down" size={14} className={`auth-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="auth-dropdown-menu">
          <div className="auth-dropdown-header">
            <span className="auth-dropdown-name">{user.name}</span>
            <span className="auth-dropdown-email">{user.email}</span>
            <span className="auth-dropdown-role">{user.role}</span>
          </div>
          <div className="auth-dropdown-divider" />
          <button className="auth-dropdown-item auth-logout-btn" onClick={logout}>
            <Icon name="log-out" size={14} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
