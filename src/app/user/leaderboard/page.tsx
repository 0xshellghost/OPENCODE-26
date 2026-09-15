'use client';
import {
  Box,
  Flex,
  Grid,
  Text,
  Button
} from '@chakra-ui/react';
import React from 'react';
import { FetchedEvents } from 'api/events/events';
import { useQuery } from '@tanstack/react-query';
import { RingLoader } from 'react-spinners';
import { opencodeTokens } from '../../../theme/opencode-tokens';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export default function DataTables() {
  const router = useRouter();
  
  const { data: eventData, isLoading } = useQuery({
    queryKey: ['EventInfo'],
    queryFn: FetchedEvents,
  });

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="60vh">
        <RingLoader color={opencodeTokens.colors.accent.sakura} />
      </Flex>
    );
  }

  const events = eventData?.data;

  if (!eventData) {
    return <Box color="white">No event data available</Box>;
  }

  return (
    <Box w="100%" maxW="1200px" mx="auto">
      <Flex direction="column" w="100%" mb="40px">
        <Text fontSize="12px" fontWeight="700" letterSpacing="0.1em" color="rgba(255,255,255,0.6)" mb="8px" textTransform="uppercase">
          LEADERBOARDS
        </Text>
        <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="400" lineHeight="1.1" mb="16px" className="text-sakura-gradient">
          Champions' Hall
        </Text>
        <Text fontSize="16px" color="rgba(255,255,255,0.7)" lineHeight="1.6" maxW="600px">
          Select an event to view its leaderboard. See who leads the charge and track your own position among top contributors.
        </Text>
      </Flex>

      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
        gap="32px"
        w="100%"
      >
        {events.map((event: any) => (
          <Flex
            key={event.name}
            className="glass-panel"
            direction="column"
            p="32px"
            position="relative"
            overflow="hidden"
            borderRadius="20px"
            transition="all 0.4s ease"
            _hover={{
              transform: 'translateY(-4px)',
              boxShadow: `0 20px 40px rgba(0,0,0,0.4), inset 0 0 0 1px ${opencodeTokens.colors.accent.sakura}`,
            }}
            cursor="pointer"
            onClick={() => router.push(`/user/leaderboard/${encodeURIComponent(event.name)}`)}
          >
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
            
            <Text fontSize="20px" fontWeight="500" color="white" mb="12px" position="relative" zIndex={2}>
              {event.name}
            </Text>
            
            <Text fontSize="14px" color="rgba(255,255,255,0.6)" mb="32px" flex="1" position="relative" zIndex={2}>
              {event.description || 'View the top contributors and project maintainers for this event.'}
            </Text>

            <Button
              w="100%"
              h="40px"
              bg="rgba(255,255,255,0.05)"
              color="white"
              borderRadius="10px"
              _hover={{ 
                bg: opencodeTokens.colors.background.glassLight,
                color: opencodeTokens.colors.accent.sakura
              }}
              transition="all 0.3s ease"
              fontWeight="500"
              fontSize="14px"
              rightIcon={<ChevronRight size={16} />}
              position="relative"
              zIndex={2}
            >
              Enter Hall
            </Button>
          </Flex>
        ))}
      </Grid>
    </Box>
  );
}