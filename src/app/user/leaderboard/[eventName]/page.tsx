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
  useColorMode,
} from '@chakra-ui/react';
import {
  Building2,
  Calendar,
  Check,
  ChevronDown,
  Crown,
  SearchX,
  Trophy,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import LeaderboardLoader from 'components/common/LeaderboardLoader';
import ColumnsTable, {
  type RowObj,
} from 'views/admin/dataTables/components/ColumnsTable';
import SearchProfileBanner from 'views/admin/profile/components/SearchProfileBanner';
import DecryptedText from 'components/reactbits/DecryptedText';
import PageHeading from 'components/japanese/PageHeading';
import ContributorAvatar from 'components/common/ContributorAvatar';
import { isMaintainer } from 'constants/Maintainers';
import { FetchedLeaderboard } from '../../../../api/leaderboard/leaderboard';
import { FetchedEvents } from '../../../../api/events/events';

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
  px: { base: '10px', sm: '14px' },
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

  const tableDataColumns: RowObj[] = useMemo(() => {
    const rawList = LeadData || [];
    const eligibleList = isOpencode
      ? rawList.filter((item) => !item.isMentor && (!item.githubid || !isMaintainer(item.githubid)))
      : rawList;

    return eligibleList.map((item, index) => ({
      position: isOpencode ? String(index + 1) : String(item.position ?? index + 1),
      name: item.name,
      prmerged: item.prmerged !== undefined && item.prmerged !== null ? Number(item.prmerged) : undefined,
      githubid: item.githubid ?? undefined,
      points: item.points !== undefined && item.points !== null ? Number(item.points) : undefined,
      avatarUrl: item.githubid ? `https://github.com/${item.githubid}.png` : item.avatarUrl,
      prDetailsURL: item.prDetailsURL,
      college: item.collegeName ?? '',
      graduationYear: item.graduationYear ?? '',
    }));
  }, [LeadData, isOpencode]);

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
      {/* ─── 1. PAGE HEADER ─── */}
      <PageHeading
        title={`${eventLabel || 'Opencode'} Standings`}
        description="Official rankings and live contribution metrics. Track merged pull requests, total points earned, and community progress across all participants."
        asideColor="var(--secondary)"
        hideBorder
      >
        順位表
      </PageHeading>

      {/* ─── 2. TOOLBAR ─── */}
      <Flex
        position="relative"
        zIndex={30}
        gap="12px"
        flexDirection={{ base: 'column', md: 'row' }}
        align={{ base: 'stretch', md: 'center' }}
        justify="space-between"
      >
        <Box flex={{ base: '1', md: '1 1 260px' }} minW={{ base: '100%', sm: '220px' }}>
          <SearchProfileBanner value={searchQuery} onChange={setSearchQuery} w="100%" />
        </Box>

        <Flex gap="10px" align="center" flexWrap="wrap" justify={{ base: 'flex-start', md: 'flex-end' }}>
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
                  <Trophy size={14} />
                </Box>
                <Text noOfLines={1} maxW={{ base: '110px', md: '170px' }} fontSize="13px" fontWeight="600">
                  <DecryptedText
                    text={eventLabel || 'Select Event'}
                    animateOn="view"
                    speed={35}
                    maxIterations={10}
                  />
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
                        {isSelected && <Check size={12} />}
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
                  <Building2 size={14} />
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
                        {selected && <Check size={12} />}
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
            <Calendar size={14} />
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
            <X size={15} />
            Clear
          </chakra.button>
        )}
        </Flex>

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
          <Text
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.16em"
            textTransform="uppercase"
            color="var(--muted)"
            fontFamily="var(--f-mono)"
            mb="16px"
            px="4px"
          >
            TOP STANDINGS
          </Text>

          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            spacing={{ base: '16px', md: '20px' }}
            alignItems={{ base: 'stretch', md: 'flex-end' }}
          >
            <SpotlightCard row={topThree[1]} rank={2} isOpencode={isOpencode} hasPoints={hasPoints} />
            <SpotlightCard row={topThree[0]} rank={1} isOpencode={isOpencode} hasPoints={hasPoints} />
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
            <SearchX size={32} />
          </Box>
          <Text fontFamily="var(--f-display)" fontSize={{ base: '22px', md: '26px' }} color="var(--text)" mb="6px">
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
        <X size={13} />
      </chakra.button>
    </HStack>
  );
}



