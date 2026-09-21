'use client';


import { useDeferredValue, useMemo, useState } from 'react';
import { FaSearchMinus } from 'react-icons/fa';

import {
  Box,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Switch,
} from '@chakra-ui/react';
import { opencodeTokens } from '../../../../theme/opencode-tokens';
import { ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { FaUsers, FaCheck, FaBuilding, FaCalendarAlt, FaSearch, FaFilter } from "react-icons/fa";
import { MdClear } from 'react-icons/md'
import LeaderboardLoader from 'components/common/LeaderboardLoader';
import PageHeading from 'components/japanese/PageHeading';
import ColumnsTable, {
  type RowObj,
} from 'views/admin/dataTables/components/ColumnsTable';
import SearchProfileBanner from 'views/admin/profile/components/SearchProfileBanner';
import { FetchedLeaderboard } from '../../../../api/leaderboard/leaderboard';

export default function EventName() {
  const { eventName } = useParams<{ eventName: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [firstYearOnly, setFirstYearOnly] = useState(false);
  const [isCollegeHovered, setIsCollegeHovered] = useState(false);

  const textColor = opencodeTokens.colors.text.primary;
  const mutedText = opencodeTokens.colors.text.secondary;
  const glassBg = opencodeTokens.colors.background.glassDark;
  const filterBorder = opencodeTokens.colors.border.light;
  const menuBg = opencodeTokens.colors.background.glassDark;
  const menuHover = opencodeTokens.colors.background.glassLight;
  const menuBorder = opencodeTokens.colors.border.light;

  const { data: LeadData, isLoading } = useQuery({
    queryKey: ['LeadInfo', eventName],
    queryFn: () => FetchedLeaderboard(eventName),
    refetchInterval: 10000,
    enabled: !!eventName,
  });

  const tableDataColumns: RowObj[] = useMemo(() => (LeadData || []).map((item) => ({
    position: String(item.position),
    name: item.name,
    prmerged: Number(item.prmerged),
    githubid: item.githubid,
    points: Number(item.points),
    avatarUrl: item.avatarUrl,
    prDetailsURL: item.prDetailsURL,
    college: item.collegeName ?? '',
    graduationYear: item.graduationYear ?? '',
  })), [LeadData]);

  // Extract unique filter options from the data
  const collegeOptions = useMemo(() => {
    const colleges = tableDataColumns
      .map((r) => (r.college as string)?.trim())
      .filter(Boolean);
    return [...new Set(colleges)].sort();
  }, [tableDataColumns]);

  const hasActiveFilters =
    selectedCollege !== 'All' || firstYearOnly || !!searchQuery.trim();

  const filteredTableData = useMemo(() => {
    let data = tableDataColumns;
    if (selectedCollege !== 'All') {
      data = data.filter(
        (row) =>
          (row.college as string)?.trim().toLowerCase() ===
          selectedCollege.toLowerCase(),
      );
    }
    if (firstYearOnly) {
      data = data.filter(
        (row) => String(row.graduationYear ?? '').trim() === '2029',
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
  }, [searchQuery, selectedCollege, firstYearOnly, tableDataColumns]);

  const participantCount = filteredTableData.length;

  const clearAllFilters = () => {
    setSelectedCollege('All');
    setFirstYearOnly(false);
    setSearchQuery('');
  };

  if (isLoading) {
    return <LeaderboardLoader />;
  }

  return (
    <Box
      pt="0"
      px="0"
      maxW="1400px"
      mx="auto"
    >
      <Flex
        direction="column"
        gap={{ base: '18px', md: '24px' }}
        mb={{ base: '20px', md: '28px' }}
      >

        <PageHeading eyebrow={`${decodeURIComponent(eventName)} · THE ARENA OF CREATORS`} title="Leaderboard" description="Compete with curiosity. Contribute with purpose. Every step forward earns its place here." />


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

            <Box
              onMouseEnter={() => setIsCollegeHovered(true)}
              onFocus={() => setIsCollegeHovered(true)}
            >
              <Menu isLazy={!isCollegeHovered}>
                <MenuButton
                  display="flex"
                  alignItems="center"
                  gap="8px"
                  px={{ base: '10px', md: '14px' }}
                  py={{ base: '8px', md: '10px' }}
                  bg={glassBg}
                  borderRadius="16px"
                  border="1px solid"
                  borderColor={selectedCollege !== 'All' ? opencodeTokens.colors.accent.sakura : filterBorder}
                  backdropFilter="blur(20px)"
                  boxShadow={opencodeTokens.shadows.glass}
                  transition="all 0.3s ease"
                  position="relative"
                  cursor="pointer"
                  _hover={{ borderColor: opencodeTokens.colors.accent.sakura }}
                >
                  <Box
                    color={selectedCollege !== 'All' ? opencodeTokens.colors.accent.sakura : opencodeTokens.colors.text.secondary}
                    display="flex"
                    alignItems="center"
                    transition="color 0.2s ease"
                  >
                    <FaBuilding size={16} />
                  </Box>
                  <Text
                    fontSize="13px"
                    fontWeight="600"
                    color={textColor}
                    noOfLines={1}
                    maxW={{ base: '100px', md: '140px' }}
                  >
                    {selectedCollege === 'All' ? 'All Colleges' : selectedCollege}
                  </Text>
                  <Box color={opencodeTokens.colors.text.secondary} display="flex" alignItems="center">
                    <ChevronDown size={14} />
                  </Box>
                  {selectedCollege !== 'All' && (
                    <Box
                      position="absolute"
                      top="-4px"
                      right="-4px"
                      w="10px"
                      h="10px"
                      bg={opencodeTokens.colors.accent.sakura}
                      borderRadius="full"
                      boxShadow={`0 0 10px ${opencodeTokens.colors.accent.sakura}`}
                    />
                  )}
                </MenuButton>
                <MenuList
                  bg={menuBg}
                  border="1px solid"
                  borderColor={menuBorder}
                  borderRadius="14px"
                  boxShadow={opencodeTokens.shadows.glass}
                  backdropFilter="blur(20px)"
                  py="6px"
                  maxH="280px"
                  overflowY="auto"
                  minW="200px"
                  zIndex={20}
                  sx={{
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-track': { bg: 'transparent' },
                    '&::-webkit-scrollbar-thumb': {
                      bg: opencodeTokens.colors.border.medium,
                      borderRadius: 'full',
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => setSelectedCollege('All')}
                    bg="transparent"
                    _hover={{ bg: menuHover }}
                    borderRadius="8px"
                    mx="6px"
                    px="12px"
                    py="8px"
                    fontSize="13px"
                    fontWeight={selectedCollege === 'All' ? '700' : '500'}
                    color={selectedCollege === 'All' ? opencodeTokens.colors.accent.sakura : textColor}
                    icon={selectedCollege === 'All' ? <FaCheck size={14} /> : undefined}
                  >
                    All Colleges
                  </MenuItem>
                  {collegeOptions.map((college) => (
                    <MenuItem
                      key={college}
                      onClick={() => setSelectedCollege(college)}
                      bg="transparent"
                      _hover={{ bg: menuHover }}
                      borderRadius="8px"
                      mx="6px"
                      px="12px"
                      py="8px"
                      fontSize="13px"
                      fontWeight={selectedCollege === college ? '700' : '500'}
                      color={selectedCollege === college ? opencodeTokens.colors.accent.sakura : textColor}
                      icon={selectedCollege === college ? <FaCheck size={14} /> : undefined}
                    >
                      {college}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Box>

            <Flex
              align="center"
              gap="10px"
              px={{ base: '12px', md: '16px' }}
              py={{ base: '8px', md: '10px' }}
              bg={glassBg}
              borderRadius="16px"
              border="1px solid"
              borderColor={firstYearOnly ? opencodeTokens.colors.accent.sakura : filterBorder}
              backdropFilter="blur(20px)"
              boxShadow={opencodeTokens.shadows.glass}
              transition="all 0.3s ease"
              cursor="pointer"
              onClick={() => setFirstYearOnly((prev) => !prev)}
              _hover={{ borderColor: opencodeTokens.colors.accent.sakura }}
            >
              <Box color={firstYearOnly ? opencodeTokens.colors.accent.sakura : opencodeTokens.colors.text.secondary} display="flex">
                <FaCalendarAlt size={16} />
              </Box>
              <Text fontSize="13px" fontWeight="600" color={textColor}>
                1st Years Only
              </Text>
              <Switch
                isChecked={firstYearOnly}
                isReadOnly
                pointerEvents="none"
                tabIndex={-1}
                colorScheme="pink"
                size="sm"
              />
            </Flex>

            {hasActiveFilters && (
              <Flex
                align="center"
                gap="4px"
                px="10px"
                py="6px"
                borderRadius="full"
                bg={opencodeTokens.colors.accent.sakura}
                color={opencodeTokens.colors.background.base}
                fontSize="12px"
                fontWeight="700"
                cursor="pointer"
                transition="all 0.3s ease"
                _hover={{
                  bg: opencodeTokens.colors.accent.sakuraHover,
                  transform: 'scale(1.05)',
                  boxShadow: `0 0 10px ${opencodeTokens.colors.accent.sakura}`
                }}
                onClick={clearAllFilters}
              >
                <MdClear size={12} />
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
            border={`1px solid ${filterBorder}`}
            borderRadius="16px"
            backdropFilter="blur(20px)"
            boxShadow={opencodeTokens.shadows.glass}
            minW={{ base: 'auto', md: '180px' }}
            justify="center"
          >
            <Box
              p={{ base: '6px', md: '10px' }}
              borderRadius="full"
              bg={opencodeTokens.colors.background.glassLight}
              color={opencodeTokens.colors.accent.sakura}
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
            bg={opencodeTokens.colors.background.glassLight}
            color={opencodeTokens.colors.accent.sakura}
            mb="18px"
            boxShadow={`0 10px 30px ${opencodeTokens.colors.accent.sakura}40`}
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
            color={opencodeTokens.colors.accent.sakura}
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

