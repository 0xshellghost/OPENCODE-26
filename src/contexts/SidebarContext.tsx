'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

// Define the shape of our context
interface SidebarContextType {
  toggleSidebar: boolean;
  setToggleSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// The Provider component
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [toggleSidebar, setToggleSidebar] = useState(false);

  const value = useMemo(() => ({ toggleSidebar, setToggleSidebar }), [toggleSidebar, setToggleSidebar]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

// The Hook to use the context
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
