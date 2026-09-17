'use client';

import { ReactNode, useEffect, useState } from 'react';
import 'styles/App.css';
import 'styles/MiniCalendar.css';

import { ChakraProvider, cookieStorageManager } from '@chakra-ui/react';
import { AuthProvider } from 'contexts/AuthContext';
import { SidebarProvider } from 'contexts/SidebarContext';
import theme from 'theme/theme';

import dynamic from 'next/dynamic';

const InitialLoader = dynamic(() => import('components/common/InitialLoader'), { ssr: false });
const GlobalSakuraBackground = dynamic(() => import('components/common/GlobalSakuraBackground'), { ssr: false });
import PageTransition from 'components/common/PageTransition';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';

export default function AppWrappers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  }));
  
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [minTimeReached, setMinTimeReached] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);

  const pathname = usePathname();
  const initialVariant =
    pathname && pathname.startsWith('/user/leaderboard') ? 'trophy' : 'seo';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const MIN_DURATION_MS = 3000;

    const handleLoad = () => {
      setHasLoaded(true);
      timer = setTimeout(() => setMinTimeReached(true), MIN_DURATION_MS);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('load', handleLoad);
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded || !minTimeReached || !animationDone) return;
    setIsExiting(true);
    const timer = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(timer);
  }, [hasLoaded, minTimeReached, animationDone]);

  if (!mounted) return null;

  return (
    <QueryClientProvider client={queryClient}>
      {pathname === '/' && <GlobalSakuraBackground />}
      <AuthProvider>
        <SidebarProvider>
          <ChakraProvider theme={theme} colorModeManager={cookieStorageManager}>{children}</ChakraProvider>
        </SidebarProvider>
      </AuthProvider>

      {isLoading && pathname === '/' && (
        <InitialLoader
          isExiting={isExiting}
          onComplete={() => setAnimationDone(true)}
          variant={initialVariant}
        />
      )}

      <PageTransition />
    </QueryClientProvider>
  );
}
