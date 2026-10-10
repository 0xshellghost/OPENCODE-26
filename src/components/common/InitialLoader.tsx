'use client';

import { Box, Flex, Text, keyframes, Image } from '@chakra-ui/react';
import { opencodeTokens } from 'theme/opencode-tokens';
import { useEffect, useState, useMemo } from 'react';

/* ───────────── keyframes ───────────── */

const fadeFloat = keyframes`
  0% { opacity: 0; transform: translateY(18px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const progressAnim = keyframes`
  0% { width: 0%; }
  30% { width: 45%; }
  60% { width: 75%; }
  100% { width: 100%; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const spinReverse = keyframes`
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
`;

const petalFall = keyframes`
  0%   { transform: translate(0, -10vh) rotate(0deg); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translate(80px, 110vh) rotate(720deg); opacity: 0; }
`;

const petalSway = keyframes`
  0%, 100% { transform: translateX(0); }
  25%  { transform: translateX(30px); }
  50%  { transform: translateX(-20px); }
  75%  { transform: translateX(15px); }
`;

const glowPulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%      { opacity: 1; transform: scale(1.08); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const breathe = keyframes`
  0%, 100% { opacity: 0.3; }
  50%      { opacity: 0.7; }
`;

const diamondPulse = keyframes`
  0%, 100% { box-shadow: 0 0 4px rgba(233, 167, 178, 0.4); }
  50%      { box-shadow: 0 0 12px rgba(233, 167, 178, 0.8); }
`;

/* ───────────── sakura petal component ───────────── */

function SakuraPetal({ delay, left, size, duration }: { delay: number; left: string; size: number; duration: number }) {
  return (
    <Box
      position="absolute"
      left={left}
      top="-20px"
      w={`${size}px`}
      h={`${size * 0.7}px`}
      borderRadius="50% 0 50% 50%"
      bg="linear-gradient(135deg, rgba(233, 167, 178, 0.9), rgba(255, 200, 210, 0.6))"
      boxShadow="0 0 6px rgba(233, 167, 178, 0.4)"
      animation={`${petalFall} ${duration}s ease-in-out ${delay}s infinite`}
      opacity={0}
      pointerEvents="none"
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          animation: `${petalSway} ${duration * 0.4}s ease-in-out ${delay}s infinite`,
        },
      }}
    />
  );
}

