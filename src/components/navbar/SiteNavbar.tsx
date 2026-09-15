'use client';

import { Flex, Text, useColorModeValue } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flower2 } from 'lucide-react';
import { opencodeTokens } from '../../theme/opencode-tokens';

const NAV_ITEMS = [
  { label: 'Events', href: '/user/leaderboard' },
  { label: 'Leaderboard', href: '/user/leaderboard' }, // Need to route to actual event later, or just general leaderboard route
  { label: 'FAQ', href: '/faq' },
];

export default function SiteNavbar() {
  const pathname = usePathname();
  const glassBg = opencodeTokens.colors.background.glassLight;

  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      right={0}
      h="80px"
      px={{ base: '20px', md: '40px' }}
      align="center"
      justify="space-between"
      bg="transparent"
      zIndex={100}
    >
      <Link href="/">
        <Flex align="center" gap="10px" color="white" _hover={{ color: opencodeTokens.colors.accent.sakura }} transition="all 0.3s">
          <Flower2 size={24} strokeWidth={1.5} />
          <Text fontSize="20px" fontWeight="700" letterSpacing="0.05em">
            OPENCODE
          </Text>
        </Flex>
      </Link>

      <Flex
        display={{ base: 'none', md: 'flex' }}
        align="center"
        gap="32px"
        bg={glassBg}
        px="32px"
        py="12px"
        borderRadius="full"
        backdropFilter="blur(20px)"
        border={`1px solid ${opencodeTokens.colors.border.light}`}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.label} href={item.href}>
              <Text
                fontSize="14px"
                fontWeight="500"
                color={isActive ? opencodeTokens.colors.text.primary : opencodeTokens.colors.text.secondary}
                position="relative"
                transition="all 0.3s"
                _hover={{ color: opencodeTokens.colors.text.primary }}
              >
                {item.label}
                {isActive && (
                  <Flex
                    position="absolute"
                    bottom="-6px"
                    left="50%"
                    transform="translateX(-50%)"
                    w="16px"
                    h="2px"
                    bg={opencodeTokens.colors.accent.sakura}
                    borderRadius="full"
                    boxShadow={`0 0 8px ${opencodeTokens.colors.accent.sakura}`}
                  />
                )}
              </Text>
            </Link>
          );
        })}
      </Flex>

      <Link href="/auth/sign-in">
        <Flex
          px="24px"
          py="10px"
          borderRadius="full"
          bg={opencodeTokens.colors.accent.sakura}
          color={opencodeTokens.colors.background.base}
          fontSize="14px"
          fontWeight="600"
          transition="all 0.3s"
          _hover={{
            bg: opencodeTokens.colors.accent.sakuraHover,
            boxShadow: `0 0 15px rgba(233, 167, 178, 0.4)`,
          }}
        >
          Sign In
        </Flex>
      </Link>
    </Flex>
  );
}
