'use client';

import { ReactNode, useEffect, useState } from 'react';
import 'styles/App.css';
import 'styles/MiniCalendar.css';

import { ChakraProvider, cookieStorageManager } from '@chakra-ui/react';
import { AuthProvider } from 'contexts/AuthContext';
import { SidebarProvider } from 'contexts/SidebarContext';
import { SakuraProvider } from 'contexts/SakuraContext';
import theme from 'theme/theme';

import dynamic from 'next/dynamic';

import InitialLoader from 'components/common/InitialLoader';
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
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, [hasLoaded, minTimeReached, animationDone]);

  if (!mounted) {
    if (pathname === '/') {
      return (
        <ChakraProvider theme={theme} colorModeManager={cookieStorageManager}>
          <InitialLoader isExiting={false} variant={initialVariant} />
        </ChakraProvider>
      );
    }
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SakuraProvider>
        {/* Global sakura petals on every page */}
        <GlobalSakuraBackground />

        <AuthProvider>
          <SidebarProvider>
            <ChakraProvider theme={theme} colorModeManager={cookieStorageManager}>
              <div
                style={{
                  opacity: isLoading && pathname === '/' && !isExiting ? 0 : 1,
                  visibility: isLoading && pathname === '/' && !isExiting ? 'hidden' : 'visible',
                  transition: 'opacity 0.7s ease-out',
                }}
              >
                {children}
              </div>
            </ChakraProvider>
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
      </SakuraProvider>
    </QueryClientProvider>
  );
}
