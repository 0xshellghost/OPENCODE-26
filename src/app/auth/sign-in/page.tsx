'use client';

import React from 'react';
import { Box, Button, Flex, Text, Icon } from '@chakra-ui/react';
import { FaGithub } from 'react-icons/fa';
import JapaneseBackground from '../../../components/japanese/JapaneseBackground';
import SiteNavbar from '../../../components/navbar/SiteNavbar';
import { opencodeTokens } from '../../../theme/opencode-tokens';
import Image from 'next/image';

export default function SignIn() {
  const handleLoginWithGitHub = () => {
    window.location.assign(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/github`,
    );
  };

  return (
    <JapaneseBackground variant="auth">
      <SiteNavbar />

      <Flex minH="100vh" w="100%">
        {/* LEFT PANEL: Authentication */}
        <Flex
          w={{ base: '100%', md: '500px', lg: '600px' }}
          minH="100vh"
          bg="rgba(26, 22, 37, 0.6)"
          backdropFilter="blur(24px)"
          borderRight={{ base: 'none', md: `1px solid ${opencodeTokens.colors.border.light}` }}
          boxShadow="20px 0 50px rgba(0,0,0,0.3)"
          direction="column"
          justify="center"
          px={{ base: '32px', md: '64px' }}
          position="relative"
          zIndex={10}
        >
          <Box mb="40px">
            <Text fontSize="12px" fontWeight="700" letterSpacing="0.1em" color="rgba(255,255,255,0.5)" mb="8px" textTransform="uppercase">
              THE GATEWAY
            </Text>
            <Text fontSize={{ base: '36px', md: '48px' }} fontWeight="400" lineHeight="1.1" mb="16px" className="text-sakura-gradient">
              Welcome Back
            </Text>
            <Text fontSize="16px" color="rgba(255,255,255,0.7)" lineHeight="1.6">
              Continue your journey with OPENCODE 2026. Sign in to access your dashboard, track your progress, and explore the leaderboard.
            </Text>
          </Box>

          <Button
            onClick={handleLoginWithGitHub}
            w="100%"
            h="56px"
            borderRadius="12px"
            bg={opencodeTokens.colors.background.glassDark}
            border={`1px solid ${opencodeTokens.colors.border.light}`}
            color="white"
            fontSize="16px"
            fontWeight="500"
            _hover={{
              bg: opencodeTokens.colors.background.glassLight,
              borderColor: opencodeTokens.colors.accent.sakura,
              transform: 'translateY(-2px)',
              boxShadow: opencodeTokens.shadows.glow,
            }}
            transition="all 0.3s ease"
            boxShadow="0 10px 30px rgba(0,0,0,0.2)"
            leftIcon={<Icon as={FaGithub} w="22px" h="22px" />}
          >
            Continue with GitHub
          </Button>

          <Text fontSize="13px" color="rgba(255,255,255,0.4)" textAlign="center" mt="32px">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </Flex>

        {/* RIGHT PANEL: Scene Focus */}
        <Flex
          flex="1"
          display={{ base: 'none', md: 'flex' }}
          direction="column"
          justify="center"
          align="center"
          position="relative"
          zIndex={10}
        >
          {/* We leave the right side completely transparent so the JapaneseBackground Torii image shines through beautifully. */}
          <Box
            p="40px"
            borderRadius="24px"
            className="glass-panel"
            maxW="400px"
            textAlign="center"
            boxShadow={opencodeTokens.shadows.glass}
            border={`1px solid ${opencodeTokens.colors.border.light}`}
            transition="all 0.5s ease"
            _hover={{ transform: 'translateY(-5px)', boxShadow: opencodeTokens.shadows.glow }}
          >
            <Flex justify="center" mb="24px">
              <Image src="/Logo/OpenCode-White.png" alt="OpenCode 2026" width={80} height={80} />
            </Flex>
            <Text fontSize="26px" fontWeight="300" color="white" mb="12px" letterSpacing="0.05em">
              Where tradition meets creation
            </Text>
            <Text fontSize="15px" color="rgba(255,255,255,0.7)" lineHeight="1.6">
              A new season of ideas, collaboration, and open-source possibilities.
            </Text>
          </Box>
        </Flex>
      </Flex>
    </JapaneseBackground>
  );
}
