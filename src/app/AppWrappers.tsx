'use client';

import { ReactNode, useEffect, useState } from 'react';
import 'styles/App.css';
import 'styles/Contact.css';
import 'styles/MiniCalendar.css';

import { ChakraProvider, cookieStorageManager } from '@chakra-ui/react';
import { AuthProvider } from 'contexts/AuthContext';
import { SidebarProvider } from 'contexts/SidebarContext';
import theme from 'theme/theme';

import InitialLoader from 'components/common/InitialLoader';
import PageTransition from 'components/common/PageTransition';
import GlobalSakuraBackground from 'components/common/GlobalSakuraBackground';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export default function AppWrappers({ children }: { children: ReactNode }) {
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

    if (document.readyState === 'complete') {
      setHasLoaded(true);
      timer = setTimeout(() => setMinTimeReached(true), MIN_DURATION_MS);
      return () => timer && clearTimeout(timer);
    }

    const handleLoad = () => {
      setHasLoaded(true);
      timer = setTimeout(() => setMinTimeReached(true), MIN_DURATION_MS);
    };

    window.addEventListener('load', handleLoad);
    return () => {
      window.removeEventListener('load', handleLoad);
      timer && clearTimeout(timer);
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
