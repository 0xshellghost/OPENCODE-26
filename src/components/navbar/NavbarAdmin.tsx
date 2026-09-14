'use client';
/* eslint-disable */

import {
  Avatar,
  Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';

import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useAuth } from 'contexts/AuthContext';
import { gsap } from 'gsap';
import { useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface AdminNavbarProps {
  brandText: string;
  logoText: string;
  secondary: boolean;
  message: string | boolean;
  fixed: boolean;
  routes: any[];
  [x: string]: any;
}

export default function AdminNavbar(props: AdminNavbarProps) {
  const { colorMode, toggleColorMode } = useColorMode();
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  const navbarBg = useColorModeValue(
    'linear(to-b, #f6f7ff 0%, #edeaff 70%, rgba(237,234,255,0) 100%)',
    'linear(to-b, #211d27 0%, #2d2737 60%, rgba(45,39,55,0) 100%)',
  );

  const auth = useAuth();
  const router = useRouter();

  const navRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState('Guest');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) return;

    try {
      const parsed = JSON.parse(user);
      setName(parsed?.name ?? 'Guest');
      setAvatarUrl(parsed?.avatarUrl);
    } catch {
      setName('Guest');
    }
  }, []);

  const handleLogout = async () => {
    await auth.logout();
    router.push('/auth/sign-in');
  };

  useLayoutEffect(() => {
    if (!navRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        navRef.current,
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
      );
    }, navRef);
    return () => ctx.revert();
  }, []);

  return (
    <Box
      ref={navRef}
      position="fixed"
      top="0"
      left={{ base: '0', xl: '300px' }}
      right="0"
      px={{ base: '16px', md: '40px' }}
      pt={{ base: '14px', md: '22px' }}
      pb={{base:"16px", md:"20px"}}
      zIndex="20"
      bgGradient={navbarBg}
    >
      <Flex justify="space-between" align="center">
        <Text
  fontSize={{ base: '22px', md: '28px' }}
  fontWeight="800"
  lineHeight="1.2"
  pt="16px"
>
  Hi {name},
  <Text
    as="span"
    display={{ base: 'block', md: 'inline' }}
    color="purple.500"
    ml={{ base: 0, md: 1 }}
  >
    Welcome to OPENCODE
  </Text>
</Text>



        <Flex align="center" gap="12px">
          <IconButton
            aria-label="Toggle theme"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            borderRadius="full"
          />

          <Menu>
            <MenuButton>
              <Avatar size="sm" name={name} src={avatarUrl} bg="purple.500" />
            </MenuButton>

            <MenuList>
              <MenuItem onClick={() => router.push('/user/profile')}>
                Profile Settings
              </MenuItem>
              <MenuItem color="red.400" onClick={handleLogout}>
                Log out
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
}
