'use client';

import { Box, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cloneElement, isValidElement, ReactElement } from 'react';
import {
  MdAnalytics,
  MdCalendarToday,
  MdDashboard,
  MdHome,
  MdLeaderboard,
  MdPerson,
  MdSettings,
} from 'react-icons/md';
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
    return MdHome;
  if (name.includes('event') || path.includes('event')) return MdCalendarToday;
  if (name.includes('leader') || path.includes('leader')) return MdLeaderboard;
  if (name.includes('profile') || path.includes('profile')) return MdPerson;
  if (name.includes('analytic') || path.includes('analytic'))
    return MdAnalytics;
  if (name.includes('setting') || path.includes('setting')) return MdSettings;

  return MdDashboard;
};

export default function MobileMenuBar(props: MobileMenuBarProps) {
  const { routes } = props;
  const pathname = usePathname();

  const bgColor = useColorModeValue(
    'rgba(255, 255, 255, 0.85)',
    'rgba(15, 23, 42, 0.85)',
  );
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const activeColor = 'purple.500';
  const inactiveColor = useColorModeValue('gray.500', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const activeBg = useColorModeValue('purple.50', 'rgba(157, 118, 126, 0.1)');
  const shadow = useColorModeValue(
    '0px -4px 20px rgba(0, 0, 0, 0.08)',
    '0px -4px 20px rgba(0, 0, 0, 0.3)',
  );

  const isActive = (routePath: string) => {
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
                    boxShadow="0 0 8px rgba(159, 122, 234, 0.6)"
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
