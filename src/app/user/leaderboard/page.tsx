'use client';
import {
  Box,
  Flex,
  Grid,
  Text,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';
import React from 'react';
import NFT from '../../../components/card/NFT';
import { FetchedEvents } from 'api/events/events';
import { useQuery } from '@tanstack/react-query';
import { RingLoader } from 'react-spinners';

export default function DataTables() {
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  const { data: eventData, isLoading } = useQuery({
    queryKey: ['EventInfo'],
    queryFn: FetchedEvents,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RingLoader color="#36d7b7" />
      </div>
    );
  }

  const events = eventData?.data;

  if (!eventData) {
    return <div>No event data available</div>;
  }

  return (
    <Box 
      pt={{ base: '120px', md: '90px', xl: '90px' }}
      px={{ base: '20px', md: '32px', xl: '48px' }}
      pb="40px"
      maxW="1440px"
      mx="auto"
      w="100%"
    >
      <Flex direction="column" w="100%">
        <Text
          color={textColor}
          fontSize={{ base: 'xl', md: '2xl' }}
          fontWeight="700"
          mb={{ base: '24px', md: '32px' }}
        >
          Events
        </Text>

        <Grid
          templateColumns="repeat(auto-fit, minmax(280px, 340px))"
          justifyContent="center"
          gap={{ base: '24px', md: '32px' }}
          w="100%"
        >
          {events.map((event: any) => (
            <NFT
              name={event.name}
              des={event.description}
              key={event.name}
              image="/img/dashboards/opencodeBG.png"
              download={`/user/leaderboard/${encodeURIComponent(event.name)}`}
            />
          ))}
        </Grid>
      </Flex>
    </Box>
  );
}