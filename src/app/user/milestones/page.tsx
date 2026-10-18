'use client';

import React, { useState } from 'react';
import {
  Box,
  Flex,
  Icon,
  Text,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimateSharedLayout, useReducedMotion } from 'framer-motion';
import {
  fetchEventWinners,
  fetchWeeklyLeaderboards,
} from 'api/milestones/milestones';
import { MdEmojiEvents, MdLeaderboard } from 'react-icons/md';
import { EventWinnersCard } from './components/EventWinnerCard';
import { WeeklyLeaderboardCard } from './components/WeeklyLeaderboard';
import { tabIndicatorTransition } from './components/leaderboardMotion';

interface EventWinner {
  name: string;
  avatar: string;
  username: string;
  userId: string;
  score?: number;
  college?: string;
  date?: string;
}

interface EventData {
  eventName: string;
  winners: Record<number, EventWinner[]>;
  eventImage?: string;
}

const TABS = [
  { key: 'weekly', label: 'Weekly Leaders', icon: MdLeaderboard },
  { key: 'events', label: 'Event Winners', icon: MdEmojiEvents },
];

export default function Milestones() {
  const [selectedTab, setSelectedTab] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const WEEKS_TO_SHOW = [true, true, true, true, true];
  const SHOW_EVENTS = true;

  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['weeklyLeaderboards'],
    queryFn: fetchWeeklyLeaderboards,
  });

  const { data: eventWinnersData, isLoading: eventWinnersLoading } = useQuery({
    queryKey: ['eventWinners'],
    queryFn: fetchEventWinners,
  });

  const weeks = leaderboardData?.data || {};
  const weeklyData = Object.values(weeks).filter(
    (_, index) => WEEKS_TO_SHOW[index],
  );

  const eventWinnersRaw = eventWinnersData?.data || {};
  const events: EventData[] = SHOW_EVENTS
    ? Object.entries(eventWinnersRaw).map(([eventName, winners]) => ({
        eventName,
        winners: winners as Record<number, EventWinner[]>,
      }))
    : [];

  const isLoading = leaderboardLoading || eventWinnersLoading;

  return (
    <Box w="full" pt="0" pb="24px">
      {/* 1. Header: use oc-page-heading markup with visible eyebrow and Georgia stat tiles on the right */}
      <Box
        as="header"
        className="oc-page-heading"
        display="flex"
        flexDirection={{ base: 'column', lg: 'row' }}
        alignItems={{ base: 'flex-start', lg: 'center' }}
        justifyContent="space-between"
        gap={{ base: '20px', md: '28px' }}
        mb="24px"
        p={{ base: '22px 20px', sm: '28px 32px', md: '34px 44px' }}
      >
        <Box flex="1" minW="0">
          <p className="oc-eyebrow" style={{ marginBottom: '12px' }}>
            <span />
            Highlights · OpenCode 2026
          </p>
          <h1 style={{ marginBottom: '12px' }}>
            Moments that matter.
          </h1>
          <p className="oc-description">
            A living record of standout contributions, weekly excellence, and the little victories that bring us together.
          </p>
        </Box>

        {/* Compact stat tiles with Georgia numerals; stacks below description on mobile */}
        <Flex
          direction="row"
          gap={{ base: '8px', sm: '12px', md: '14px' }}
          align="center"
          wrap="wrap"
          w={{ base: '100%', lg: 'auto' }}
          justify={{ base: 'space-between', sm: 'flex-start', lg: 'flex-end' }}
          flexShrink={0}
        >
          <StatTile label="Participants" value="1000+" />
          <StatTile
            label="Sub Events Hosted"
            value={isLoading ? '...' : events.length.toString()}
          />
          <StatTile
            label="Weeks Completed"
            value={isLoading ? '...' : weeklyData.length.toString()}
          />
        </Flex>
      </Box>

      {/* 2. Tabs: Compact centered segmented control with sliding pink indicator */}
      <Flex justify="center" w="full" mb="24px">
        <AnimateSharedLayout>
          <Flex
            as="div"
            role="tablist"
            aria-label="Milestones categories"
            bg="var(--surface)"
            border="1px solid var(--border)"
            p="4px"
            borderRadius="999px"
            boxShadow="var(--shadow)"
            backdropFilter="blur(16px)"
            gap="4px"
            position="relative"
          >
            {TABS.map((tab, idx) => {
              const isSelected = selectedTab === idx;
              const IconComponent = tab.icon;
              return (
                <Box
                  as="button"
                  key={tab.key}
                  id={`tab-${tab.key}`}
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`panel-${tab.key}`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setSelectedTab(idx)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                      e.preventDefault();
                      setSelectedTab((prev) => (prev + 1) % TABS.length);
                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                      e.preventDefault();
                      setSelectedTab((prev) => (prev === 0 ? TABS.length - 1 : prev - 1));
                    } else if (e.key === 'Home') {
                      e.preventDefault();
                      setSelectedTab(0);
                    } else if (e.key === 'End') {
                      e.preventDefault();
                      setSelectedTab(TABS.length - 1);
                    }
                  }}
                  position="relative"
                  px={{ base: '16px', sm: '24px' }}
                  py="9px"
                  borderRadius="999px"
                  fontSize={{ base: '13px', md: '14px' }}
                  fontFamily="var(--f-body)"
                  fontWeight={isSelected ? 600 : 500}
                  color={isSelected ? 'var(--accent-ink)' : 'var(--muted)'}
                  outline="none"
                  cursor="pointer"
                  border="none"
                  bg="transparent"
                  transition="color 0.2s ease"
                  _hover={{
                    color: isSelected ? 'var(--accent-ink)' : 'var(--fg)',
                  }}
                  _focusVisible={{
                    outline: '2px solid var(--accent)',
                    outlineOffset: '2px',
                  }}
                >
                  {/* Sliding pink indicator animated with layoutId */}
                  {isSelected && (
                    <motion.div
                      layoutId="milestones-active-tab-indicator"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '999px',
                        background: 'var(--accent)',
                        boxShadow: '0 4px 14px -3px var(--accent)',
                        zIndex: 0,
                      }}
                      transition={prefersReducedMotion ? { duration: 0.01 } : tabIndicatorTransition}
                    />
                  )}
                  <Flex align="center" gap="8px" position="relative" zIndex={1}>
                    <Icon as={IconComponent} boxSize="17px" />
                    <span>{tab.label}</span>
                  </Flex>
                </Box>
              );
            })}
          </Flex>
        </AnimateSharedLayout>
      </Flex>

      {/* 3. Tab Panels with 24px vertical rhythm */}
      <Box w="full">
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : selectedTab === 0 ? (
          <Box
            id="panel-weekly"
            role="tabpanel"
            aria-labelledby="tab-weekly"
            tabIndex={0}
            _focus={{ outline: 'none' }}
          >
            <WeeklyLeaderboardCard
              weeks={weeklyData.map((weekData: any) => ({
                week: weekData.week,
                data: weekData.leaderboard.map((user: any) => ({
                  ...user,
                  userId:
                    user.userId ||
                    user.id ||
                    `${weekData.week}-${user.rank}`,
                })),
              }))}
            />
          </Box>
        ) : (
          <Box
            id="panel-events"
            role="tabpanel"
            aria-labelledby="tab-events"
            tabIndex={0}
            _focus={{ outline: 'none' }}
          >
            <EventWinnersCard events={events} />
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ------------------ Helpers ------------------ */

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Box
      px={{ base: '12px', sm: '16px', md: '20px' }}
      py={{ base: '10px', md: '14px' }}
      borderRadius="16px"
      bg="var(--card-soft)"
      border="1px solid var(--border)"
      textAlign="center"
      minW={{ base: '86px', sm: '104px', md: '124px' }}
      flex={{ base: '1', sm: 'initial' }}
    >
      <Text
        fontFamily="Georgia, serif"
        fontSize={{ base: '20px', sm: '24px', md: '28px' }}
        fontWeight="400"
        color="var(--text)"
        lineHeight="1"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Text>
      <Text
        fontSize={{ base: '10.5px', sm: '11.5px', md: '12px' }}
        color="var(--muted)"
        mt="4px"
        fontWeight="500"
        noOfLines={1}
      >
        {label}
      </Text>
    </Box>
  );
}

