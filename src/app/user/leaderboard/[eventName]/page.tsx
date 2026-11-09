'use client';

import React, { useDeferredValue, useMemo, useState, useCallback, useEffect } from 'react';
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

// Pure helper to determine whether an entry belongs to the first year (hoisted to avoid churn)
function isFirstYear(item: { graduationYear?: string | number; year?: string }): boolean {
  const grad = String(item.graduationYear ?? '').trim();
  const yr = String(item.year ?? '').trim().toLowerCase();
  return grad === '2029' || yr.includes('1st') || yr === '1';
}

export default function EventName() {
  const { eventName } = useParams<{ eventName: string }>();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [firstYearOnly, setFirstYearOnly] = useState(false);
  const [isCollegeHovered, setIsCollegeHovered] = useState(false);
  const [isEventHovered, setIsEventHovered] = useState(false);

  // React concurrent deferred search value for immediate keystroke responsiveness
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const isStale = searchQuery !== deferredSearchQuery;

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

  // Base list of participants eligible for ranking (excluding mentors & maintainers for Opencode)
  const eligibleList = useMemo(() => {
    const rawList = LeadData || [];
    return isOpencode
      ? rawList.filter((item) => !item.isMentor && (!item.githubid || !isMaintainer(item.githubid)))
      : rawList;
  }, [LeadData, isOpencode]);

  const collegeOptions = useMemo(() => {
    const colleges = eligibleList
      .map((r) => (r.collegeName as string)?.trim())
      .filter(Boolean);
    return [...new Set(colleges)].sort();
  }, [eligibleList]);

  // Filter cohort based on active cohort filters (College and/or 1st Years)
  const activeCohort = useMemo(() => {
    const collegeLower = selectedCollege !== 'All' ? selectedCollege.toLowerCase() : null;

    return eligibleList.filter((item) => {
      if (collegeLower && (item.collegeName as string)?.trim().toLowerCase() !== collegeLower) {
        return false;
      }
      if (firstYearOnly && !isFirstYear(item)) {
        return false;
      }
      return true;
    });
  }, [eligibleList, selectedCollege, firstYearOnly]);

  // Recalculate ranks within the active filtered cohort starting at 1 (1 to N)
  // Preserves existing sorting order (points desc, createdAt asc) and tie-breaking policies
  const rankedCohortData: RowObj[] = useMemo(() => {
    let currentRank = 1;

    return activeCohort.map((item, index) => {
      let posStr = String(index + 1);

      if (index > 0) {
        const prev = activeCohort[index - 1];
        // Preserve tied position if backend assigned identical position to both
        if (item.position !== undefined && prev.position !== undefined && item.position === prev.position) {
          posStr = String(currentRank);
        } else {
          currentRank = index + 1;
          posStr = String(currentRank);
        }
      } else {
        currentRank = 1;
        posStr = "1";
      }

      return {
        position: posStr,
        name: item.name,
        prmerged: item.prmerged !== undefined && item.prmerged !== null ? Number(item.prmerged) : undefined,
        githubid: item.githubid ?? undefined,
        points: item.points !== undefined && item.points !== null ? Number(item.points) : undefined,
        avatarUrl: item.githubid ? `https://github.com/${item.githubid}.png` : item.avatarUrl,
        prDetailsURL: item.prDetailsURL,
        college: item.collegeName ?? '',
        graduationYear: item.graduationYear ?? '',
        year: item.year ?? '',
      };
    });
  }, [activeCohort]);

  const hasPoints = useMemo(() => {
    if (isOpencode) return true;
    return rankedCohortData.some(
      (r) => r.points !== undefined && r.points !== null && !isNaN(Number(r.points))
    );
  }, [isOpencode, rankedCohortData]);

  // Top 3 of the active cohort for spotlight podium cards (respects firstYearOnly & college filters)
  const topThree = useMemo(() => {
    return rankedCohortData.slice(0, 3);
  }, [rankedCohortData]);

  // Memoized set of spotlight IDs for O(1) table row deduplication
  const topThreeIdSet = useMemo(() => {
    return new Set(
      topThree.map((r) => r.githubid || `${r.name}-${r.position}`)
    );
  }, [topThree]);

  // Apply search query filter using DEFERRED search value on top of the ranked cohort
  // Preserves each user's cohort rank and allows uninterrupted UI typing
  const searchFilteredData = useMemo(() => {
    const q = deferredSearchQuery.trim().toLowerCase();
    if (!q) return rankedCohortData;

    return rankedCohortData.filter((row) => {
      const matchesUser =
        (isOpencode && row.githubid?.toLowerCase().includes(q)) ||
        row.name?.toLowerCase().includes(q);
      return Boolean(matchesUser);
    });
  }, [deferredSearchQuery, rankedCohortData, isOpencode]);

  const participantCount = searchFilteredData.length;
  const totalCount = eligibleList.length;

  const clearAllFilters = useCallback(() => {
    setSelectedCollege('All');
    setFirstYearOnly(false);
    setSearchQuery('');
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleClearCollege = useCallback(() => {
    setSelectedCollege('All');
  }, []);

  const handleClearFirstYear = useCallback(() => {
    setFirstYearOnly(false);
  }, []);

  const handleToggleFirstYear = useCallback(() => {
    setFirstYearOnly((prev) => !prev);
  }, []);

  const handleSelectCollege = useCallback((college: string) => {
    setSelectedCollege(college);
  }, []);

  // Display spotlight podium whenever top 3 are available and not actively searching
  const showSpotlight = !deferredSearchQuery.trim() && topThree.length === 3;

  // When spotlight cards are visible, don't repeat those three people in the table below.
  // When spotlight is hidden (e.g. during a search), show everyone who matches.
  const tableRows = useMemo(() => {
    if (!showSpotlight) return searchFilteredData;
    return searchFilteredData.filter(
      (r) => !topThreeIdSet.has(r.githubid || `${r.name}-${r.position}`)
    );
  }, [showSpotlight, searchFilteredData, topThreeIdSet]);

  const hasActiveFilters =
    selectedCollege !== 'All' || firstYearOnly || !!searchQuery.trim();

  if (isLoading) {
    return <LeaderboardLoader />;
  }

  const showEmpty = searchFilteredData.length === 0;

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
                      onClick={() => handleSelectCollege(college)}
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
          onClick={handleToggleFirstYear}
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
            <FilterChip label={`Search: ${searchQuery.trim()}`} onRemove={handleClearSearch} />
          )}
          {selectedCollege !== 'All' && (
            <FilterChip label={selectedCollege} onRemove={handleClearCollege} />
          )}
          {firstYearOnly && (
            <FilterChip label="1st years only" onRemove={handleClearFirstYear} />
          )}
        </Flex>
      )}

      {/* ─── 3. TOP 3 SPOTLIGHT (PSD Reference Reproduction) ─── */}
      {showSpotlight && (
        <Box w="100%" pr={{ base: '0px', md: '28px' }}>
          <Flex align="center" gap="10px" mb="18px" px="4px">
            <Text
              fontSize="11px"
              fontWeight="700"
              letterSpacing="0.16em"
              textTransform="uppercase"
              color="var(--muted)"
              fontFamily="var(--f-mono)"
            >
              {firstYearOnly ? 'TOP FRESHERS · PODIUM' : 'TOP STANDINGS · PODIUM'}
            </Text>
            <Box flex="1" h="1px" bg="var(--border)" opacity={0.6} />
          </Flex>

          <Flex
            direction="column"
            gap={{ base: '16px', md: '22px' }}
            w="100%"
            align="center"
          >
            <PodiumBannerCard row={topThree[0]} rank={1} isOpencode={isOpencode} hasPoints={hasPoints} />
            <PodiumBannerCard row={topThree[1]} rank={2} isOpencode={isOpencode} hasPoints={hasPoints} />
            <PodiumBannerCard row={topThree[2]} rank={3} isOpencode={isOpencode} hasPoints={hasPoints} />
          </Flex>
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

const FilterChip = React.memo(function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
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
});

type PodiumRank = 1 | 2 | 3;

interface PodiumConfig {
  tag: string;
  tagColor: string;
  pointsColor: string;
  bgImage: string;
  badgeImage: string;
  badgeGlow: string;
  border: string;
  borderHover: string;
  boxShadow: string;
  boxShadowHover: string;
  avatarBoxBg: string;
  avatarBoxBorder: string;
  avatarBoxShadow: string;
  cardWidth: any;
  cardHeight: any;
}

const PODIUM_CONFIGS: Record<PodiumRank, PodiumConfig> = {
  1: {
    tag: '★ Champion · #1',
    tagColor: '#F5C542',
    pointsColor: '#F5C542',
    bgImage: '/images/leaderboard/opencode-podium-1.png',
    badgeImage: '/images/leaderboard/badge-1st.png',
    badgeGlow: 'drop-shadow(0 0 16px rgba(245, 197, 66, 0.5))',
    border: '1px solid rgba(245, 197, 66, 0.45)',
    borderHover: 'rgba(245, 197, 66, 0.75)',
    boxShadow:
      '0 16px 36px -10px rgba(0, 0, 0, 0.8), 0 0 28px -4px rgba(245, 197, 66, 0.25)',
    boxShadowHover:
      '0 20px 48px -8px rgba(0, 0, 0, 0.9), 0 0 36px -2px rgba(245, 197, 66, 0.4)',
    avatarBoxBg: '#FFFFFF',
    avatarBoxBorder: '3px solid #F5C542',
    avatarBoxShadow:
      '0 12px 28px rgba(0, 0, 0, 0.7), 0 0 24px rgba(245, 197, 66, 0.45)',
    cardWidth: '100%',
    cardHeight: { base: 'auto', md: '180px' },
  },
  2: {
    tag: 'Runner-Up · #2',
    tagColor: '#BAE6FD',
    pointsColor: '#E2E8F0',
    bgImage: '/images/leaderboard/opencode-podium-2.png',
    badgeImage: '/images/leaderboard/badge-2nd.png',
    badgeGlow: 'drop-shadow(0 0 14px rgba(226, 232, 240, 0.4))',
    border: '1px solid rgba(148, 163, 184, 0.35)',
    borderHover: 'rgba(255, 255, 255, 0.65)',
    boxShadow:
      '0 14px 32px -10px rgba(0, 0, 0, 0.8), 0 0 24px -4px rgba(148, 163, 184, 0.2)',
    boxShadowHover:
      '0 18px 42px -8px rgba(0, 0, 0, 0.9), 0 0 32px -2px rgba(186, 230, 253, 0.35)',
    avatarBoxBg: '#080A0C',
    avatarBoxBorder: '2.5px solid #E2E8F0',
    avatarBoxShadow:
      '0 10px 24px rgba(0, 0, 0, 0.7), 0 0 20px rgba(186, 230, 253, 0.35)',
    cardWidth: { base: '100%', md: '94.5%' },
    cardHeight: { base: 'auto', md: '175px' },
  },
  3: {
    tag: 'Third Place · #3',
    tagColor: '#FDBA74',
    pointsColor: '#FDBA74',
    bgImage: '/images/leaderboard/opencode-podium-3.png',
    badgeImage: '/images/leaderboard/badge-3rd.png',
    badgeGlow: 'drop-shadow(0 0 14px rgba(217, 119, 6, 0.4))',
    border: '1px solid rgba(217, 119, 6, 0.35)',
    borderHover: 'rgba(217, 119, 6, 0.7)',
    boxShadow:
      '0 12px 28px -10px rgba(0, 0, 0, 0.8), 0 0 20px -4px rgba(217, 119, 6, 0.2)',
    boxShadowHover:
      '0 16px 36px -8px rgba(0, 0, 0, 0.9), 0 0 28px -2px rgba(217, 119, 6, 0.35)',
    avatarBoxBg: '#080A0C',
    avatarBoxBorder: '2.5px solid #D97706',
    avatarBoxShadow:
      '0 10px 24px rgba(0, 0, 0, 0.7), 0 0 20px rgba(217, 119, 6, 0.35)',
    cardWidth: { base: '100%', md: '89%' },
    cardHeight: { base: 'auto', md: '170px' },
  },
};

/* ──────────────────────────────────────────────────────────────
   PSD REFERENCE TOP 3 PODIUM BANNER CARD
   Faithfully reproduces daily_ui_019_-_leaderboard.psd:
   - 3D metallic rank badge on black corner with ink-splatter grunge
   - Atmospheric background artwork (God of War, Fallout 3, The Last of Us)
   - Centered dynamic participant info (Name, Handle, College, Points, Merged PRs)
   - Square avatar box on the right edge
────────────────────────────────────────────────────────────── */
const PodiumBannerCard = React.memo(
  function PodiumBannerCard({
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
    const college = String(row.college ?? '').trim();
    const config = PODIUM_CONFIGS[rank] || PODIUM_CONFIGS[1];

  const cardContent = (
    <Box
      position="relative"
      w="100%"
      maxW={config.cardWidth}
      mx="auto"
      minH={{ base: '120px', md: '160px' }}
      h={config.cardHeight}
      borderRadius="14px"
      bgImage={`url(${config.bgImage})`}
      bgSize="cover"
      bgPosition="left center"
      bgRepeat="no-repeat"
      border={config.border}
      boxShadow={config.boxShadow}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px={{ base: '12px', sm: '16px', md: '20px' }}
      py={{ base: '12px', md: '0px' }}
      transition="transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease"
      _hover={{
        transform: 'translateY(-4px)',
        borderColor: config.borderHover,
        boxShadow: config.boxShadowHover,
      }}
      role="group"
      cursor={row.githubid ? 'pointer' : 'default'}
    >
      {/* 1. Left Zone: 3D Metallic Rank Badge */}
      <Flex
        w={{ base: '56px', sm: '76px', md: '110px' }}
        pl={{ base: '2px', md: '14px' }}
        align="center"
        justify={{ base: 'center', md: 'flex-start' }}
        shrink={0}
        zIndex={2}
      >
        <img
          src={config.badgeImage}
          alt={`Rank ${rank}`}
          style={{
            height: 'clamp(46px, 7vw, 76px)',
            width: 'auto',
            objectFit: 'contain',
            filter: config.badgeGlow,
          }}
        />
      </Flex>

      {/* 2. Center Zone: Dynamic Participant Info */}
      <Flex
        direction="column"
        align={{ base: 'flex-start', sm: 'center' }}
        justify="center"
        textAlign={{ base: 'left', sm: 'center' }}
        flex="1"
        minW="0"
        px={{ base: '8px', sm: '16px', md: '20px' }}
        zIndex={2}
      >
        {/* Tier Tag */}
        <Text
          fontSize={{ base: '10px', sm: '11px' }}
          fontFamily="var(--f-mono)"
          fontWeight="700"
          letterSpacing="0.13em"
          textTransform="uppercase"
          color={config.tagColor}
          mb="2px"
        >
          {config.tag}
        </Text>

        {/* Name */}
        <Text
          fontFamily="var(--f-display)"
          fontSize={{ base: '18px', sm: '24px', md: '28px', lg: '32px' }}
          fontWeight="700"
          color="#F4F1E8"
          lineHeight="1.15"
          noOfLines={1}
          maxW="100%"
          textShadow="0 2px 14px rgba(0, 0, 0, 0.95), 0 0 28px rgba(0, 0, 0, 0.85)"
          _groupHover={{ color: 'var(--accent)' }}
          transition="color 0.2s ease"
        >
          {row.name}
        </Text>

        {/* GitHub Handle + College */}
        <Flex
          align="center"
          gap={{ base: '5px', sm: '8px' }}
          mt="2px"
          flexWrap="wrap"
          justify={{ base: 'flex-start', sm: 'center' }}
        >
          {row.githubid && (
            <Text
              fontSize={{ base: '11px', sm: '12px', md: '13px' }}
              fontFamily="var(--f-mono)"
              fontWeight="600"
              color="var(--accent)"
              noOfLines={1}
            >
              @{row.githubid}
            </Text>
          )}
          {college && (
            <>
              <Text fontSize="11px" color="rgba(244, 241, 232, 0.4)">
                •
              </Text>
              <Text
                fontSize={{ base: '11px', sm: '12px', md: '13px' }}
                color="rgba(244, 241, 232, 0.72)"
                noOfLines={1}
                maxW={{ base: '130px', sm: '200px', md: '280px' }}
              >
                {college}
              </Text>
            </>
          )}
        </Flex>

        {/* Points & PRs */}
        <Flex align="baseline" gap={{ base: '8px', sm: '12px' }} mt={{ base: '3px', md: '6px' }}>
          <Flex align="baseline" gap="3px">
            <Text
              fontFamily="var(--f-display)"
              fontSize={{ base: '22px', sm: '28px', md: '36px' }}
              fontWeight="800"
              color={config.pointsColor}
              lineHeight="1"
              style={{ fontVariantNumeric: 'tabular-nums' }}
              textShadow="0 2px 12px rgba(0, 0, 0, 0.9)"
            >
              {Number(row.points || 0).toLocaleString()}
            </Text>
            <Text
              fontFamily="var(--f-mono)"
              fontSize={{ base: '11px', sm: '12px' }}
              fontWeight="700"
              color={config.pointsColor}
              textTransform="uppercase"
              opacity={0.9}
            >
              pts
            </Text>
          </Flex>

          <Text fontSize="11px" color="rgba(244, 241, 232, 0.35)">
            |
          </Text>

          <Text
            fontSize={{ base: '11px', sm: '12px', md: '13px' }}
            color="#D9E2E8"
            fontWeight="500"
            opacity={0.85}
            noOfLines={1}
          >
            {Number(row.prmerged || 0).toLocaleString()} PRs merged
          </Text>
        </Flex>
      </Flex>

      {/* 3. Right Zone: Square Avatar Container */}
      <Flex
        align="center"
        justify={{ base: 'center', md: 'flex-end' }}
        shrink={0}
        zIndex={3}
        transform={{ base: 'none', md: 'translateX(26px)' }}
        pr={{ base: '2px', md: '8px' }}
      >
        <Box
          w={{ base: '56px', sm: '72px', md: '96px', lg: '104px' }}
          h={{ base: '56px', sm: '72px', md: '96px', lg: '104px' }}
          bg={config.avatarBoxBg}
          border={config.avatarBoxBorder}
          boxShadow={config.avatarBoxShadow}
          borderRadius="6px"
          overflow="hidden"
          p={{ base: '2px', md: '3px' }}
          transition="transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          _groupHover={{ transform: 'scale(1.06)' }}
        >
          <ContributorAvatar
            name={row.name}
            githubid={row.githubid}
            avatarUrl={row.avatarUrl}
            size="100%"
            fontSize={{ base: '18px', sm: '24px', md: '32px' }}
            borderRadius="3px"
          />
        </Box>
      </Flex>
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
          justifyContent: 'center',
        }}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <Box w="100%" display="flex" justifyContent="center">
      {cardContent}
    </Box>
  );
},
(prev, next) => {
  return (
    prev.rank === next.rank &&
    prev.isOpencode === next.isOpencode &&
    prev.hasPoints === next.hasPoints &&
    prev.row.githubid === next.row.githubid &&
    prev.row.points === next.row.points &&
    prev.row.prmerged === next.row.prmerged &&
    prev.row.name === next.row.name &&
    prev.row.avatarUrl === next.row.avatarUrl &&
    prev.row.college === next.row.college &&
    prev.row.position === next.row.position
  );
});
