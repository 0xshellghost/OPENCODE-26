'use client';
/* eslint-disable */

import {
  Box,
  Button,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAuth } from 'contexts/AuthContext';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function HeaderLinks(props: { secondary: boolean }) {
  const { secondary } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  const [profileInitials, setProfileInitials] = useState('');
  const auth = useAuth();
  const router = useRouter();

  const iconColor = 'var(--fg-muted)';
  const menuBg = 'var(--surface-2)';
  const menuHover = 'var(--surface)';

  const handleLogout = async () => {
    await auth.logout();
    router.push('/auth/sign-in');
  };

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const name: string = JSON.parse(userStr)?.name ?? '';
        setProfileInitials(
          name
            .split(' ')
            .map((n) => n?.[0])
            .slice(0, 2)
            .join(''),
        );
      }
    } catch (e) {
      setProfileInitials('?');
    }
  }, []);

  return (
    <Flex align="center" gap="12px">
      {/* Theme toggle */}
      <Button
        aria-label="Toggle theme"
        variant="ghost"
        p="0"
        minW="unset"
        onClick={toggleColorMode}
      >
        <Icon
          h="18px"
          w="18px"
          color={iconColor}
          as={colorMode === 'light' ? Moon : Sun}
        />
      </Button>

      {!auth.isLoggedIn ? (
        <Button
          as={NextLink}
          href="/auth/sign-in"
          size="sm"
          variant="brand"
        >
          Sign in
        </Button>
      ) : (
        <Menu>
          <MenuButton aria-label="User profile menu">
            <Box
              w="36px"
              h="36px"
              borderRadius="full"
              bg="var(--accent)"
              color="var(--accent-ink)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="sm"
              fontWeight="700"
            >
              {profileInitials}
            </Box>
          </MenuButton>

          <MenuList
            bg={menuBg}
            border="1px solid var(--border)"
            borderRadius="14px"
            p="6px"
            minW="180px"
            boxShadow="0 10px 30px rgba(0,0,0,0.3)"
          >
            <MenuItem
              as={NextLink}
              href="/user/profile"
              bg="transparent"
              _hover={{ bg: menuHover }}
              borderRadius="8px"
            >
              <Text fontSize="sm" color="var(--fg)">Profile Settings</Text>
            </MenuItem>

            <MenuItem
              bg="transparent"
              _hover={{ bg: menuHover }}
              borderRadius="8px"
              color="red.400"
              onClick={handleLogout}
            >
              <Text fontSize="sm">Log out</Text>
            </MenuItem>
          </MenuList>
        </Menu>
      )}
    </Flex>
  );
}
