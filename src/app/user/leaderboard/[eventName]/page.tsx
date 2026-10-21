'use client';

import { useDeferredValue, useMemo, useState, useCallback, useEffect } from 'react';
import {
  Avatar,
  Box,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  SimpleGrid,
  Text,
  chakra,
} from '@chakra-ui/react';
import { ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { FaBuilding, FaCalendarAlt, FaCheck, FaCrown, FaSearchMinus, FaTrophy } from 'react-icons/fa';
import { MdClear } from 'react-icons/md';
import LeaderboardLoader from 'components/common/LeaderboardLoader';
import ColumnsTable, {
  type RowObj,
} from 'views/admin/dataTables/components/ColumnsTable';
import SearchProfileBanner from 'views/admin/profile/components/SearchProfileBanner';
import { FetchedLeaderboard } from '../../../../api/leaderboard/leaderboard';
import { FetchedEvents } from '../../../../api/events/events';

const SERIF = "Georgia, 'Times New Roman', serif";
const CONTROL_H = '44px';

const MEDALS = {
  1: { bg: 'linear-gradient(135deg, #F5C542 0%, #EAB308 100%)', ring: 'rgba(245, 197, 66, 0.6)', ink: '#0C1C2C' },
  2: { bg: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)', ring: 'rgba(148, 163, 184, 0.6)', ink: '#0C1C2C' },
  3: { bg: 'linear-gradient(135deg, #FDBA74 0%, #D97706 100%)', ring: 'rgba(217, 119, 6, 0.6)', ink: '#0C1C2C' },
} as const;

function safeDecode(value: string | undefined): string {
  try {
    return decodeURIComponent(value ?? '');
  } catch {
    return value ?? '';
  }
}

/* Shared look for every control in the toolbar so heights, borders and hover states match. */
const controlStyle = {
  h: CONTROL_H,
  px: '14px',
  bg: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  color: 'var(--text)',
  fontSize: '13px',
  fontWeight: '600',
  boxShadow: 'var(--shadow)',
  transition: 'all 0.2s ease',
  _hover: { borderColor: 'var(--accent)', bg: 'var(--surface-2)' },
  _focusVisible: { outline: '2px solid var(--accent)', outlineOffset: '2px' },
} as const;

export default function EventName() {
  const { eventName } = useParams<{ eventName: string }>();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [firstYearOnly, setFirstYearOnly] = useState(false);
  const [isCollegeHovered, setIsCollegeHovered] = useState(false);
  const [isEventHovered, setIsEventHovered] = useState(false);

  const eventLabel = safeDecode(eventName);
  const isOpencode = eventLabel.toLowerCase().includes('opencode');

  const { data: eventData } = useQuery({
    queryKey: ['EventInfo'],
    queryFn: FetchedEvents,
  });

  const availableEventNames = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];

    const addEvent = (name?: string) => {
      if (!name) return;
      const key = name.trim().toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      list.push(name.trim());
    };

    if (eventLabel) addEvent(eventLabel);
    if (eventData?.data && Array.isArray(eventData.data)) {
      for (const ev of eventData.data) {
        addEvent(ev?.name);
      }
    }
    addEvent('Opencode');

    return list;
  }, [eventData, eventLabel]);

  const handleSelectEvent = useCallback(
    (name: string) => {
      if (name.toLowerCase() === eventLabel.toLowerCase()) return;
      const targetUrl = `/user/leaderboard/${encodeURIComponent(name)}`;
      if (typeof window !== 'undefined' && (window as any).__startPageTransition) {
        (window as any).__startPageTransition(targetUrl);
        return;
      }
      router.push(targetUrl);
    },
    [eventLabel, router],
  );

  useEffect(() => {
    setSelectedCollege('All');
    setFirstYearOnly(false);
    setSearchQuery('');
  }, [eventName]);

  const { data: LeadData, isLoading } = useQuery({
    queryKey: ['LeadInfo', eventName],
    queryFn: () => FetchedLeaderboard(eventName),
    refetchInterval: 10000,
    enabled: !!eventName,
  });

  const tableDataColumns: RowObj[] = useMemo(
    () =>
      (LeadData || []).map((item) => ({
        position: String(item.position),
        name: item.name,
        prmerged: item.prmerged !== undefined && item.prmerged !== null ? Number(item.prmerged) : undefined,
        githubid: item.githubid ?? undefined,
        points: item.points !== undefined && item.points !== null ? Number(item.points) : undefined,
        avatarUrl: item.avatarUrl,
        prDetailsURL: item.prDetailsURL,
        college: item.collegeName ?? '',
        graduationYear: item.graduationYear ?? '',
      })),
    [LeadData],
  );

  const hasPoints = useMemo(() => {
    if (isOpencode) return true;
    return tableDataColumns.some(
      (r) => r.points !== undefined && r.points !== null && !isNaN(Number(r.points))
    );
  }, [isOpencode, tableDataColumns]);

  const collegeOptions = useMemo(() => {
    const colleges = tableDataColumns
      .map((r) => (r.college as string)?.trim())
      .filter(Boolean);
    return [...new Set(colleges)].sort();
  }, [tableDataColumns]);

  const hasActiveFilters =
    selectedCollege !== 'All' || firstYearOnly || !!searchQuery.trim();

  const filteredTableData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const collegeLower = selectedCollege !== 'All' ? selectedCollege.toLowerCase() : null;

    return tableDataColumns.filter((row) => {
      if (collegeLower && (row.college as string)?.trim().toLowerCase() !== collegeLower) {
        return false;
      }
      if (firstYearOnly && String(row.graduationYear ?? '').trim() !== '2029') {
        return false;
      }
      if (q) {
        const matchesUser =
          (isOpencode && row.githubid?.toLowerCase().includes(q)) ||
          row.name?.toLowerCase().includes(q);
        if (!matchesUser) return false;
      }
      return true;
    });
  }, [searchQuery, selectedCollege, firstYearOnly, tableDataColumns, isOpencode]);

  const deferredTableData = useDeferredValue(filteredTableData);
  const isStale = deferredTableData !== filteredTableData;
  const participantCount = filteredTableData.length;
  const totalCount = tableDataColumns.length;

  const topScore = useMemo(
    () =>
      hasPoints
        ? tableDataColumns.reduce((max, r) => Math.max(max, Number(r.points) || 0), 0)
        : null,
    [tableDataColumns, hasPoints],
  );

  // Top 3 overall (not affected by filters) for the spotlight cards
  const topThree = useMemo(
    () =>
      [...tableDataColumns]
        .sort((a, b) => Number(a.position) - Number(b.position))
        .slice(0, 3),
    [tableDataColumns],
  );

  const clearAllFilters = useCallback(() => {
    setSelectedCollege('All');
    setFirstYearOnly(false);
    setSearchQuery('');
  }, []);

  const showSpotlight = !hasActiveFilters && topThree.length === 3;

  // When the spotlight cards are visible, don't repeat those three people in the table below.
  // With any filter active the spotlight is hidden, so the table shows everyone who matches.
  const tableRows = useMemo(() => {
    if (!showSpotlight) return deferredTableData;
    const spotlightIds = new Set(
      topThree.map((r) => r.githubid || `${r.name}-${r.position}`)
    );
    return deferredTableData.filter(
      (r) => !spotlightIds.has(r.githubid || `${r.name}-${r.position}`)
    );
  }, [showSpotlight, deferredTableData, topThree]);

  if (isLoading) {
    return <LeaderboardLoader />;
  }

  const showEmpty = hasActiveFilters && filteredTableData.length === 0;

  return (
    <Flex direction="column" gap="24px" w="100%" maxW="1400px" mx="auto">
      {/* ─── 1. HEADER ─── */}
      <Box
        as="header"
        className="oc-page-heading"
        display="flex"
        flexDirection={{ base: 'column', lg: 'row' }}
        alignItems={{ base: 'flex-start', lg: 'center' }}
        justifyContent="space-between"
        gap={{ base: '20px', md: '28px' }}
        mb="0"
        p={{ base: '22px 20px', sm: '28px 32px', md: '34px 44px' }}
      >
        <Box flex="1" minW="0">
          <p className="oc-eyebrow" style={{ marginBottom: '12px' }}>
            <span />
            {isOpencode ? `${eventLabel} · The Arena of Creators` : `${eventLabel} · Official Standings`}
          </p>
          <h1 style={{ marginBottom: '12px' }}>Leaderboard</h1>
          <p className="oc-description">
            {isOpencode
              ? 'Compete with curiosity. Contribute with purpose. Every step forward earns its place here.'
              : `Official participant standings and verified scores for ${eventLabel}.`}
          </p>
        </Box>

        <Flex
          gap={{ base: '8px', sm: '12px', md: '14px' }}
          wrap="wrap"
          w={{ base: '100%', lg: 'auto' }}
          justify={{ base: 'space-between', sm: 'flex-start', lg: 'flex-end' }}
          flexShrink={0}
        >
          <StatTile label="Participants" value={totalCount.toLocaleString()} />
          <StatTile
            label={hasActiveFilters ? 'Matching' : 'Showing'}
            value={participantCount.toLocaleString()}
          />
          {hasPoints && topScore !== null ? (
            <StatTile label="Top score" value={topScore.toLocaleString()} />
          ) : (
            <StatTile label="Ranked" value={totalCount.toLocaleString()} />
          )}
        </Flex>
      </Box>

      {/* ─── 2. TOOLBAR ─── */}
      {/* position + zIndex keep the college dropdown above the table card below it
          (both cards use backdrop-filter, which creates stacking contexts) */}
      <Flex
        className="glass-panel"
        position="relative"
        zIndex={30}
        p={{ base: '12px', md: '14px 16px' }}
        gap="12px"
        flexWrap="wrap"
        align="center"
      >
        <Box flex="1 1 260px" minW="220px">
          <SearchProfileBanner value={searchQuery} onChange={setSearchQuery} />
        </Box>

        {/* Event selector dropdown */}
        <Box onMouseEnter={() => setIsEventHovered(true)} onFocus={() => setIsEventHovered(true)}>
          <Menu isLazy={!isEventHovered}>
            <MenuButton
              {...controlStyle}
              borderColor="var(--border)"
              position="relative"
              aria-label="Select event"
            >
              <Flex align="center" gap="8px">
                <Box display="flex" color="var(--accent)">
                  <FaTrophy size={14} />
                </Box>
                <Text noOfLines={1} maxW={{ base: '110px', md: '170px' }} fontSize="13px" fontWeight="600">
                  {eventLabel || 'Select Event'}
                </Text>
                <Box display="flex" color="var(--subtle)">
                  <ChevronDown size={14} />
                </Box>
              </Flex>
            </MenuButton>
            <Portal>
              <MenuList
                bg="var(--card-strong)"
                color="var(--text)"
                border="1px solid var(--border)"
                borderRadius="14px"
                boxShadow="var(--shadow)"
                backdropFilter="blur(20px)"
                py="6px"
                maxH="300px"
                overflowY="auto"
                minW="220px"
                zIndex={1500}
                sx={{
                  '&::-webkit-scrollbar': { width: '4px' },
                  '&::-webkit-scrollbar-track': { bg: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { bg: 'var(--border)', borderRadius: 'full' },
                }}
              >
                {availableEventNames.map((name) => {
                  const isSelected = name.toLowerCase() === eventLabel.toLowerCase();
                  return (
                    <MenuItem
                      key={name}
                      onClick={() => handleSelectEvent(name)}
                      bg="transparent"
                      _hover={{ bg: 'var(--accent-soft)' }}
                      _focus={{ bg: 'var(--accent-soft)' }}
                      borderRadius="8px"
                      mx="6px"
                      w="calc(100% - 12px)"
                      px="12px"
                      py="8px"
                      fontSize="13px"
                      fontWeight={isSelected ? '700' : '500'}
                      color={isSelected ? 'var(--accent)' : 'var(--text)'}
                    >
                      <Flex w="100%" justify="space-between" align="center" gap="10px">
                        <Text noOfLines={1}>{name}</Text>
                        {isSelected && <FaCheck size={12} />}
                      </Flex>
                    </MenuItem>
                  );
                })}
              </MenuList>
            </Portal>
          </Menu>
        </Box>

        {/* College filter */}
        <Box onMouseEnter={() => setIsCollegeHovered(true)} onFocus={() => setIsCollegeHovered(true)}>
          <Menu isLazy={!isCollegeHovered}>
            <MenuButton
              {...controlStyle}
              borderColor={selectedCollege !== 'All' ? 'var(--accent)' : 'var(--border)'}
              position="relative"
              aria-label="Filter by college"
            >
              {/* Chakra wraps MenuButton children in ONE span, so the icon/text/chevron
                  need their own flex row or they stack vertically. */}
              <Flex align="center" gap="8px">
                <Box
                  display="flex"
                  color={selectedCollege !== 'All' ? 'var(--accent)' : 'var(--subtle)'}
                >
                  <FaBuilding size={14} />
                </Box>
                <Text noOfLines={1} maxW={{ base: '110px', md: '170px' }} fontSize="13px" fontWeight="600">
                  {selectedCollege === 'All' ? 'All Colleges' : selectedCollege}
                </Text>
                <Box display="flex" color="var(--subtle)">
                  <ChevronDown size={14} />
                </Box>
              </Flex>
              {selectedCollege !== 'All' && (
                <Box
                  position="absolute"
                  top="-4px"
                  right="-4px"
                  w="10px"
                  h="10px"
                  bg="var(--accent)"
                  borderRadius="full"
                  boxShadow="0 0 10px var(--accent)"
                />
              )}
            </MenuButton>
            <Portal>
              <MenuList
                bg="var(--card-strong)"
                color="var(--text)"
                border="1px solid var(--border)"
                borderRadius="14px"
                boxShadow="var(--shadow)"
                backdropFilter="blur(20px)"
                py="6px"
                maxH="300px"
                overflowY="auto"
                minW="220px"
                zIndex={1500}
                sx={{
                  '&::-webkit-scrollbar': { width: '4px' },
                  '&::-webkit-scrollbar-track': { bg: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { bg: 'var(--border)', borderRadius: 'full' },
                }}
              >
                {['All', ...collegeOptions].map((college) => {
                  const selected = selectedCollege === college;
                  return (
                    <MenuItem
                      key={college}
                      onClick={() => setSelectedCollege(college)}
                      bg="transparent"
                      _hover={{ bg: 'var(--accent-soft)' }}
                      _focus={{ bg: 'var(--accent-soft)' }}
                      borderRadius="8px"
                      mx="6px"
                      w="calc(100% - 12px)"
                      px="12px"
                      py="8px"
                      fontSize="13px"
                      fontWeight={selected ? '700' : '500'}
                      color={selected ? 'var(--accent)' : 'var(--text)'}
                    >
                      <Flex w="100%" justify="space-between" align="center" gap="10px">
                        <Text noOfLines={1}>{college === 'All' ? 'All Colleges' : college}</Text>
                        {selected && <FaCheck size={12} />}
                      </Flex>
                    </MenuItem>
                  );
                })}
              </MenuList>
            </Portal>
          </Menu>
        </Box>

        {/* 1st years toggle: real button with switch semantics (keyboard + screen reader friendly) */}
        <chakra.button
          type="button"
          role="switch"
          aria-checked={firstYearOnly}
          aria-label="Show first years only"
          onClick={() => setFirstYearOnly((prev) => !prev)}
          display="flex"
          alignItems="center"
          gap="10px"
          {...controlStyle}
          borderColor={firstYearOnly ? 'var(--accent)' : 'var(--border)'}
        >
          <Box display="flex" color={firstYearOnly ? 'var(--accent)' : 'var(--subtle)'}>
            <FaCalendarAlt size={14} />
          </Box>
          <span>1st Years Only</span>
          <Box
            position="relative"
            w="34px"
            h="20px"
            borderRadius="full"
            bg={firstYearOnly ? 'var(--accent)' : 'var(--accent-soft)'}
            transition="background 0.2s ease"
            flexShrink={0}
          >
            <Box
              position="absolute"
              top="2px"
              left={firstYearOnly ? '16px' : '2px'}
              w="16px"
              h="16px"
              borderRadius="full"
              bg={firstYearOnly ? 'var(--accent-ink)' : 'var(--muted)'}
              transition="left 0.2s ease, background 0.2s ease"
            />
          </Box>
        </chakra.button>

        {hasActiveFilters && (
          <chakra.button
            type="button"
            onClick={clearAllFilters}
            aria-label="Clear all filters"
            display="flex"
            alignItems="center"
            gap="6px"
            h={CONTROL_H}
            px="14px"
            borderRadius="12px"
            bg="var(--accent)"
            color="var(--accent-ink)"
            fontSize="13px"
            fontWeight="700"
            transition="all 0.2s ease"
            _hover={{ bg: 'var(--accent-hover)', transform: 'translateY(-1px)' }}
            _focusVisible={{ outline: '2px solid var(--accent)', outlineOffset: '2px' }}
          >
            <MdClear size={15} />
            Clear
          </chakra.button>
        )}

      </Flex>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <Flex gap="8px" flexWrap="wrap" align="center" mt="-8px">
          <Text fontSize="12px" color="var(--subtle)" mr="4px">
            Showing {participantCount.toLocaleString()} of {totalCount.toLocaleString()}
          </Text>
          {searchQuery.trim() && (
            <FilterChip label={`Search: ${searchQuery.trim()}`} onRemove={() => setSearchQuery('')} />
          )}
          {selectedCollege !== 'All' && (
            <FilterChip label={selectedCollege} onRemove={() => setSelectedCollege('All')} />
          )}
          {firstYearOnly && (
            <FilterChip label="1st years only" onRemove={() => setFirstYearOnly(false)} />
          )}
        </Flex>
      )}

      {/* ─── 3. TOP 3 SPOTLIGHT ─── */}
      {showSpotlight && (
        <Box>
          <Flex align="center" justify="space-between" mb="12px" px="4px">
            <HStack spacing="8px">
              <Box w="6px" h="6px" borderRadius="full" bg="var(--secondary)" />
              <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" textTransform="uppercase" color="var(--secondary)" fontFamily="var(--f-mono)">
                Podium of Honor · Top Standings
              </Text>
            </HStack>
            <Text fontSize="11px" color="var(--subtle)" fontFamily="var(--f-mono)">
              Verified Seasonal Results
            </Text>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: '14px', md: '20px' }} alignItems="end">
            <SpotlightCard row={topThree[0]} rank={1} isOpencode={isOpencode} hasPoints={hasPoints} />
            <SpotlightCard row={topThree[1]} rank={2} isOpencode={isOpencode} hasPoints={hasPoints} />
            <SpotlightCard row={topThree[2]} rank={3} isOpencode={isOpencode} hasPoints={hasPoints} />
          </SimpleGrid>
        </Box>
      )}

      {/* ─── 4. EMPTY STATE ─── */}
      {showEmpty && (
        <Flex
          className="glass-panel"
          direction="column"
          align="center"
          justify="center"
          py="64px"
          px="20px"
          textAlign="center"
        >
          <Box
            p="20px"
            borderRadius="full"
            bg="var(--accent-soft)"
            color="var(--accent)"
            mb="18px"
            boxShadow="0 10px 30px var(--accent-soft)"
          >
            <FaSearchMinus size={32} />
          </Box>
          <Text fontFamily={SERIF} fontSize={{ base: '22px', md: '26px' }} color="var(--text)" mb="6px">
            No contributors found
          </Text>
          <Text fontSize="14px" color="var(--muted)" maxW="380px" lineHeight="1.7">
            We searched the leaderboard thoroughly. Either this legend hasn’t joined yet… or the spelling is
            plotting against you.
          </Text>
          <chakra.button type="button" className="oc-button" onClick={clearAllFilters} mt="20px">
            Clear all filters
          </chakra.button>
        </Flex>
      )}

      {/* ─── 5. TABLE ─── */}
      {!showEmpty && (
        <Box
          position="relative"
          zIndex={1}
          opacity={isStale ? 0.6 : 1}
          transition="opacity 0.2s ease"
          pointerEvents={isStale ? 'none' : 'auto'}
        >
          <ColumnsTable tableData={tableRows} eventName={eventLabel} />
        </Box>
      )}
    </Flex>
  );
}

