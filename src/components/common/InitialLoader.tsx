'use client';

import { Box, Flex, Text, keyframes, Image } from '@chakra-ui/react';
import { opencodeTokens } from 'theme/opencode-tokens';
import { useEffect, useState } from 'react';

const fadeFloat = keyframes`
  0% { opacity: 0; transform: translateY(12px); }
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

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={2000}
      backgroundImage="url('/images/loading-bg.png')"
      backgroundSize="cover"
      backgroundPosition="center"
      opacity={isExiting ? 0 : 1}
      transform={isExiting ? 'scale(1.03)' : 'scale(1)'}
      transition="opacity 600ms ease-out, transform 600ms ease-out"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Dark overlay to ensure text readability */}
      <Box
        position="absolute"
        inset={0}
        bg="radial-gradient(circle at center, rgba(15, 8, 25, 0.3) 0%, rgba(10, 5, 20, 0.7) 100%)"
      />

      <Flex
        direction="column"
        align="center"
        justify="center"
        position="relative"
        zIndex={1}
        w="100%"
        px={6}
      >
        {/* Glowing Enso Circle with Logo */}
        <Box
          position="relative"
          w="180px"
          h="180px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb="40px"
          animation={`${fadeFloat} 0.8s ease forwards`}
        >
          {/* Inner solid glow ring */}
          <Box
            position="absolute"
            inset={0}
            borderRadius="full"
            border={`4px solid ${opencodeTokens.colors.accent.sakura}`}
            boxShadow={`0 0 25px ${opencodeTokens.colors.accent.sakura}80, inset 0 0 20px ${opencodeTokens.colors.accent.sakura}60`}
            opacity={0.8}
          />
          
          {/* Outer dashed rotating ring */}
          <Box
            position="absolute"
            inset="-12px"
            borderRadius="full"
            border={`2px dashed ${opencodeTokens.colors.accent.sakura}60`}
            animation={`${spin} 20s linear infinite`}
          />

          {/* Inner dotted rotating ring */}
          <Box
            position="absolute"
            inset="10px"
            borderRadius="full"
            border={`1.5px dotted ${opencodeTokens.colors.accent.sakura}90`}
            animation={`${spinReverse} 15s linear infinite`}
          />

          <Image 
            src="/Logo/OpenCode-White.png" 
            alt="OpenCode Logo" 
            w="75px" 
            h="auto"
            filter="drop-shadow(0 0 10px rgba(255,255,255,0.4))"
          />
        </Box>

        {/* OPENCODE 2026 */}
        <Text
          fontFamily="'Cinzel', 'Georgia', serif"
          fontSize={{ base: '32px', md: '46px' }}
          letterSpacing="0.25em"
          fontWeight="300"
          color="white"
          mb={2}
          textAlign="center"
          textShadow="0 2px 10px rgba(0,0,0,0.5)"
          animation={`${fadeFloat} 0.8s ease 0.1s forwards`}
          opacity={0}
        >
          OPENCODE 2026
        </Text>

        {/* WHERE TRADITION MEETS CREATION */}
        <Text
          fontFamily="'Inter', sans-serif"
          fontSize={{ base: '9px', md: '11px' }}
          letterSpacing="0.45em"
          color="whiteAlpha.700"
          mb="70px"
          textAlign="center"
          animation={`${fadeFloat} 0.8s ease 0.2s forwards`}
          opacity={0}
          textTransform="uppercase"
        >
          Where Tradition Meets Creation
        </Text>

        {/* Progress Bar Container */}
        <Flex 
          align="center" 
          w="100%" 
          maxW="500px" 
          mb={5}
          animation={`${fadeFloat} 0.8s ease 0.3s forwards`}
          opacity={0}
        >
          {/* Left Diamond */}
          <Box 
            w="8px" 
            h="8px" 
            transform="rotate(45deg)" 
            bg="transparent" 
            border={`1px solid ${opencodeTokens.colors.accent.sakura}`} 
          />
          
          {/* Bar */}
          <Box flex={1} h="3px" mx="12px" position="relative" bg="whiteAlpha.200" borderRadius="full" overflow="hidden">
            <Box 
              position="absolute" 
              left={0} 
              top={0} 
              bottom={0} 
              w="100%" 
              bg={`linear-gradient(90deg, ${opencodeTokens.colors.accent.sakura}40, ${opencodeTokens.colors.accent.sakura})`}
              animation={`${progressAnim} 2.5s ease-in-out forwards`} 
              borderRadius="full"
              boxShadow={`0 0 10px ${opencodeTokens.colors.accent.sakura}`}
            />
          </Box>
          
          {/* Right Diamond */}
          <Box 
            w="8px" 
            h="8px" 
            transform="rotate(45deg)" 
            bg="transparent" 
            border={`1px solid ${opencodeTokens.colors.accent.sakura}`} 
          />
        </Flex>

        {/* Loading text */}
        <Text 
          fontSize="11px" 
          color="whiteAlpha.700" 
          mb={6}
          letterSpacing="0.1em"
          animation={`${fadeFloat} 0.8s ease 0.4s forwards`}
          opacity={0}
        >
          Loading the experience...
        </Text>

        {/* Sakura icon separator */}
        <Flex 
          align="center" 
          gap={4}
          animation={`${fadeFloat} 0.8s ease 0.5s forwards`}
          opacity={0}
        >
          <Box w="60px" h="1px" bg={`linear-gradient(90deg, transparent, ${opencodeTokens.colors.accent.sakura}60)`} />
          
          <Box color={opencodeTokens.colors.accent.sakura}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13 7 19 9 22 12C19 15 13 17 12 22C11 17 5 15 2 12C5 9 11 7 12 2Z" />
            </svg>
          </Box>
          
          <Box w="60px" h="1px" bg={`linear-gradient(270deg, transparent, ${opencodeTokens.colors.accent.sakura}60)`} />
        </Flex>
      </Flex>
    </Box>
  );
}
