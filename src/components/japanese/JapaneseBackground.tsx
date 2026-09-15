import React, { useMemo } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import GlobalSakuraBackground from '../common/GlobalSakuraBackground';

type JapaneseBackgroundVariant = 'events' | 'leaderboard' | 'faq' | 'auth' | 'home' | 'winners' | 'milestones' | 'profile';

interface JapaneseBackgroundProps {
  variant: JapaneseBackgroundVariant;
  children: React.ReactNode;
}

export default function JapaneseBackground({ variant, children }: JapaneseBackgroundProps) {
  const { sakuraIntensity, backgroundUrl, overlayOpacity } = useMemo(() => {
    switch (variant) {
      case 'events':
        return { sakuraIntensity: 0.2, backgroundUrl: '/assets/opencode-2026/backgrounds/events-village.webp', overlayOpacity: 0.7 };
      case 'leaderboard':
        return { sakuraIntensity: 0.15, backgroundUrl: '/assets/opencode-2026/backgrounds/leaderboard-hall.webp', overlayOpacity: 0.8 };
      case 'faq':
        return { sakuraIntensity: 0.05, backgroundUrl: '/assets/opencode-2026/backgrounds/faq-zen-garden.webp', overlayOpacity: 0.85 };
      case 'auth':
        return { sakuraIntensity: 0.1, backgroundUrl: '/img/auth/signin-bg.png', overlayOpacity: 0.75 };
      case 'home':
        return { sakuraIntensity: 0.1, backgroundUrl: '/assets/opencode-2026/backgrounds/home-landscape.webp', overlayOpacity: 0.75 };
      case 'winners':
        return { sakuraIntensity: 0.15, backgroundUrl: '/assets/opencode-2026/backgrounds/winners-castle.webp', overlayOpacity: 0.7 };
      case 'milestones':
        return { sakuraIntensity: 0.1, backgroundUrl: '/assets/opencode-2026/backgrounds/milestones-path.webp', overlayOpacity: 0.75 };
      case 'profile':
        return { sakuraIntensity: 0.1, backgroundUrl: '/assets/opencode-2026/backgrounds/profile-garden.webp', overlayOpacity: 0.8 };
      default:
        return { sakuraIntensity: 0.1, backgroundUrl: '', overlayOpacity: 0.8 };
    }
  }, [variant]);

  return (
    <Box position="relative" minH="100vh" w="100%" overflowX="hidden" bg="#1a1625">
      {/* 1. Environment Image */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgImage={`url('${backgroundUrl}')`}
        bgSize="cover"
        bgPosition="center"
        bgAttachment="fixed"
        zIndex={0}
        opacity={backgroundUrl ? 1 : 0}
      />
      
      {/* 2. Color / Gradient Overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg={`rgba(26, 22, 37, ${overlayOpacity})`}
        bgGradient={`linear(to-b, rgba(26, 22, 37, ${overlayOpacity}), rgba(33, 29, 39, ${overlayOpacity + 0.1}))`}
        zIndex={1}
      />
      
      {/* 3. Atmospheric Mist */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="60vh"
        bgGradient="linear(to-t, rgba(26, 22, 37, 1), rgba(26, 22, 37, 0))"
        zIndex={2}
        pointerEvents="none"
      />
      
      {/* 4. Optional subtle Sakura */}
      <Box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={3} pointerEvents="none" opacity={sakuraIntensity}>
        {/* We reuse the GlobalSakuraBackground component, but wrapped with lower opacity */}
        <GlobalSakuraBackground />
      </Box>
      
      {/* 5. Page Content */}
      <Flex position="relative" zIndex={10} direction="column" minH="100vh" w="100%">
        {children}
      </Flex>
    </Box>
  );
}
