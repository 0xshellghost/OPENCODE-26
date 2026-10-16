'use client';

import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { opencodeTokens } from '../../../../theme/opencode-tokens';
import Link from 'next/link';
import { FaDiscord } from 'react-icons/fa';

export default function DiscordBanner() {
  const textColor = '#fff1ec';
  const subtitleColor = '#dfced5';

  return (
    <Link href="https://discord.gg/SxBATvUPnC" target="_blank">
      <Flex
        role="group"
        bg="linear-gradient(135deg, rgba(30, 18, 38, 0.85) 0%, rgba(42, 24, 50, 0.82) 100%)"
        backdropFilter="blur(24px)"
        border="1px solid rgba(240, 168, 184, 0.22)"
        boxShadow="0 18px 45px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(240, 168, 184, 0.08)"
        direction="row"
        justify="space-between"
        align="center"
        borderRadius="22px"
        p={{ base: '16px', md: '22px 26px' }}
        mb="20px"
        transition="all 0.3s ease"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: '0 22px 50px rgba(0, 0, 0, 0.65), 0 0 24px rgba(240, 168, 184, 0.2)',
          borderColor: '#f0a8b8',
        }}
        gap={{ base: '12px', md: '0px' }}
      >
        <Flex align="center" gap={{ base: '12px', md: '16px' }}>
          <Box
            bg="rgba(240, 168, 184, 0.14)"
            border="1px solid rgba(240, 168, 184, 0.3)"
            p={{ base: '10px', md: '12px' }}
            borderRadius="14px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 4px 16px rgba(0, 0, 0, 0.3)"
            minW={{ base: '48px', md: '56px' }}
            color="#f0a8b8"
            transition="all 0.3s ease"
            _groupHover={{
              color: '#ffd0dc',
              borderColor: '#f0a8b8',
              bg: 'rgba(240, 168, 184, 0.22)',
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
          bg="linear-gradient(135deg, #f0a8b8 0%, #ea8ea2 100%)"
          color="#1f0f18"
          px={{ base: '16px', md: '24px' }}
          py={{ base: '8px', md: '10px' }}
          borderRadius="full"
          fontWeight="700"
          fontSize={{ base: '12px', md: '14px' }}
          boxShadow="0 4px 16px rgba(240, 168, 184, 0.35)"
          whiteSpace="nowrap"
          minW="fit-content"
          transition="all 0.2s ease"
          _hover={{
            transform: 'scale(1.05)',
            bg: 'linear-gradient(135deg, #ffd0dc 0%, #f0a8b8 100%)',
            boxShadow: '0 8px 24px rgba(240, 168, 184, 0.55)',
          }}
        >
          Join Server
        </Box>
      </Flex>
    </Link>
  );
}
