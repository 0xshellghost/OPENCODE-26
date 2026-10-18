'use client';

import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { opencodeTokens } from '../../../../theme/opencode-tokens';
import Link from 'next/link';
import { FaDiscord } from 'react-icons/fa';

export default function DiscordBanner() {
  const textColor = 'var(--fg)';
  const subtitleColor = 'var(--muted)';

  return (
    <Link href="https://discord.gg/SxBATvUPnC" target="_blank">
      <Flex
        role="group"
        bg="var(--surface)"
        backdropFilter="blur(24px)"
        border="1px solid var(--border)"
        boxShadow="var(--shadow)"
        direction="row"
        justify="space-between"
        align="center"
        borderRadius="22px"
        p={{ base: '16px', md: '22px 26px' }}
        mb="20px"
        transition="all 0.3s ease"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow)',
          borderColor: 'var(--accent)',
        }}
        gap={{ base: '12px', md: '0px' }}
      >
        <Flex align="center" gap={{ base: '12px', md: '16px' }}>
          <Box
            bg="var(--accent-soft)"
            border="1px solid var(--border)"
            p={{ base: '10px', md: '12px' }}
            borderRadius="14px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="var(--shadow)"
            minW={{ base: '48px', md: '56px' }}
            color="var(--accent)"
            transition="all 0.3s ease"
            _groupHover={{
              color: 'var(--accent-hover)',
              borderColor: 'var(--accent)',
              bg: 'var(--accent-soft)',
            }}
          >
            <Icon
              as={FaDiscord}
              w={{ base: '24px', md: '30px' }}
              h={{ base: '24px', md: '30px' }}
            />
          </Box>
          <Box>
            <Text
              fontSize={{ base: '16px', md: '22px' }}
              fontWeight="800"
              lineHeight="1.2"
              color={textColor}
            >
              Join Community
            </Text>
            {/* Desktop Text */}
            <Text
              fontSize={{ base: '11px', md: '14px' }}
              color={subtitleColor}
              mt="2px"
              display={{ base: 'none', sm: 'block' }}
            >
              Stay updated on issues & further communication
            </Text>
            {/* Mobile Text */}
            <Text
              fontSize="10px"
              color={subtitleColor}
              mt="2px"
              display={{ base: 'block', sm: 'none' }}
            >
              Stay updated on issues
            </Text>
          </Box>
        </Flex>

        <Box
          bg="var(--accent)"
          color="var(--accent-ink)"
          px={{ base: '16px', md: '24px' }}
          py={{ base: '8px', md: '10px' }}
          borderRadius="full"
          fontWeight="700"
          fontSize={{ base: '12px', md: '14px' }}
          boxShadow="var(--shadow)"
          whiteSpace="nowrap"
          minW="fit-content"
          transition="all 0.2s ease"
          _hover={{
            transform: 'scale(1.05)',
            bg: 'var(--accent-hover)',
            boxShadow: 'var(--shadow)',
          }}
        >
          Join Server
        </Box>
      </Flex>
    </Link>
  );
}
