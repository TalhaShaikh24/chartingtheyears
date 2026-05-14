'use client';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { HeaderProvider } from './HeaderContext';

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-canvas">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <HeaderProvider>
          <Topbar />
          <main className="flex-1 px-6 lg:px-10 py-8">{children}</main>
        </HeaderProvider>
      </div>
    </div>
  );
}
