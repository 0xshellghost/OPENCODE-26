'use client';

import { Box, Icon, Portal, useColorModeValue } from '@chakra-ui/react';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';

import Footer from 'components/footer/FooterAdmin';
import Navbar from 'components/navbar/NavbarAdmin';
import MobileMenuBar from 'components/sidebar/MobileMenuBar';
import Sidebar from 'components/sidebar/Sidebar';

import { useAuth } from 'contexts/AuthContext';
import { MdBarChart, MdEmojiEvents, MdHome, MdPerson, MdWorkspacePremium } from 'react-icons/md';
import routes from 'routes';
import { IRoute } from 'types/navigation';
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
  const auth = useAuth();
  const [fixed] = useState(false);

  useEffect(() => {
    document.documentElement.dir = 'ltr';
  }, []);

  useEffect(() => {
    auth.check_login();
  }, [auth]);

  const Droutes: IRoute[] = useMemo(() => {
    const baseRoutes: IRoute[] = [
      {
        name: 'Events',
        layout: '/user',
        path: '/home',
        icon: <Icon as={MdHome} w="20px" h="20px" />,
      },
    ];

    baseRoutes.push(
        {
          name: 'Repositories',
          layout: '/user',
          path: '/repos',
          icon: <Icon as={MdHome} w="20px" h="20px" />,
        },
      );

    if (auth.isLoggedIn) {
      baseRoutes.push(
        {
          name: 'Leaderboard',
          layout: '/user',
          path: '/leaderboard',
          icon: <Icon as={MdBarChart} w="20px" h="20px" />,
        },
        {
          name: 'Winners',
          layout: '/user',
          path: '/winners',
          icon: <Icon as={MdWorkspacePremium} w="20px" h="20px" />,
        },
        {
          name: 'Milestones',
          layout: '/user',
          path: '/milestones',
          icon: <Icon as={MdEmojiEvents} w="20px" h="20px" />,
        },
        {
          name: 'Profile',
          layout: '/user',
          path: '/profile',
          icon: <Icon as={MdPerson} w="20px" h="20px" />,
        },
      );
    }
    return baseRoutes;
  }, [auth.isLoggedIn]);

  const bg = useColorModeValue('secondaryGray.300', 'navy.900');

  return (
    <Box minH="100vh" w="100%" bg={bg}>
      <Sidebar routes={Droutes} {...rest} />

      <MobileMenuBar routes={Droutes} />

      <Box
        float="right"
        minHeight="100vh"
        height="100%"
        overflow="auto"
        position="relative"
        maxHeight="100%"
        w={{ base: '100%', xl: 'calc(100% - 300px)' }}
        maxWidth={{ base: '100%', xl: 'calc(100% - 300px)' }}
        transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
        pb={{ base: '80px', xl: '0px' }}
      >
        <Portal>
          <Box>
            <Navbar
              logoText="Geekhaven"
              brandText={getActiveRoute(routes)}
              secondary={getActiveNavbar(routes)}
              message={getActiveNavbarText(routes)}
              fixed={fixed}
              routes={Droutes}
              {...rest}
            />
          </Box>
        </Portal>

        <Box
          mx="auto"
          p={{ base: '16px', md: '30px' }}
          minH="100vh"
          pt={{ base: '60px', md: '60px' }}
        >
          {children}
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}
