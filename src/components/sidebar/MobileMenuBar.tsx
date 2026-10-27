'use client';

import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cloneElement, isValidElement, ReactElement } from 'react';
import {
  BarChart2,
  Calendar,
  Home,
  LayoutDashboard,
  Settings,
  Trophy,
  User,
} from 'lucide-react';
import { IRoute } from 'types/navigation';

interface MobileMenuBarProps {
  routes: IRoute[];
}

const getFallbackIcon = (routeName: string, routePath: string) => {
  const name = routeName.toLowerCase();
  const path = routePath.toLowerCase();

  if (
    name.includes('home') ||
    name.includes('dashboard') ||
    path.includes('default')
  )
    return Home;
  if (name.includes('event') || path.includes('event')) return Calendar;
  if (name.includes('leader') || path.includes('leader')) return Trophy;
  if (name.includes('profile') || path.includes('profile')) return User;
  if (name.includes('analytic') || path.includes('analytic'))
    return BarChart2;
  if (name.includes('setting') || path.includes('setting')) return Settings;

  return LayoutDashboard;
};

export default function MobileMenuBar(props: MobileMenuBarProps) {
  const { routes } = props;
  const pathname = usePathname();

  const bgColor = 'var(--nav-bg)';
  const borderColor = 'var(--border)';
  const activeColor = 'var(--accent)';
  const inactiveColor = 'var(--fg-muted)';
  const hoverBg = 'var(--surface-2)';
  const activeBg = 'var(--accent-soft)';
  const shadow = 'var(--shadow)';

  const isActive = (routePath: string) => {
    if (routePath.includes('leaderboard')) {
      return pathname?.includes('/leaderboard');
    }
    return pathname?.includes(routePath);
  };

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      bg={bgColor}
      backdropFilter="blur(20px)"
      boxShadow={shadow}
      borderTop="1px solid"
      borderColor={borderColor}
      zIndex="1000"
      display={{ base: 'block', xl: 'none' }}
      pb="env(safe-area-inset-bottom, 10px)"
    >
      <Flex justify="space-around" align="center" h="70px" px="8px" py="8px">
        {routes.map((route, index) => {
          if (route.layout === '/auth') return null;

          const active = isActive(route.path);
          const iconSize = active ? '26px' : '24px';
          const iconColor = active ? activeColor : inactiveColor;

          return (
            <Link
              key={index}
              href={route.layout + route.path}
              style={{ flex: '1', maxWidth: '80px' }}
            >
              <Flex
                direction="column"
                align="center"
                justify="center"
                cursor="pointer"
                h="54px"
                w="100%"
                position="relative"
                bg={active ? activeBg : 'transparent'}
                _hover={{ bg: hoverBg }}
                borderRadius="12px"
                transition="all 0.2s ease"
                _active={{ transform: 'scale(0.95)' }}
              >
                {active && (
                  <Box
                    position="absolute"
                    top="-6px"
                    w="4px"
                    h="4px"
                    bg={activeColor}
                    borderRadius="full"
                    boxShadow="0 0 8px var(--accent-glow)"
                  />
                )}

                <Box
                  transform={active ? 'scale(1.1)' : 'scale(1)'}
                  transition="transform 0.2s ease"
                  mb="4px"
                >
                  {isValidElement(route.icon) ? (
                    cloneElement(
                      route.icon as ReactElement,
                      {
                        w: iconSize,
                        h: iconSize,
                        color: iconColor,
                      } as any,
                    )
                  ) : (
                    /* Fallback if no icon is defined */
                    <Icon
                      as={getFallbackIcon(route.name, route.path)}
                      w={iconSize}
                      h={iconSize}
                      color={iconColor}
                    />
                  )}
                </Box>

                <Text
                  fontSize="10px"
                  fontWeight={active ? '700' : '500'}
                  color={active ? activeColor : inactiveColor}
                  transition="all 0.2s ease"
                  letterSpacing="0.3px"
                >
                  {route.name}
                </Text>
              </Flex>
            </Link>
          );
        })}
      </Flex>
    </Box>
  );
}