/* ───────────── loader ───────────── */

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

  useEffect(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  // Generate petal configs once
  const petals = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        delay: Math.random() * 10,
        left: `${Math.random() * 100}%`,
        size: 8 + Math.random() * 10,
        duration: 4 + Math.random() * 9,
      })),
    [],
  );

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={2000}
      backgroundImage="url('/images/loading-bg.png')"
      backgroundSize="cover"
      backgroundPosition="center"
      opacity={isExiting ? 0 : 1}
      transform={isExiting ? 'scale(1.05)' : 'scale(1)'}
      transition="opacity 700ms ease-out, transform 700ms ease-out"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* ── Cinematic vignette overlay ── */}
      <Box
        position="absolute"
        inset={0}
        bg="radial-gradient(ellipse 70% 60% at center 45%, rgba(15, 8, 25, 0.15) 0%, rgba(10, 5, 20, 0.55) 50%, rgba(5, 2, 12, 0.85) 100%)"
        pointerEvents="none"
      />

      {/* ── Ambient sakura glow spots ── */}
      <Box
        position="absolute"
        top="20%"
        left="30%"
        w="300px"
        h="300px"
        borderRadius="full"
        bg={`radial-gradient(circle, ${opencodeTokens.colors.accent.sakura}18, transparent 70%)`}
        filter="blur(60px)"
        animation={`${breathe} 6s ease-in-out infinite`}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="25%"
        right="25%"
        w="250px"
        h="250px"
        borderRadius="full"
        bg={`radial-gradient(circle, ${opencodeTokens.colors.accent.sakura}12, transparent 70%)`}
        filter="blur(50px)"
        animation={`${breathe} 8s ease-in-out 2s infinite`}
        pointerEvents="none"
      />

      {/* ── Falling sakura petals ── */}
      {petals.map((p) => (
        <SakuraPetal key={p.id} delay={p.delay} left={p.left} size={p.size} duration={p.duration} />
      ))}

      {/* ── Main content ── */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        position="relative"
        zIndex={1}
        w="100%"
        px={6}
      >
        {/* ── Glowing Enso Circle with Logo ── */}
        <Box
          position="relative"
          w={{ base: '150px', md: '190px' }}
          h={{ base: '150px', md: '190px' }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb="44px"
          animation={`${fadeFloat} 1s ease forwards`}
        >
          {/* Large ambient glow behind the circle */}
          <Box
            position="absolute"
            inset="-40px"
            borderRadius="full"
            bg={`radial-gradient(circle, ${opencodeTokens.colors.accent.sakura}30, transparent 65%)`}
            animation={`${glowPulse} 4s ease-in-out infinite`}
            pointerEvents="none"
          />

          {/* Enso brush‑stroke ring */}
          <Box
            position="absolute"
            inset={0}
            borderRadius="full"
            border={`3.5px solid ${opencodeTokens.colors.accent.sakura}`}
            boxShadow={`
              0 0 30px ${opencodeTokens.colors.accent.sakura}90,
              0 0 60px ${opencodeTokens.colors.accent.sakura}40,
              inset 0 0 25px ${opencodeTokens.colors.accent.sakura}50
            `}
            opacity={0.85}
          />

          {/* Outer dashed ring — slow spin */}
          <Box
            position="absolute"
            inset="-14px"
            borderRadius="full"
            border={`1.5px dashed ${opencodeTokens.colors.accent.sakura}50`}
            animation={`${spin} 25s linear infinite`}
          />

          {/* Inner dotted ring — reverse spin */}
          <Box
            position="absolute"
            inset="12px"
            borderRadius="full"
            border={`1px dotted ${opencodeTokens.colors.accent.sakura}70`}
            animation={`${spinReverse} 18s linear infinite`}
          />

          <Box
            w={{ base: '70px', md: '90px' }}
            h={{ base: '70px', md: '90px' }}
            bg={opencodeTokens.colors.accent.sakura}
            style={{
              maskImage: "url('/Logo/opencodelogo.png')",
              WebkitMaskImage: "url('/Logo/opencodelogo.png')",
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
            }}
            filter="drop-shadow(0 0 16px rgba(255,255,255,0.6))"
          />
        </Box>

        {/* ── OPENCODE 2026 ── */}
        <Text
          fontFamily="'Cinzel', 'Georgia', serif"
          fontSize={{ base: '28px', md: '46px' }}
          letterSpacing="0.28em"
          fontWeight="300"
          color="white"
          mb={2}
          textAlign="center"
          textShadow={`0 2px 16px rgba(0,0,0,0.6), 0 0 40px ${opencodeTokens.colors.accent.sakura}25`}
          animation={`${fadeFloat} 1s ease 0.15s forwards`}
          opacity={0}
        >
          OPENCODE 2026
        </Text>

        {/* ── Tagline ── */}
        <Text
          fontFamily="'Inter', sans-serif"
          fontSize={{ base: '8px', md: '11px' }}
          letterSpacing="0.5em"
          color="whiteAlpha.600"
          mb="72px"
          textAlign="center"
          animation={`${fadeFloat} 1s ease 0.3s forwards`}
          opacity={0}
          textTransform="uppercase"
        >
          Where Tradition Meets Creation
        </Text>

        {/* ── Progress Bar ── */}
        <Flex
          align="center"
          w="100%"
          maxW="480px"
          mb={5}
          animation={`${fadeFloat} 1s ease 0.45s forwards`}
          opacity={0}
        >
          {/* Left Diamond */}
          <Box
            w="10px"
            h="10px"
            transform="rotate(45deg)"
            bg="transparent"
            border={`2px solid ${opencodeTokens.colors.accent.sakura}`}
            boxShadow={`0 0 8px ${opencodeTokens.colors.accent.sakura}80`}
            animation={`${diamondPulse} 2.5s ease-in-out infinite`}
          />

          {/* Bar */}
          <Box
            flex={1}
            h="5px"
            mx="14px"
            position="relative"
            bg={`${opencodeTokens.colors.accent.sakura}20`}
            borderRadius="full"
            overflow="hidden"
            border={`1px solid ${opencodeTokens.colors.accent.sakura}30`}
          >
            <Box
              position="absolute"
              left={0}
              top={0}
              bottom={0}
              w="100%"
              bg={`linear-gradient(90deg, ${opencodeTokens.colors.accent.sakura}40, ${opencodeTokens.colors.accent.sakura}dd, ${opencodeTokens.colors.accent.sakura})`}
              animation={`${progressAnim} 2.8s ease-in-out forwards`}
              borderRadius="full"
              boxShadow={`0 0 18px ${opencodeTokens.colors.accent.sakura}cc, 0 0 6px ${opencodeTokens.colors.accent.sakura}, 0 0 40px ${opencodeTokens.colors.accent.sakura}50`}
            />
            {/* Shimmer highlight */}
            <Box
              position="absolute"
              inset={0}
              bg={`linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`}
              backgroundSize="200% 100%"
              animation={`${shimmer} 2s linear infinite`}
              borderRadius="full"
              pointerEvents="none"
            />
          </Box>

          {/* Right Diamond */}
          <Box
            w="10px"
            h="10px"
            transform="rotate(45deg)"
            bg="transparent"
            border={`2px solid ${opencodeTokens.colors.accent.sakura}`}
            boxShadow={`0 0 8px ${opencodeTokens.colors.accent.sakura}80`}
            animation={`${diamondPulse} 2.5s ease-in-out 0.5s infinite`}
          />
        </Flex>

        {/* ── Loading text ── */}
        <Text
          fontSize="11px"
          color="whiteAlpha.600"
          mb={2}
          letterSpacing="0.15em"
          fontFamily="'Inter', sans-serif"
          animation={`${fadeFloat} 1s ease 0.6s forwards`}
          opacity={0}
        >
          Loading the experience...
        </Text>

        {/* ── Yuzuki welcome (Phase 1.3) ── */}
        <Text
          fontSize="12px"
          letterSpacing="0.25em"
          fontFamily="Georgia, 'Times New Roman', serif"
          mb={7}
          textAlign="center"
          animation={`${fadeFloat} 1.2s ease 2.6s forwards`}
          opacity={0}
          sx={{
            background: `linear-gradient(90deg, #e9a7b2, #fff4ed, #e9a7b2)`,
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: `${fadeFloat} 1.2s ease 2.6s forwards, ${shimmer} 4s linear 3.8s infinite`,
          }}
        >
          ゆづき welcomes you
        </Text>

        {/* ── Sakura icon separator ── */}
        <Flex
          align="center"
          gap={4}
          animation={`${fadeFloat} 1s ease 0.75s forwards`}
          opacity={0}
        >
          <Box
            w="70px"
            h="1px"
            bg={`linear-gradient(90deg, transparent, ${opencodeTokens.colors.accent.sakura}50)`}
          />

          <Box color={opencodeTokens.colors.accent.sakura} animation={`${glowPulse} 3s ease-in-out infinite`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13 7 19 9 22 12C19 15 13 17 12 22C11 17 5 15 2 12C5 9 11 7 12 2Z" />
            </svg>
          </Box>

          <Box
            w="70px"
            h="1px"
            bg={`linear-gradient(270deg, transparent, ${opencodeTokens.colors.accent.sakura}50)`}
          />
        </Flex>
      </Flex>
    </Box>
  );
}
