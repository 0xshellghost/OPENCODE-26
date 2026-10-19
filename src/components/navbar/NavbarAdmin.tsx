'use client';

import {
  Avatar,
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';

import { useAuth } from 'contexts/AuthContext';
import { gsap } from 'gsap';
import { useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { opencodeTokens } from '../../theme/opencode-tokens';
import SakuraToggle from 'components/common/SakuraToggle';

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
      bg="var(--nav-bg)"
      backdropFilter="blur(16px)"
      borderBottom="1px solid var(--border)"
    >
      <Flex justify="space-between" align="center">
        <Text
          fontSize={{ base: '20px', md: '24px' }}
          fontWeight="400"
          lineHeight="1.2"
          pt="16px"
          color={opencodeTokens.colors.text.primary}
        >
          Welcome back,{' '}
          <Text
            as="span"
            display={{ base: 'inline-block', md: 'inline' }}
            fontWeight="600"
            className="text-sakura-gradient"
          >
            {name}
          </Text>
        </Text>

        <Flex align="center" gap="16px" pt="16px">
          <SakuraToggle />
          <Menu>
            <MenuButton
              transition="all 0.3s"
              _focus={{ boxShadow: 'none' }}
              _hover={{ transform: 'scale(1.05)' }}
            >
              <Avatar 
                size="sm" 
                name={name} 
                src={avatarUrl} 
                bg={opencodeTokens.colors.background.glassDark}
                border={`2px solid ${opencodeTokens.colors.accent.sakura}`}
              />
            </MenuButton>

            <MenuList 
              bg={opencodeTokens.colors.background.glassDark}
              backdropFilter="blur(20px)"
              border={`1px solid ${opencodeTokens.colors.border.light}`}
              boxShadow={opencodeTokens.shadows.glass}
              borderRadius={opencodeTokens.borders.radius.lg}
            >
              <MenuItem 
                onClick={() => router.push('/user/profile')}
                bg="transparent"
                _hover={{ bg: opencodeTokens.colors.background.glassLight }}
                color={opencodeTokens.colors.text.primary}
              >
                Profile Settings
              </MenuItem>
              <MenuItem 
                color={opencodeTokens.colors.accent.sakura} 
                onClick={handleLogout}
                bg="transparent"
                _hover={{ bg: opencodeTokens.colors.background.glassLight }}
              >
                Log out
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
}