/**
 * Skeleton shimmer card displayed during data loading
 */
function LeaderboardSkeleton() {
  return (
    <Box
      className="glass-panel"
      borderRadius="24px"
      overflow="hidden"
      w={{ base: '100%', sm: '380px', md: '420px' }}
      h="580px"
      mx="auto"
      display="flex"
      flexDirection="column"
      boxShadow="var(--shadow)"
    >
      {/* Header shimmer */}
      <Box
        p="20px"
        bg="var(--accent-soft)"
        borderTop="2px solid var(--accent)"
        borderBottom="1px solid var(--border)"
      >
        <Box
          w="100px"
          h="12px"
          borderRadius="6px"
          mb="8px"
          className="oc-skeleton-shimmer"
        />
        <Box
          w="140px"
          h="24px"
          borderRadius="8px"
          className="oc-skeleton-shimmer"
        />
      </Box>

      {/* Podium shimmer */}
      <Box p="28px 16px 20px" borderBottom="1px solid var(--border)">
        <Flex justify="center" align="flex-end" gap="10px" h="150px">
          {/* 2nd place */}
          <Flex direction="column" align="center" gap={2} w="31%">
            <Box
              w="46px"
              h="46px"
              borderRadius="full"
              className="oc-skeleton-shimmer"
            />
            <Box
              w="100%"
              h="88px"
              borderRadius="14px"
              className="oc-skeleton-shimmer"
            />
          </Flex>
          {/* 1st place */}
          <Flex direction="column" align="center" gap={2} w="34%">
            <Box
              w="56px"
              h="56px"
              borderRadius="full"
              className="oc-skeleton-shimmer"
            />
            <Box
              w="100%"
              h="116px"
              borderRadius="14px"
              className="oc-skeleton-shimmer"
            />
          </Flex>
          {/* 3rd place */}
          <Flex direction="column" align="center" gap={2} w="31%">
            <Box
              w="44px"
              h="44px"
              borderRadius="full"
              className="oc-skeleton-shimmer"
            />
            <Box
              w="100%"
              h="72px"
              borderRadius="14px"
              className="oc-skeleton-shimmer"
            />
          </Flex>
        </Flex>
      </Box>

      {/* Rank rows shimmer */}
      <Box p="14px" flex="1">
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            w="100%"
            h="42px"
            borderRadius="12px"
            mb="8px"
            className="oc-skeleton-shimmer"
          />
        ))}
      </Box>
    </Box>
  );
}