function SpotlightCard({
  row,
  rank,
  isOpencode,
  hasPoints: hasPointsProp,
}: {
  row: RowObj;
  rank: 1 | 2 | 3;
  isOpencode: boolean;
  hasPoints?: boolean;
}) {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;
  const college = String(row.college ?? '').trim();
  const { colorMode } = useColorMode();
  const isLight = colorMode === 'light';

  // Distinct circle backgrounds matching the design:
  // Champion #1: Maroon / Deep Coral circle (#853D3D)
  // Runner-up #2: Teal / Slate circle (#2A5A68)
  // Third place #3: Terracotta / Orange circle (#BD5319)
  const avatarBg = isFirst ? '#853D3D' : isSecond ? '#2A5A68' : '#BD5319';

  // Stepped heights: 1st (430px) > 2nd (380px) > 3rd (340px)
  const cardHeight = isFirst
    ? { base: 'auto', md: '430px' }
    : isSecond
    ? { base: 'auto', md: '380px' }
    : { base: 'auto', md: '340px' };

  const cardMinHeight = isFirst
    ? { base: '320px', md: '430px' }
    : isSecond
    ? { base: '290px', md: '380px' }
    : { base: '270px', md: '340px' };

  // Substantially larger avatar sizes to fill empty space heroically
  const avatarSize = isFirst ? '96px' : isSecond ? '82px' : '72px';
  const avatarFontSize = isFirst ? '26px' : isSecond ? '22px' : '19px';

  const cardContent = (
    <Box
      position="relative"
      textAlign="center"
      borderRadius="24px"
      bg="var(--surface)"
      backdropFilter="blur(20px)"
      border={isFirst ? '1.5px solid var(--secondary)' : '1px solid var(--border)'}
      boxShadow={
        isFirst
          ? '0 16px 40px -10px rgba(0, 0, 0, 0.7), 0 0 28px -4px rgba(245, 197, 66, 0.3)'
          : 'var(--shadow)'
      }
      pt={{ base: '26px', md: isFirst ? '34px' : isSecond ? '28px' : '24px' }}
      pb={{ base: '24px', md: isFirst ? '32px' : isSecond ? '26px' : '22px' }}
      px={{ base: '18px', md: '24px' }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="space-between"
      h={cardHeight}
      minH={cardMinHeight}
      w="100%"
      transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      _hover={{
        transform: 'translateY(-4px)',
        borderColor: isFirst ? 'var(--secondary)' : 'var(--accent)',
        boxShadow: isFirst
          ? '0 20px 48px -8px rgba(245, 197, 66, 0.4)'
          : 'var(--shadow), 0 0 20px var(--accent-soft)',
      }}
      cursor={row.githubid ? 'pointer' : 'default'}
    >
      {/* Top section: Rank Badge, Large Avatar, Name, Handle, College */}
      <Flex direction="column" align="center" w="100%">
        {/* Rank Header Badge */}
        {isFirst ? (
          <Box
            px="12px"
            py="3px"
            borderRadius="full"
            bg="var(--secondary-soft)"
            border="1px solid var(--secondary-border)"
            mb="16px"
          >
            <Text
              fontSize="12.5px"
              fontWeight="700"
              fontFamily="var(--f-mono)"
              color="var(--secondary)"
              letterSpacing="0.06em"
            >
              Champion · #1
            </Text>
          </Box>
        ) : isSecond ? (
          <Box
            px="11px"
            py="2.5px"
            borderRadius="full"
            bg={isLight ? 'rgba(3, 105, 161, 0.1)' : 'rgba(148, 163, 184, 0.1)'}
            border={isLight ? '1px solid rgba(3, 105, 161, 0.3)' : '1px solid rgba(148, 163, 184, 0.25)'}
            mb="14px"
          >
            <Text
              fontSize="12px"
              fontWeight="600"
              fontFamily="var(--f-mono)"
              color={isLight ? '#0369A1' : '#BAE6FD'}
              letterSpacing="0.05em"
            >
              Runner-up · #2
            </Text>
          </Box>
        ) : (
          <Box
            px="11px"
            py="2.5px"
            borderRadius="full"
            bg={isLight ? 'rgba(194, 65, 12, 0.1)' : 'rgba(217, 119, 6, 0.1)'}
            border={isLight ? '1px solid rgba(194, 65, 12, 0.3)' : '1px solid rgba(217, 119, 6, 0.25)'}
            mb="12px"
          >
            <Text
              fontSize="12px"
              fontWeight="600"
              fontFamily="var(--f-mono)"
              color={isLight ? '#C2410C' : '#FDBA74'}
              letterSpacing="0.05em"
            >
              Third place · #3
            </Text>
          </Box>
        )}

        {/* Heroic Avatar Circle with GitHub profile image & clean initials fallback */}
        <ContributorAvatar
          name={row.name}
          githubid={row.githubid}
          avatarUrl={row.avatarUrl}
          size={avatarSize}
          fontSize={avatarFontSize}
          bg={avatarBg}
          boxShadow={
            isFirst
              ? '0 8px 24px rgba(245, 197, 66, 0.25), 0 4px 12px rgba(0,0,0,0.4)'
              : '0 6px 18px rgba(0,0,0,0.3)'
          }
          border={
            isFirst
              ? '2px solid var(--secondary)'
              : isSecond
              ? isLight
                ? '1.5px solid rgba(3, 105, 161, 0.4)'
                : '1.5px solid rgba(186, 230, 253, 0.35)'
              : isLight
              ? '1.5px solid rgba(194, 65, 12, 0.4)'
              : '1.5px solid rgba(253, 186, 116, 0.35)'
          }
          mb={isFirst ? '16px' : isSecond ? '14px' : '12px'}
        />

        {/* Contributor Name - scaled up to command presence */}
        <Text
          fontFamily="var(--f-display)"
          fontSize={{
            base: '22px',
            md: isFirst ? '28px' : isSecond ? '24px' : '22px',
            lg: isFirst ? '30px' : isSecond ? '26px' : '24px',
          }}
          fontWeight={isFirst ? '700' : '600'}
          color="var(--fg)"
          lineHeight="1.2"
          noOfLines={1}
          mb="4px"
        >
          {row.name}
        </Text>

        {/* Github Handle */}
        {row.githubid && (
          <Text
            fontSize={isFirst ? '14px' : '13px'}
            color="var(--accent)"
            fontWeight={isFirst ? '600' : '500'}
            noOfLines={1}
            mb="4px"
          >
            @{row.githubid}
          </Text>
        )}

        {/* College Name */}
        {college && (
          <Text
            fontSize={isFirst ? '13px' : isSecond ? '12.5px' : '12px'}
            color="var(--muted)"
            noOfLines={2}
            maxW="260px"
            lineHeight="1.35"
          >
            {college}
          </Text>
        )}
      </Flex>

      {/* Bottom section: Bold Points and Merged PRs */}
      <Box w="100%" mt={isThird ? '10px' : '14px'}>
        <Flex align="baseline" justify="center" gap="6px">
          <Text
            fontFamily="var(--f-display)"
            fontSize={{
              base: '38px',
              md: isFirst ? '52px' : isSecond ? '44px' : '38px',
              lg: isFirst ? '58px' : isSecond ? '48px' : '42px',
            }}
            fontWeight="700"
            color={isFirst ? 'var(--secondary)' : 'var(--fg)'}
            lineHeight="1"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {Number(row.points || 0).toLocaleString()}
          </Text>
          <Text
            fontSize={isFirst ? '14px' : '13px'}
            color={isFirst ? 'var(--secondary)' : 'var(--muted)'}
            fontFamily="var(--f-body)"
            fontWeight="600"
          >
            pts
          </Text>
        </Flex>

        <Text
          fontSize={isFirst ? '14px' : isSecond ? '13px' : '12.5px'}
          color={isFirst ? 'var(--fg)' : 'var(--muted)'}
          mt="6px"
          fontFamily="var(--f-body)"
          fontWeight={isFirst ? '600' : '500'}
        >
          {Number(row.prmerged || 0).toLocaleString()} PRs merged
        </Text>
      </Box>
    </Box>
  );

  if (row.githubid) {
    return (
      <Link
        href={`/user/profile/${row.githubid}`}
        style={{
          textDecoration: 'none',
          display: 'flex',
          width: '100%',
          alignSelf: 'flex-end',
        }}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <Box w="100%" alignSelf="flex-end">
      {cardContent}
    </Box>
  );
}
