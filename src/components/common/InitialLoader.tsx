'use client';

import { Box, Flex, Text, keyframes } from '@chakra-ui/react';
import seoRankingAnimation from 'assets/lottie/SeoRanking.json';
import trophyAnimation from 'assets/lottie/Trophy.json';
import Lottie from 'lottie-react';

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
`;

const fadeFloat = keyframes`
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
`;

type InitialLoaderProps = {
  isExiting?: boolean;
  onComplete?: () => void;
  variant?: 'seo' | 'trophy';
};

export default function InitialLoader({
  isExiting = false,
  onComplete,
  variant = 'seo',
}: InitialLoaderProps) {
  const animationData =
    variant === 'trophy' ? trophyAnimation : seoRankingAnimation;
  const message =
    variant === 'trophy' ? 'Loading leaderboard…' : 'Loading the experience…';
  const japaneseLabel = variant === 'trophy' ? '順位表' : '体験';

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={2000}
      bg="var(--bg)"
      color="var(--text)"
      opacity={isExiting ? 0 : 1}
      transform={isExiting ? 'scale(0.97)' : 'scale(1)'}
      transition="opacity 400ms ease, transform 400ms ease"
      overflow="hidden"
    >
      {/* Sakura radial glow */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="600px"
        h="600px"
        borderRadius="full"
        bg="radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)"
        opacity={0.6}
        pointerEvents="none"
      />

      {/* Decorative border lines */}
      <Box
        position="absolute"
        inset="24px"
        border="1px solid var(--border)"
        borderRadius="18px"
        pointerEvents="none"
        opacity={0.4}
      />

      <Flex
        direction="column"
        align="center"
        justify="center"
        h="100%"
        gap={3}
        position="relative"
        zIndex={1}
      >
        {/* Japanese decorative label */}
        <Text
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="18px"
          letterSpacing="0.28em"
          color="var(--accent)"
          opacity={0.65}
          animation={`${fadeFloat} 0.6s ease forwards`}
        >
          {japaneseLabel}
        </Text>

        {/* Lottie in a glass card */}
        <Box
          bg="var(--card-bg)"
          border="1px solid var(--border)"
          borderRadius="18px"
          backdropFilter="blur(22px)"
          WebkitBackdropFilter="blur(22px)"
          boxShadow="var(--shadow), inset 0 1px 0 rgba(255, 224, 235, .04)"
          p={{ base: 5, md: 7 }}
          animation={`${fadeFloat} 0.5s ease 0.1s forwards`}
          opacity={0}
        >
          <Box w={{ base: '180px', md: '230px' }}>
            <Lottie
              animationData={animationData}
              loop={false}
              onComplete={onComplete}
            />
          </Box>
        </Box>

        {/* Message text */}
        <Text
          fontSize={{ base: 'sm', md: 'md' }}
          fontWeight="500"
          color="var(--muted)"
          animation={`${fadeFloat} 0.5s ease 0.25s forwards`}
          opacity={0}
        >
          {message}
        </Text>

        {/* Pulsing dot indicator */}
        <Flex gap="6px" mt={1} animation={`${fadeFloat} 0.5s ease 0.35s forwards`} opacity={0}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              w="5px"
              h="5px"
              borderRadius="full"
              bg="var(--accent)"
              animation={`${pulse} 1.2s ease-in-out ${i * 0.15}s infinite`}
            />
          ))}
        </Flex>
      </Flex>
    </Box>
  );
}
