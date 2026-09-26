'use client';
import Lottie from 'lottie-react';
import { Box, Flex, Text, keyframes } from '@chakra-ui/react';
import { opencodeTokens } from 'theme/opencode-tokens';
const breathe = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
`;
export default function LeaderboardLoader() {
  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={2000}
      bg="rgba(21, 21, 30, 0.7)"
      backdropFilter="blur(10px)"
      color="white"
    >
      <Flex direction="column" align="center" justify="center" h="100%" gap={6}>
        <Box
          position="relative"
          w="60px"
          h="60px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          animation={`${breathe} 2s ease-in-out infinite`}
        >
          {/* Outer glowing ring */}
          <Box
            position="absolute"
            inset="-10px"
            borderRadius="full"
            border={`2px solid ${opencodeTokens.colors.accent.sakura}`}
            opacity={0.5}
            boxShadow={`0 0 20px ${opencodeTokens.colors.accent.sakura}`}
          />
          {/* Inner sakura icon */}
          <Box color={opencodeTokens.colors.accent.sakura}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13 7 19 9 22 12C19 15 13 17 12 22C11 17 5 15 2 12C5 9 11 7 12 2Z" />
            </svg>
          </Box>
        </Box>
        <Text
          fontFamily="'Cinzel', 'Georgia', serif"
          fontSize="16px"
          letterSpacing="0.2em"
          color={opencodeTokens.colors.accent.sakura}
          opacity={0.9}
        >
          LOADING...
        </Text>
      </Flex>
    </Box>
  );
}