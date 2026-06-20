'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { HeaderProvider } from './HeaderContext';

export function PageLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-canvas">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <HeaderProvider>
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8">{children}</main>
        </HeaderProvider>
      </div>
    </div>
  );
}
