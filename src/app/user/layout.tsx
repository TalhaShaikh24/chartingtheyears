'use client';

import { usePathname } from 'next/navigation';
import { UserSidebar } from '@/components/layout/UserSidebar';
import { ReadingListSidebar } from '@/components/layout/ReadingListSidebar';
import { UserTopbar } from '@/components/layout/UserTopbar';
import './user.css';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isReadingList = pathname === '/user/reading-list';

  return (
    <div className="user-layout">
      {isReadingList ? <ReadingListSidebar /> : <UserSidebar />}
      <div className="user-layout-main">
        <UserTopbar />
        <main className="user-layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}
