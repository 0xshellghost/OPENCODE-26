'use client';

import { useMemo, useState } from 'react';
import { FaSearchMinus } from 'react-icons/fa';

import {
  Box,
  Flex,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { FaUsers } from 'react-icons/fa';

import LeaderboardLoader from 'components/common/LeaderboardLoader';
import ColumnsTable, {
  type RowObj,
} from 'views/admin/dataTables/components/ColumnsTable';
import SearchProfileBanner from 'views/admin/profile/components/SearchProfileBanner';
import { FetchedLeaderboard } from '../../../../api/leaderboard/leaderboard';

export default function EventName() {
  const { eventName } = useParams<{ eventName: string }>();
  const [searchQuery, setSearchQuery] = useState('');

  const textColor = useColorModeValue('gray.800', 'white');
  const mutedText = useColorModeValue('gray.500', 'gray.400');
  const glassBg = useColorModeValue(
    'rgba(255,255,255,0.7)',
    'rgba(15,23,42,0.7)',
  );

  const { data: LeadData, isLoading } = useQuery({
    queryKey: ['LeadInfo', eventName],
    queryFn: () => FetchedLeaderboard(eventName),
    refetchInterval: 10000,
    enabled: !!eventName,
  });

  const tableDataColumns: RowObj[] = (LeadData || []).map((item) => ({
    position: String(item.position),
    name: item.name,
    prmerged: Number(item.prmerged),
    githubid: item.githubid,
    points: Number(item.points),
    avatarUrl: item.avatarUrl,
    prDetailsURL: item.prDetailsURL,
  }));
  console.log('Leaderboard Data:', tableDataColumns.slice(0,11));


  const participantCount = tableDataColumns.length;

  const filteredTableData = useMemo(() => {
    if (!searchQuery.trim()) return tableDataColumns;

    const q = searchQuery.toLowerCase();
    return tableDataColumns.filter(
      (row) =>
        row.githubid?.toLowerCase().includes(q) ||
        row.name?.toLowerCase().includes(q),
    );
  }, [searchQuery, tableDataColumns]);

  if (isLoading) {
    return <LeaderboardLoader />;
  }

  return (
    <Box
      pt={{ base: '110px', md: '90px' }}
      px={{ base: '16px', md: '32px' }}
      maxW="1400px"
      mx="auto"
    >
      <Flex
        direction="column"
        gap={{ base: '18px', md: '24px' }}
        mb={{ base: '20px', md: '28px' }}
      >

        <Box position="relative" w="fit-content">
          <Text
            fontSize={{ base: '30px', sm: '36px', md: '44px' }}
            fontWeight="900"
            letterSpacing="-1.4px"
            color={textColor}
            lineHeight="1"
          >
            OPENCODE
          </Text>

          <Flex
            position="absolute"
            right="0"
            bottom={{ base: '-4px', md: '-6px' }}
            align="center"
            gap="6px"
          >
            <Box
              w={{ base: '22px', md: '28px' }}
              h="3px"
              bg="purple.500"
              borderRadius="full"
            />
            <Box w="6px" h="6px" bg="purple.500" borderRadius="full" />
          </Flex>
        </Box>


        <Flex
          w="100%"
          align="center"
          justify="space-between"
          gap="12px"
        >
          <SearchProfileBanner
            value={searchQuery}
            onChange={setSearchQuery}
          />

          <Flex
            align="center"
            gap={{ base: '6px', md: '12px' }}
            px={{ base: '10px', md: '18px' }}
            py={{ base: '8px', md: '12px' }}
            bg={glassBg}
            borderRadius="16px"
            backdropFilter="blur(16px)"
            boxShadow="0 10px 30px rgba(0,0,0,0.08)"
            minW={{ base: 'auto', md: '180px' }}
            justify="center"
          >
            <Box
              p={{ base: '6px', md: '10px' }}
              borderRadius="full"
              bg="purple.100"
              color="purple.600"
              fontSize={{ base: '12px', md: '14px' }}
            >
              <FaUsers />
            </Box>


            <Box display={{ base: 'none', md: 'block' }}>
              <Text
                fontSize="11px"
                color={mutedText}
                fontWeight="600"
                letterSpacing="0.6px"
              >
                TOTAL
              </Text>
            </Box>

            <Text
              fontSize={{ base: '14px', md: '22px' }}
              fontWeight="800"
              color={textColor}
            >
              {participantCount}
            </Text>
          </Flex>

        </Flex>
      </Flex>
      {searchQuery && filteredTableData.length === 0 && (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py="80px"
          px="20px"
          textAlign="center"
        >
          {/* Icon */}
          <Box
            p="22px"
            borderRadius="full"
            bg="purple.100"
            color="purple.500"
            mb="18px"
            boxShadow="0 10px 30px rgba(117,95,255,0.25)"
          >
            <FaSearchMinus size={36} />
          </Box>


          <Text
            fontSize={{ base: '18px', md: '22px' }}
            fontWeight="800"
            color={textColor}
            mb="6px"
          >
            No contributors found
          </Text>


          <Text
            fontSize="14px"
            color={mutedText}
            maxW="360px"
            lineHeight="1.6"
          >
            We searched the leaderboard thoroughly.
            Either this legend hasn’t joined yet… or the spelling is plotting against you.
          </Text>


          <Text
            mt="14px"
            fontSize="13px"
            color="purple.500"
            fontWeight="600"
            cursor="pointer"
            _hover={{ textDecoration: 'underline' }}
            onClick={() => setSearchQuery('')}
          >
            Clear search & show all participants
          </Text>
        </Flex>
      )}



      <ColumnsTable
        tableData={filteredTableData}
        eventName={decodeURIComponent(eventName ?? '')}
      />
    </Box>
  );
}

