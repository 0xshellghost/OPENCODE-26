'use client';

import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { opencodeTokens } from '../../../../theme/opencode-tokens';
import Link from 'next/link';
import { FaDiscord } from 'react-icons/fa';

export default function DiscordBanner() {
  const bgColor = opencodeTokens.colors.background.glassDark;
  const textColor = opencodeTokens.colors.text.primary;
  const subtitleColor = opencodeTokens.colors.text.secondary;

  return (
    <Link href="https://discord.gg/SxBATvUPnC" target="_blank">
      <Flex
        bg="linear-gradient(135deg, rgba(233, 167, 178, 0.15), rgba(233, 167, 178, 0.05))"
        backdropFilter="blur(20px)"
        border="1px solid rgba(233, 167, 178, 0.3)"
        direction="row"
        justify="space-between"
        align="center"
        borderRadius="20px"
        p={{ base: '16px', md: '24px' }}
        mb="24px"
        boxShadow="0 8px 32px 0 rgba(233, 167, 178, 0.2)"
        transition="all 0.3s ease"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: `0 15px 30px ${opencodeTokens.colors.accent.sakura}40`,
          borderColor: opencodeTokens.colors.accent.sakura
        }}
        gap={{ base: '12px', md: '0px' }}
      >
        <Flex align="center" gap={{ base: '12px', md: '16px' }}>
          <Box
            bg="#5865F2"
            p={{ base: '10px', md: '12px' }}
            borderRadius="14px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="md"
            minW={{ base: '48px', md: '56px' }}
          >
            <Icon
              as={FaDiscord}
              w={{ base: '24px', md: '32px' }}
              h={{ base: '24px', md: '32px' }}
              color="white"
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
          bg="#5865F2"
          color="white"
          px={{ base: '16px', md: '24px' }}
          py={{ base: '8px', md: '10px' }}
          borderRadius="full"
          fontWeight="700"
          fontSize={{ base: '12px', md: '14px' }}
          boxShadow="md"
          whiteSpace="nowrap"
          minW="fit-content"
          transition="all 0.2s"
          _hover={{
            transform: 'scale(1.05)',
            bg: '#4752C4',
          }}
        >
          Join Server
        </Box>
      </Flex>
    </Link>
  );
}