/* ------------------ Helpers ------------------ */

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Box
      px={{ base: '12px', sm: '16px', md: '20px' }}
      py={{ base: '10px', md: '14px' }}
      borderRadius="14px"
      bg="var(--surface)"
      border="1px solid var(--border)"
      boxShadow="var(--shadow)"
      textAlign="center"
      minW={{ base: '86px', sm: '104px', md: '124px' }}
      flex={{ base: '1', sm: 'initial' }}
    >
      <Text
        fontFamily={SERIF}
        fontSize={{ base: '20px', sm: '24px', md: '28px' }}
        color="var(--text)"
        lineHeight="1"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Text>
      <Text fontSize={{ base: '10.5px', sm: '11.5px', md: '12px' }} color="var(--muted)" mt="4px" fontWeight="500" noOfLines={1}>
        {label}
      </Text>
    </Box>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <HStack
      spacing="4px"
      pl="10px"
      pr="4px"
      py="3px"
      borderRadius="8px"
      bg="var(--surface)"
      border="1px solid var(--border)"
      color="var(--accent)"
      fontSize="12px"
      fontWeight="600"
      boxShadow="var(--shadow)"
    >
      <Text noOfLines={1} maxW="220px">
        {label}
      </Text>
      <chakra.button
        type="button"
        aria-label={`Remove filter ${label}`}
        onClick={onRemove}
        display="flex"
        p="3px"
        borderRadius="4px"
        transition="background 0.2s ease"
        _hover={{ bg: 'var(--surface-2)' }}
        _focusVisible={{ outline: '2px solid var(--accent)' }}
      >
        <MdClear size={13} />
      </chakra.button>
    </HStack>
  );
}

