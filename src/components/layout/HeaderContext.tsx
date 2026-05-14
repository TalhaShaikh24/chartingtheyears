'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

export interface HeaderAction {
  label: string;
  onClick: () => void;
}

interface HeaderContextType {
  action: HeaderAction | null;
  setAction: (action: HeaderAction | null) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [action, setAction] = useState<HeaderAction | null>(null);

  return (
    <HeaderContext.Provider value={{ action, setAction }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeaderAction() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeaderAction must be used within HeaderProvider');
  }
  return context;
}
