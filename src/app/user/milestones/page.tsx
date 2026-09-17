'use client';

import {
  Box,
  Flex,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchEventWinners,
  fetchWeeklyLeaderboards,
} from 'api/milestones/milestones';
import React, { useState } from 'react';
import { FaTrophy } from 'react-icons/fa';
import { MdEmojiEvents, MdLeaderboard } from 'react-icons/md';
import { RingLoader } from 'react-spinners';
import { EventWinnersCard } from './components/EventWinnerCard';
import { WeeklyLeaderboardCard } from './components/WeeklyLeaderboard';
import { opencodeTokens } from '../../../theme/opencode-tokens';
import PageHeading from 'components/japanese/PageHeading';

interface EventWinner {
  name: string;
  avatar: string;
  username: string;
  userId: string;
  score?: number;
}
interface EventData {
  eventName: string;
  winners: Record<number, EventWinner[]>;
  eventImage?: string;
}

export default function Milestones() {
  const [selectedTab, setSelectedTab] = useState(0);

  
  const WEEKS_TO_SHOW = [true, true, true, true, true];
  const SHOW_EVENTS = true;

  const bgColor = 'transparent';
  const cardBg = opencodeTokens.colors.background.glassDark;
  const textColor = opencodeTokens.colors.text.primary;
  const mutedColor = opencodeTokens.colors.text.secondary;

  
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['weeklyLeaderboards'],
    queryFn: fetchWeeklyLeaderboards,
  });

  const { data: eventWinnersData, isLoading: eventWinnersLoading } = useQuery({
    queryKey: ['eventWinners'],
    queryFn: fetchEventWinners,
  });

  if (leaderboardLoading || eventWinnersLoading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg={bgColor}>
        <RingLoader color={opencodeTokens.colors.accent.sakura} />
      </Flex>
    );
  }

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

  const tabs = [
    {
      key: 'weekly',
      label: (
        <Tab fontWeight="700" borderRadius="full" px={{ base: 5, md: 8 }}>
          <Icon as={MdLeaderboard} mr="8px" /> Weekly Leaders
        </Tab>
      ),
      panel: (
        <TabPanel p="0" >
          
          {weeklyData.length ? (
            <Box className="glass-panel" borderRadius="24px" p="20px" boxShadow={opencodeTokens.shadows.glass} >
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
            <EmptyState
              icon={MdLeaderboard}
              title="No weekly champions yet"
              subtitle="The leaderboard is warming up"
            />
          )}
        </TabPanel>
      ),
      visible: true,
    },
    {
      key: 'events',
      label: (
        <Tab fontWeight="700" borderRadius="full" px={{ base: 5, md: 8 }}>
          <Icon as={MdEmojiEvents} mr="8px" /> Event Winners
        </Tab>
      ),
      panel: (
        <TabPanel p="0">
          {events.length ? (
            <Box className="glass-panel" borderRadius="24px" p="20px" boxShadow={opencodeTokens.shadows.glass}>
              <EventWinnersCard events={events} />
            </Box>
          ) : (
            <EmptyState
              icon={MdEmojiEvents}
              title="No event winners yet"
              subtitle="Victories will appear here"
            />
          )}
        </TabPanel>
      ),
      visible: SHOW_EVENTS,
    },
  ].filter((t) => t.visible);

  const safeTabIndex = Math.min(selectedTab, tabs.length - 1);

  return (
    <Box bg={bgColor} pt="0" pb="24px">
      
      <Box position="relative" zIndex={1} maxW="1200px" mx="auto" px="0">
        
        <PageHeading eyebrow="EVERY STEP TELLS A STORY" title="Moments that matter." description="A living record of standout contributions, weekly excellence, and the little victories that bring us together." />

      
        <Flex justify="center" gap="24px" mb="40px" wrap="wrap">
          <Stat label="Participants" value="1000+" />
          <Stat label="Sub Events Hosted" value={(events.length).toString()} />
          <Stat label="Weeks Completed" value={weeklyData.length.toString()} />
        </Flex>

        <Tabs
  index={safeTabIndex}
  onChange={setSelectedTab}
  variant="soft-rounded"
  colorScheme="purple"
  align="center"
  isLazy
>
  <TabList
    p={{ base: '1', md: '2' }}
    borderRadius="full"
    
    mb={{ base: '24px', md: '40px' }}
    gap={{ base: '4px', md: '6px' }}
    maxW="100%"
    overflowX="auto"
    css={{
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    }}
  >
    {tabs.map((t) =>
      React.cloneElement(t.label, {
        key: t.key,
        px: { base: 4, md: 8 },
        py: { base: '8px', md: '10px' },
        fontSize: { base: '13px', md: '14px' },
        whiteSpace: 'nowrap',
      }),
    )}
  </TabList>

  <TabPanels>
    {tabs.map((t) => React.cloneElement(t.panel, { key: t.key }))}
  </TabPanels>
</Tabs>

      </Box>
    </Box>
  );
}

/* ------------------ Helpers ------------------ */

function Stat({ label, value }: { label: string; value: string }) {
  const muted = opencodeTokens.colors.text.secondary;

  return (
    <Box
      className="glass-panel"
      px={{ base: '16px', md: '30px' }}
      py={{ base: '14px', md: '22px' }}
      borderRadius={{ base: '16px', md: '22px' }}
      boxShadow={opencodeTokens.shadows.glass}
      textAlign="center"
      minW={{ base: '104px', md: '140px' }}
    >
      {/* Value */}
      <Text
        fontSize={{ base: '20px', md: '26px' }}
        fontWeight="900"
        lineHeight="1"
      >
        {value}
      </Text>

      {/* Label */}
      <Text
        fontSize={{ base: '11px', md: '13px' }}
        color={muted}
        mt={{ base: '4px', md: '6px' }}
        noOfLines={1}
      >
        {label}
      </Text>
    </Box>
  );
}


function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) {
  const muted = opencodeTokens.colors.text.secondary;
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      h="300px"
      className="glass-panel"
      borderRadius="24px"
      boxShadow={opencodeTokens.shadows.glass}
    >
      <Icon as={icon} w="48px" h="48px" color={muted} mb="12px" />
      <Text fontWeight="700">{title}</Text>
      <Text fontSize="sm" color={muted}>
        {subtitle}
      </Text>
    </Flex>
  );
}

