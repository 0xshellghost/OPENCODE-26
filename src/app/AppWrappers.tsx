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

  // Disable scrolling during initial-loader on '/' before reaching page 1
  useEffect(() => {
    if (isLoading && pathname === '/') {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      let originalScrollRestoration: ScrollRestoration | null = null;

      if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
        originalScrollRestoration = history.scrollRestoration;
        history.scrollRestoration = 'manual';
      }

      document.documentElement.classList.add('oc-initial-loading');
      document.body.classList.add('oc-initial-loading');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      window.scrollTo(0, 0);

      const preventDefault = (e: Event) => {
        e.preventDefault();
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        const scrollKeys = [
          'ArrowUp',
          'ArrowDown',
          'PageUp',
          'PageDown',
          'Home',
          'End',
          ' ',
          'Space',
        ];
        if (scrollKeys.includes(e.key)) {
          const target = e.target as HTMLElement | null;
          if (
            target &&
            (target.tagName === 'INPUT' ||
              target.tagName === 'TEXTAREA' ||
              target.isContentEditable)
          ) {
            return;
          }
          e.preventDefault();
        }
      };

      const handleScroll = () => {
        if (window.scrollY !== 0 || window.scrollX !== 0) {
          window.scrollTo(0, 0);
        }
      };

      window.addEventListener('wheel', preventDefault, { passive: false });
      window.addEventListener('touchmove', preventDefault, { passive: false });
      window.addEventListener('keydown', handleKeyDown, { passive: false });
      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        document.documentElement.classList.remove('oc-initial-loading');
        document.body.classList.remove('oc-initial-loading');
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;

        window.removeEventListener('wheel', preventDefault);
        window.removeEventListener('touchmove', preventDefault);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('scroll', handleScroll);

        if (
          typeof window !== 'undefined' &&
          originalScrollRestoration &&
          'scrollRestoration' in history
        ) {
          history.scrollRestoration = originalScrollRestoration;
        }

        window.scrollTo(0, 0);
        window.dispatchEvent(new Event('resize'));
      };
    } else {
      document.documentElement.classList.remove('oc-initial-loading');
      document.body.classList.remove('oc-initial-loading');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [isLoading, pathname]);

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
