'use client';

import { useMemo, useState } from 'react';
import { FaSearchMinus } from 'react-icons/fa';

import {
  Box,
  Flex,
  Text,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { FaUsers } from 'react-icons/fa';
import { Building2, CalendarDays, X } from 'lucide-react';

import LeaderboardLoader from 'components/common/LeaderboardLoader';
import ColumnsTable, {
  type RowObj,
} from 'views/admin/dataTables/components/ColumnsTable';
import SearchProfileBanner from 'views/admin/profile/components/SearchProfileBanner';
import { FetchedLeaderboard } from '../../../../api/leaderboard/leaderboard';

export default function EventName() {
  const { eventName } = useParams<{ eventName: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  const textColor = useColorModeValue('gray.800', 'white');
  const mutedText = useColorModeValue('gray.500', 'gray.400');
  const glassBg = useColorModeValue(
    'rgba(255,255,255,0.7)',
    'rgba(15,23,42,0.7)',
  );
  const filterBorder = useColorModeValue('whiteAlpha.700', 'whiteAlpha.200');

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
    college: item.college ?? '',
    graduationYear: item.graduationYear ?? '',
  }));

  // Extract unique filter options from the data
  const collegeOptions = useMemo(() => {
    const colleges = tableDataColumns
      .map((r) => (r.college as string)?.trim())
      .filter(Boolean);
    return [...new Set(colleges)].sort();
  }, [tableDataColumns]);

  const yearOptions = useMemo(() => {
    const years = tableDataColumns
      .map((r) => String(r.graduationYear ?? '').trim())
      .filter(Boolean);
    return [...new Set(years)].sort();
  }, [tableDataColumns]);

  const hasActiveFilters = selectedCollege !== 'All' || selectedYear !== 'All';

  const filteredTableData = useMemo(() => {
    let data = tableDataColumns;
    if (selectedCollege !== 'All') {
      data = data.filter(
        (row) =>
          (row.college as string)?.trim().toLowerCase() ===
          selectedCollege.toLowerCase(),
      );
    }
    if (selectedYear !== 'All') {
      data = data.filter(
        (row) => String(row.graduationYear ?? '').trim() === selectedYear,
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (row) =>
          row.githubid?.toLowerCase().includes(q) ||
          row.name?.toLowerCase().includes(q),
      );
    }
    return data;
  }, [searchQuery, selectedCollege, selectedYear, tableDataColumns]);

  const participantCount = filteredTableData.length;

  const clearAllFilters = () => {
    setSelectedCollege('All');
    setSelectedYear('All');
    setSearchQuery('');
  };

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
          flexWrap="wrap"
        >
          <Flex
            align="center"
            gap={{ base: '8px', md: '12px' }}
            flexWrap="wrap"
            flex="1"
          >
            <SearchProfileBanner
              value={searchQuery}
              onChange={setSearchQuery}
            />

            {/* College Filter */}
            <Flex
              align="center"
              gap="8px"
              px={{ base: '10px', md: '14px' }}
              py={{ base: '8px', md: '10px' }}
              bg={glassBg}
              borderRadius="16px"
              border="1px solid"
              borderColor={selectedCollege !== 'All' ? 'purple.400' : filterBorder}
              backdropFilter="blur(16px)"
              boxShadow="0 10px 30px rgba(0,0,0,0.08)"
              transition="all 0.2s ease"
              position="relative"
              _focusWithin={{
                borderColor: 'purple.600',
              }}
            >
              <Box
                color={selectedCollege !== 'All' ? 'purple.500' : 'gray.400'}
                display="flex"
                alignItems="center"
                transition="color 0.2s ease"
              >
                <Building2 size={16} />
              </Box>
              <Select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                variant="unstyled"
                fontSize="13px"
                fontWeight="600"
                color={textColor}
                cursor="pointer"
                minW={{ base: '100px', md: '140px' }}
                sx={{
                  '> option': {
                    bg: 'gray.800',
                    color: 'white',
                  },
                }}
              >
                <option value="All">All Colleges</option>
                {collegeOptions.map((college) => (
                  <option key={college} value={college}>
                    {college}
                  </option>
                ))}
              </Select>
              {selectedCollege !== 'All' && (
                <Box
                  position="absolute"
                  top="-4px"
                  right="-4px"
                  w="10px"
                  h="10px"
                  bg="purple.500"
                  borderRadius="full"
                  boxShadow="0 0 6px rgba(128,90,213,0.6)"
                />
              )}
            </Flex>

            <Flex
              align="center"
              gap="8px"
              px={{ base: '10px', md: '14px' }}
              py={{ base: '8px', md: '10px' }}
              bg={glassBg}
              borderRadius="16px"
              border="1px solid"
              borderColor={selectedYear !== 'All' ? 'purple.400' : filterBorder}
              backdropFilter="blur(16px)"
              boxShadow="0 10px 30px rgba(0,0,0,0.08)"
              transition="all 0.2s ease"
              position="relative"
              _focusWithin={{
                borderColor: 'purple.600',
              }}
            >
              <Box
                color={selectedYear !== 'All' ? 'purple.500' : 'gray.400'}
                display="flex"
                alignItems="center"
                transition="color 0.2s ease"
              >
                <CalendarDays size={16} />
              </Box>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                variant="unstyled"
                fontSize="13px"
                fontWeight="600"
                color={textColor}
                cursor="pointer"
                minW={{ base: '80px', md: '120px' }}
                sx={{
                  '> option': {
                    bg: 'gray.800',
                    color: 'white',
                  },
                }}
              >
                <option value="All">All Years</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
              {selectedYear !== 'All' && (
                <Box
                  position="absolute"
                  top="-4px"
                  right="-4px"
                  w="10px"
                  h="10px"
                  bg="purple.500"
                  borderRadius="full"
                  boxShadow="0 0 6px rgba(128,90,213,0.6)"
                />
              )}
            </Flex>

            {hasActiveFilters && (
              <Flex
                align="center"
                gap="4px"
                px="10px"
                py="6px"
                borderRadius="full"
                bg="purple.500"
                color="white"
                fontSize="12px"
                fontWeight="700"
                cursor="pointer"
                transition="all 0.2s ease"
                _hover={{
                  bg: 'purple.600',
                  transform: 'scale(1.05)',
                }}
                onClick={clearAllFilters}
              >
                <X size={12} />
                Clear
              </Flex>
            )}
          </Flex>

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
                {hasActiveFilters ? 'FILTERED' : 'TOTAL'}
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
      {(searchQuery || hasActiveFilters) && filteredTableData.length === 0 && (
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
            onClick={clearAllFilters}
          >
            Clear all filters & show all participants
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