function SpotlightCard({
  row,
  rank,
  isOpencode,
  hasPoints,
}: {
  row: RowObj;
  rank: 1 | 2 | 3;
  isOpencode: boolean;
  hasPoints: boolean;
}) {
  const medal = MEDALS[rank];
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;
  const college = String(row.college ?? '').trim();

  return (
    <Box
      className="glass-panel"
      position="relative"
      textAlign="center"
      overflow="hidden"
      p={{ base: '20px 16px', md: isFirst ? '36px 22px 28px' : '22px 18px' }}
      // 1st place sits in the middle on desktop, but first on mobile
      order={{ base: rank, md: isFirst ? 2 : isSecond ? 1 : 3 }}
      borderTopWidth={isFirst ? '3px' : '2px'}
      borderTopColor={isFirst ? 'var(--secondary)' : isSecond ? 'rgba(148, 163, 184, 0.7)' : 'rgba(217, 119, 6, 0.7)'}
      boxShadow={
        isFirst
          ? `0 0 0 1px ${medal.ring}, 0 20px 50px -15px rgba(245, 197, 66, 0.25)`
          : `0 0 0 1px ${medal.ring}, 0 14px 30px -15px ${medal.ring}`
      }
      transition="all 0.3s ease"
      _hover={{ transform: 'translateY(-4px)' }}
    >
      {/* Top ambient highlight gradient */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        h="60px"
        bg={
          isFirst
            ? 'linear-gradient(180deg, rgba(245, 197, 66, 0.08) 0%, transparent 100%)'
            : isSecond
            ? 'linear-gradient(180deg, rgba(148, 163, 184, 0.06) 0%, transparent 100%)'
            : 'linear-gradient(180deg, rgba(217, 119, 6, 0.06) 0%, transparent 100%)'
        }
        pointerEvents="none"
      />

      {isFirst && (
        <Flex justify="center" align="center" gap="6px" color="var(--secondary)" mb="10px">
          <FaCrown size={22} />
          <Text fontSize="10px" fontWeight="900" letterSpacing="0.12em" textTransform="uppercase" fontFamily="var(--f-mono)">
            Champion
          </Text>
        </Flex>
      )}

      <Box position="relative" display="inline-block" mt={isFirst ? '0' : '6px'}>
        <Avatar
          src={row.avatarUrl as string}
          name={row.name}
          size={isFirst ? 'xl' : 'lg'}
          border="3px solid"
          borderColor={medal.ring}
          boxShadow={isFirst ? '0 0 20px rgba(245, 197, 66, 0.35)' : 'none'}
        />
        <Box
          position="absolute"
          bottom="-6px"
          left="50%"
          transform="translateX(-50%)"
          px="10px"
          py="1.5px"
          borderRadius="full"
          fontSize="11px"
          fontWeight="900"
          bg={medal.bg}
          color={medal.ink}
          boxShadow="0 2px 8px rgba(0,0,0,0.25)"
        >
          #{rank}
        </Box>
      </Box>

      <Text
        fontFamily={SERIF}
        fontSize={{ base: '19px', md: isFirst ? '24px' : '19px' }}
        fontWeight={isFirst ? '700' : '600'}
        color="var(--text)"
        noOfLines={1}
        mt="16px"
      >
        {row.name}
      </Text>
      {isOpencode && row.githubid ? (
        <Text fontSize="12px" color="var(--subtle)" noOfLines={1}>
          @{row.githubid}
        </Text>
      ) : null}
      {college && (
        <Text fontSize="11.5px" color="var(--muted)" noOfLines={1} mt="2px">
          {college}
        </Text>
      )}

      {hasPoints && row.points !== undefined && row.points !== null ? (
        <>
          <Text
            fontFamily={SERIF}
            fontSize={{ base: '30px', md: isFirst ? '44px' : '32px' }}
            fontWeight={isFirst ? '800' : '600'}
            color={isFirst ? 'var(--secondary)' : 'var(--text)'}
            lineHeight="1.1"
            mt="14px"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {Number(row.points).toLocaleString()}{' '}
            <Text as="span" fontFamily="'DM Sans', sans-serif" fontSize="12px" color="var(--muted)">
              {isOpencode ? 'pts' : 'points'}
            </Text>
          </Text>
          <Text fontSize="12px" color="var(--muted)" mt="2px">
            {isOpencode && row.prmerged !== undefined
              ? `${Number(row.prmerged).toLocaleString()} PRs merged`
              : 'Official Standing'}
          </Text>
        </>
      ) : (
        <Box mt="14px">
          <Text
            fontFamily="var(--f-mono), monospace"
            fontSize="14px"
            fontWeight="700"
            color="var(--accent)"
            textTransform="uppercase"
            letterSpacing="0.08em"
          >
            Rank #{rank}
          </Text>
          <Text fontSize="12px" color="var(--muted)" mt="2px">
            Official Standing
          </Text>
        </Box>
      )}
    </Box>
  );
}