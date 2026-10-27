'use client';

import { Box, Portal } from '@chakra-ui/react';
import Footer from 'components/footer/FooterAdmin';
import Navbar from 'components/navbar/NavbarAdmin';
import MobileMenuBar from 'components/sidebar/MobileMenuBar';
import Sidebar from 'components/sidebar/Sidebar';

import { PropsWithChildren, useState } from 'react';
import routes from 'routes';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  getActiveNavbar,
  getActiveNavbarText,
  getActiveRoute,
} from 'utils/navigation';

interface DashboardLayoutProps extends PropsWithChildren {
  [x: string]: any;
}

export default function AdminLayout(props: DashboardLayoutProps) {
  const { children, ...rest } = props;
  const [fixed] = useState(false);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  interface JWTPayload {
    roles?: {
      isAdmin: boolean;
    };
    [key: string]: any;
  }

  function parseJwt(token: string | null): JWTPayload | null {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const token = localStorage.getItem('token');
    const payload = parseJwt(token);
    if (!payload?.roles?.isAdmin) {
      console.error('Only admin can access admin pages');
      router.push('/user/events');
    }
  }, [isMounted, router]);

  return (
    <Box minH="100vh" w="100%" bg="var(--bg)" color="var(--fg)">
      <Sidebar routes={routes} {...rest} />

      <MobileMenuBar routes={routes} />

      <Box
        float="right"
        minHeight="100vh"
        height="100%"
        overflow="auto"
        position="relative"
        w={{ base: '100%', xl: 'calc(100% - 300px)' }}
        maxWidth={{ base: '100%', xl: 'calc(100% - 300px)' }}
        transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
        pb={{ base: '80px', xl: '0px' }}
      >
        <Portal>
          <Box>
            <Navbar
              {...({
                logoText: 'Geekhaven',
                brandText: getActiveRoute(routes),
                secondary: getActiveNavbar(routes),
                message: getActiveNavbarText(routes),
                fixed,
                routes,
                ...rest,
              } as any)}
            />
          </Box>
        </Portal>

        <Box
          mx="auto"
          p={{ base: '16px', md: '30px' }}
          pe={{ base: '16px', md: '30px' }}
          minH="100vh"
          pt={{ base: '120px', md: '110px' }}
        >
          {children}
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
