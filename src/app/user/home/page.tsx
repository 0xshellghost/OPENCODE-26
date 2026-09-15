'use client';

import { Box, Button, Flex, Text, Grid } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { FetchedEvents } from 'api/events/events';
import { fetchLoggedInBasicDetails } from 'api/profile/profile';
import axios from 'axios';
import { useAuth } from 'contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RingLoader } from 'react-spinners';
import { opencodeTokens } from '../../../theme/opencode-tokens';
import { ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();

  const handleLeaderboardclick = (eventName: string) => {
    router.push(`/user/leaderboard/${encodeURIComponent(eventName)}`);
  };

  const auth = useAuth();

  useEffect(() => {
    auth.check_login();
  }, [auth]);

  const { data: eventData, isLoading } = useQuery({
    queryKey: ['EventInfo'],
    queryFn: FetchedEvents,
  });

  const events = eventData?.data;

  useEffect(() => {
    const querystring = window.location.search;
    const urlParam = new URLSearchParams(querystring);
    const TokenParam = urlParam.get('token');

    if (TokenParam === null) {
      auth.check_login();
    } else {
      localStorage.setItem('token', TokenParam);
    }
    if (localStorage.getItem('token')) {
      fetchLoggedInBasicDetails();
      axios.post(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/api/v1/events/register?eventName=${encodeURIComponent(
          `${process.env.NEXT_PUBLIC_EVENT_NAME}`,
        )}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
    }
  }, [auth]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="60vh">
        <RingLoader color={opencodeTokens.colors.accent.sakura} />
      </Flex>
    );
  }

  return (
    <Box w="100%" maxW="1200px" mx="auto">
      <Box mb="40px">
        <Text fontSize="12px" fontWeight="700" letterSpacing="0.1em" color="rgba(255,255,255,0.6)" mb="8px" textTransform="uppercase">
          OPENCODE EVENTS
        </Text>
        <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="400" lineHeight="1.1" mb="16px" className="text-sakura-gradient">
          The Journey Begins
        </Text>
        <Text fontSize="16px" color="rgba(255,255,255,0.7)" lineHeight="1.6" maxW="600px">
          Select an active event to track your progress, view the leaderboard, and see your impact in the OpenCode community.
        </Text>
      </Box>

      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap="32px">
        {events?.map((event: any, index: number) => (
          <Flex
            key={event.name}
            className="glass-panel"
            direction="column"
            p="40px"
            position="relative"
            overflow="hidden"
            borderRadius="24px"
            transition="all 0.4s ease"
            _hover={{
              transform: 'translateY(-4px)',
              boxShadow: `0 20px 40px rgba(0,0,0,0.4), inset 0 0 0 1px ${opencodeTokens.colors.accent.sakura}`,
            }}
          >
            {/* Cinematic subtle glow inside the card */}
            <Box
              position="absolute"
              top="-50%"
              right="-50%"
              w="100%"
              h="100%"
              bg={`radial-gradient(circle, ${opencodeTokens.colors.accent.sakuraHover} 0%, transparent 60%)`}
              opacity={0.15}
              pointerEvents="none"
            />

            <Text fontSize="24px" fontWeight="300" color="white" mb="12px" position="relative" zIndex={2}>
              {event.name}
            </Text>
            
            <Text fontSize="15px" color="rgba(255,255,255,0.6)" mb="40px" flex="1" position="relative" zIndex={2}>
              Join the competition, collaborate with others, and climb the ranks. The leaderboard awaits.
            </Text>

            <Flex gap="16px" direction={{ base: 'column', sm: 'row' }} position="relative" zIndex={2}>
              {!auth.isLoggedIn && (
                <Link href="/auth/sign-in" style={{ width: '100%' }}>
                  <Button
                    w="100%"
                    h="48px"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    border="1px solid rgba(255,255,255,0.2)"
                    borderRadius="12px"
                    _hover={{ bg: 'rgba(255,255,255,0.15)' }}
                    transition="all 0.3s ease"
                    fontWeight="500"
                  >
                    Join Now
                  </Button>
                </Link>
              )}
              
              <Button
                w={{ base: '100%', sm: auth.isLoggedIn ? '100%' : 'auto' }}
                h="48px"
                bg={opencodeTokens.colors.accent.sakura}
                color={opencodeTokens.colors.background.base}
                borderRadius="12px"
                _hover={{ 
                  bg: opencodeTokens.colors.accent.sakuraHover,
                  boxShadow: `0 0 20px rgba(233,167,178,0.4)`
                }}
                transition="all 0.3s ease"
                fontWeight="600"
                onClick={() => handleLeaderboardclick(event.name)}
                rightIcon={<ChevronRight size={18} />}
              >
                View Leaderboard
              </Button>
            </Flex>
          </Flex>
        ))}
      </Grid>
    </Box>
  );
}
