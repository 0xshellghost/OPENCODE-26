'use client';

import {
  Avatar,
  Box,
  Flex,
  Skeleton,
  Stack,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Text,
} from '@chakra-ui/react';
import { opencodeTokens } from '../../../theme/opencode-tokens';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import BlurText from '../../../components/reactbits/BlurText';
import ShinyText from '../../../components/reactbits/ShinyText';
import ClickSpark from '../../../components/reactbits/ClickSpark';
import CountUp from '../../../components/reactbits/CountUp';
import {
  FaCodeBranch,
  FaUsers,
} from 'react-icons/fa';
import { FetchedLeaderboard } from 'api/leaderboard/leaderboard';
import { FetchedEvents } from 'api/events/events';

export type Winner = {
  position: number;
  name: string;
  githubid: string;
  points: number;
  prmerged: number;
  avatarUrl?: string;
  color?: string;
};

const OVERALL_COLORS = [
  '#F5C542', // Gold
  '#b4aea2', // Silver
  '#e690a2', // Bronze / Sakura Rose
  '#8a32cd', // Amethyst
  '#45c07f', // Jade Emerald
];

const COLLEGE_COLORS = [
  '#45c07f', // Emerald
  '#F5C542', // Gold
  '#e690a2', // Sakura Rose
  '#b4aea2', // Silver
  '#8a32cd', // Amethyst
];

const RANK_COLORS = [
  '#F5C542',
  '#b4aea2',
  '#e690a2',
  '#8a32cd',
  '#45c07f',
];

function isIIITA(collegeName?: string): boolean {
  if (!collegeName) return false;
  const s = collegeName.trim().toLowerCase();
  return (
    s === 'iiit allahabad' ||
    s === 'iiita' ||
    s === 'iiit-a' ||
    s === 'iiit a' ||
    (s.includes('iiit') && s.includes('allahabad'))
  );
}

function TopThreeCards({ winners, isLoading }: { winners: Winner[]; isLoading?: boolean }) {
  const text = opencodeTokens.colors.text.primary;
  const muted = opencodeTokens.colors.text.secondary;
  const medals = ['🥇', '🥈', '🥉'];

  if (isLoading) {
    return (
      <Flex justify="center" gap="28px" wrap="wrap" mt="28px">
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            borderRadius="22px"
            px="26px"
            py="22px"
            minW="270px"
            bg="linear-gradient(135deg, rgba(30, 18, 38, 0.85) 0%, rgba(42, 24, 50, 0.82) 100%)"
            border="1px solid rgba(240, 168, 184, 0.15)"
          >
            <Flex align="center" gap="14px" mb="14px">
              <Skeleton boxSize="48px" borderRadius="full" />
              <Box flex="1">
                <Skeleton h="16px" w="70%" mb="6px" />
                <Skeleton h="12px" w="40%" />
              </Box>
            </Flex>
            <Flex justify="space-between" mt="10px">
              <Skeleton h="36px" w="70px" />
              <Skeleton h="36px" w="70px" />
            </Flex>
          </Box>
        ))}
      </Flex>
    );
  }

  if (winners.length === 0) {
    return null;
  }

  return (
    <Flex justify="center" gap="28px" wrap="wrap" mt="28px">
      {winners.slice(0, 3).map((w, i) => (
        <Box
          key={w.githubid}
          borderRadius="22px"
          px="26px"
          py="22px"
          minW="270px"
          bg="linear-gradient(135deg, rgba(30, 18, 38, 0.85) 0%, rgba(42, 24, 50, 0.82) 100%)"
          backdropFilter="blur(24px)"
          boxShadow={`0 10px 30px ${w.color || RANK_COLORS[w.position - 1] || '#F5C542'}33`}
          border={`1px solid ${w.color || RANK_COLORS[w.position - 1] || '#F5C542'}66`}
          position="relative"
          transition="all 0.3s ease"
          _hover={{
            transform: 'translateY(-3px)',
            boxShadow: `0 14px 40px ${w.color || RANK_COLORS[w.position - 1] || '#F5C542'}55`,
          }}
        >
          {/* ===== MEDAL ICON ===== */}
          <Flex
            position="absolute"
            top="-20px"
            right="18px"
            gap="6px"
            fontSize="32px"
          >
            <span>{medals[i] || '🎖️'}</span>
          </Flex>

          {/* ===== USER INFO ===== */}
          <Flex align="center" gap="14px" mb="14px">
            <Avatar
              src={w.avatarUrl || `https://github.com/${w.githubid}.png`}
              name={w.name}
              size="md"
              border={`3px solid ${w.color || RANK_COLORS[w.position - 1] || '#F5C542'}`}
              boxShadow={`0 0 16px ${w.color || RANK_COLORS[w.position - 1] || '#F5C542'}44`}
            />
            <Box minW={0}>
              <Text fontWeight="800" color={text} fontSize="15px" noOfLines={1} title={w.name}>
                {w.name}
              </Text>
              <Text fontSize="12px" color={muted} noOfLines={1}>
                @{w.githubid}
              </Text>
            </Box>
          </Flex>

          {/* ===== STATS ===== */}
          <Flex justify="space-between" mt="10px">
            <Box>
              <Text fontSize="11px" color={muted} fontWeight="700">
                POINTS
              </Text>
              <Text fontSize="22px" fontWeight="900" color={text} fontFamily="var(--f-mono)">
                <CountUp to={w.points} separator="," duration={1.2} />
              </Text>
            </Box>

            <Box textAlign="right">
              <Text fontSize="11px" color={muted} fontWeight="700">
                PRs MERGED
              </Text>
              <Text fontSize="22px" fontWeight="900" color={text} fontFamily="var(--f-mono)">
                <CountUp to={w.prmerged} separator="," duration={1} />
              </Text>
            </Box>
          </Flex>
        </Box>
      ))}
    </Flex>
  );
}

function OverallSideStats({ stats }: { stats: { totalPRs: string; totalRegistrations: string } }) {
  const glass = 'linear-gradient(135deg, rgba(30, 18, 38, 0.85) 0%, rgba(42, 24, 50, 0.82) 100%)';
  const text = opencodeTokens.colors.text.primary;
  const muted = opencodeTokens.colors.text.secondary;

  const Circle = ({
    icon: Icon,
    title,
    statsList,
    side,
  }: {
    icon: any;
    title: string;
    statsList: { value: string; label: string }[];
    side: 'left' | 'right';
  }) => (
    <Box
      position="absolute"
      top="50%"
      transform="translateY(-50%)"
      {...(side === 'left' ? { left: '20px' } : { right: '20px' })}
      display={{ base: 'none', lg: 'flex' }}
      w="200px"
      h="200px"
      borderRadius="50%"
      bg={glass}
      backdropFilter="blur(20px)"
      border="1px solid rgba(240, 168, 184, 0.22)"
      boxShadow="0 20px 45px rgba(0, 0, 0, 0.55)"
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      gap="8px"
      textAlign="center"
      zIndex={1}
      transition="all 0.3s ease"
      _hover={{
        borderColor: '#f0a8b8',
        boxShadow: '0 20px 45px rgba(240, 168, 184, 0.25)',
      }}
    >
      <Box
        fontSize="28px"
        color="#F5C542"
        mb="4px"
        filter="drop-shadow(0 0 12px rgba(245,197,66,0.35))"
      >
        <Icon />
      </Box>

      <Text
        fontSize="11px"
        letterSpacing="0.14em"
        textTransform="uppercase"
        fontWeight="700"
        color={muted}
      >
        {title}
      </Text>

      {statsList.map((s) => (
        <Box key={s.label}>
          <Text fontSize="22px" fontWeight="900" color={text} fontFamily="var(--f-mono)">
            {s.value}
          </Text>
          <Text fontSize="11px" color={muted}>
            {s.label}
          </Text>
        </Box>
      ))}
    </Box>
  );

  return (
    <>
      <Circle
        icon={FaCodeBranch}
        title="Contributions"
        side="left"
        statsList={[
          { value: stats.totalPRs, label: 'Pull Requests Merged' },
        ]}
      />

      <Circle
        icon={FaUsers}
        title="Community"
        side="right"
        statsList={[
          { value: stats.totalRegistrations, label: 'Total Participants' },
        ]}
      />
    </>
  );
}

function Podium({
  winners,
  isLoading,
}: {
  winners: Winner[];
  isLoading?: boolean;
}) {
  const text = opencodeTokens.colors.text.primary;
  const muted = opencodeTokens.colors.text.secondary;
  const glass = 'rgba(28, 16, 36, 0.9)';

  if (isLoading) {
    return (
      <Flex justify="center" align="flex-end" gap="18px" h="280px" mt="32px">
        {[140, 210, 160].map((h, i) => (
          <Skeleton key={i} w="110px" h={`${h}px`} borderRadius="16px 16px 0 0" />
        ))}
      </Flex>
    );
  }

  if (winners.length === 0) {
    return (
      <Box textAlign="center" py="50px">
        <Text fontSize="16px" fontWeight="700" color="#fff1ec">
          No winners recorded yet for this category.
        </Text>
        <Text fontSize="13px" color="#dfced5" opacity={0.8} mt="4px">
          Leaderboard entries will appear here once contributions are scored.
        </Text>
      </Box>
    );
  }

  const order =
    winners.length >= 5
      ? [winners[3], winners[1], winners[0], winners[2], winners[4]].filter(Boolean)
      : winners.length >= 3
      ? [winners[1], winners[0], winners[2]].filter(Boolean)
      : [...winners];

  const heights =
    winners.length >= 5
      ? ['120px', '170px', '230px', '160px', '130px']
      : winners.length >= 3
      ? ['160px', '210px', '140px']
      : ['210px', '160px'];

  return (
    <Box
      width="100vw"
      position="relative"
      left="50%"
      marginLeft="-50vw"
    >
      <Box display="flex" justifyContent="center">
        <Box
          display="grid"
          gridTemplateColumns={`repeat(${order.length}, 120px)`}
          justifyContent="center"
          alignItems="end"
          columnGap="18px"
          mt="32px"
        >
          {order.map((w, i) => (
            <Box key={w.githubid} textAlign="center">
              <Avatar
                src={w.avatarUrl || `https://github.com/${w.githubid}.png`}
                name={w.name}
                size={w.position === 1 ? 'xl' : 'lg'}
                border={`4px solid ${w.color || '#F5C542'}`}
                boxShadow={`0 0 20px ${w.color || '#F5C542'}55`}
                mb="8px"
              />

              <Text fontWeight="800" color={text} fontSize="14px" noOfLines={1} title={w.name}>
                {w.name}
              </Text>
              <Text fontSize="12px" color={muted} mb="8px" noOfLines={1}>
                @{w.githubid}
              </Text>

              <Box
                h={heights[i] || '160px'}
                w="110px"
                bg={w.color || '#F5C542'}
                borderRadius="16px 16px 0 0"
                boxShadow={`0 10px 30px ${w.color || '#F5C542'}44`}
                position="relative"
                overflow="hidden"
                role="group"
              >
                <Flex
                  h="100%"
                  align="center"
                  justify="center"
                  fontSize="24px"
                  fontWeight="900"
                  color="white"
                  transition="opacity 0.2s ease"
                  _groupHover={{ opacity: 0.15 }}
                >
                  #{w.position}
                </Flex>

                <Flex
                  position="absolute"
                  inset={0}
                  direction="column"
                  align="center"
                  justify="center"
                  bg={glass}
                  backdropFilter="blur(12px)"
                  opacity={0}
                  transition="opacity 0.25s ease"
                  _groupHover={{ opacity: 1 }}
                  p="8px"
                >
                  <Text fontSize="11px" color={muted} fontWeight="700">
                    POINTS
                  </Text>
                  <Text fontSize="18px" fontWeight="900" color={text} fontFamily="var(--f-mono)">
                    {w.points.toLocaleString()}
                  </Text>

                  <Box h="6px" />

                  <Text fontSize="11px" color={muted} fontWeight="700">
                    PRs MERGED
                  </Text>
                  <Text fontSize="18px" fontWeight="900" color={text} fontFamily="var(--f-mono)">
                    {w.prmerged.toLocaleString()}
                  </Text>
                </Flex>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function WinnersHeader() {
  return (
    <header className="oc-page-heading" style={{ justifyContent: 'center', textAlign: 'center', marginBottom: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p className="oc-eyebrow" style={{ justifyContent: 'center', margin: '0 0 12px' }}>
          <span />
          <ShinyText text="HALL OF FAME" speed={5} shineColor="#ffded2" />
          <span />
        </p>
        <h1 style={{ textAlign: 'center', margin: '0 0 10px', color: 'var(--fg)', textShadow: '0 2px 20px rgba(0, 0, 0, 0.2)' }}>
          <BlurText text="Legacy of Legends" delay={50} animateBy="words" direction="top" />
        </h1>
        <p className="oc-description" style={{ textAlign: 'center', maxWidth: '540px', margin: 0 }}>
          Top Performers and their Journey through Opencode
        </p>
        <Box
          h="2px"
          w="80px"
          bg="var(--accent)"
          borderRadius="full"
          mt="16px"
          opacity={0.8}
        />
      </div>
    </header>
  );
}

export default function WinnersPodiumComparisonPage() {
  const [tab, setTab] = useState(0);

  // 1. Fetch available events to determine active event name
  const { data: eventData } = useQuery({
    queryKey: ['EventInfo'],
    queryFn: FetchedEvents,
    staleTime: 10 * 60 * 1000,
  });

  const resolvedEventName = useMemo(() => {
    return (
      eventData?.data?.[0]?.name ||
      process.env.NEXT_PUBLIC_EVENT_NAME ||
      "OPENCODE'25"
    );
  }, [eventData]);

  // 2. Fetch live leaderboard data from database/backend
  const {
    data: leaderboardData = [],
    isLoading: isLeaderboardLoading,
  } = useQuery({
    queryKey: ['LeaderboardData', resolvedEventName],
    queryFn: () => FetchedLeaderboard(resolvedEventName),
    staleTime: 3 * 60 * 1000,
  });

  // 3. Derive Overall Winners from database
  const overallWinners: Winner[] = useMemo(() => {
    if (!leaderboardData || leaderboardData.length === 0) return [];
    return leaderboardData.slice(0, 5).map((entry, idx) => ({
      position: Number(entry.position) || idx + 1,
      name: entry.name || entry.githubid,
      githubid: entry.githubid,
      points: Number(entry.points) || 0,
      prmerged: Number(entry.prmerged) || 0,
      avatarUrl: entry.avatarUrl,
      color: OVERALL_COLORS[idx] || RANK_COLORS[idx] || '#F5C542',
    }));
  }, [leaderboardData]);

  // 4. Derive College (IIIT A) Winners from database
  const collegeWinners: Winner[] = useMemo(() => {
    if (!leaderboardData || leaderboardData.length === 0) return [];
    const filtered = leaderboardData.filter((entry) => isIIITA(entry.collegeName));
    return filtered.slice(0, 5).map((entry, idx) => ({
      position: idx + 1,
      name: entry.name || entry.githubid,
      githubid: entry.githubid,
      points: Number(entry.points) || 0,
      prmerged: Number(entry.prmerged) || 0,
      avatarUrl: entry.avatarUrl,
      color: COLLEGE_COLORS[idx] || RANK_COLORS[idx] || '#45c07f',
    }));
  }, [leaderboardData]);

  // 5. Derive Live Community & Contribution Stats
  const stats = useMemo(() => {
    if (!leaderboardData || leaderboardData.length === 0) {
      return { totalPRs: '0', totalRegistrations: '0' };
    }
    const totalPRs = leaderboardData.reduce(
      (acc, curr) => acc + (Number(curr.prmerged) || 0),
      0
    );
    const count = leaderboardData.length;
    return {
      totalPRs: totalPRs.toLocaleString(),
      totalRegistrations: count >= 1000 ? `${(count / 1000).toFixed(1)}k+` : count.toLocaleString(),
    };
  }, [leaderboardData]);

  const activeWinners = tab === 0 ? overallWinners : collegeWinners;

  return (
    <ClickSpark sparkColor="rgba(245, 197, 66, 0.75)" sparkSize={6} sparkRadius={26} sparkCount={7}>
      <Box minH="100vh" position="relative" overflow="hidden" pb="60px">
        <Box position="relative" zIndex={1} maxW="1400px" mx="auto" px={{ base: '16px', md: '24px' }}>
          <Stack spacing="36px">
            <WinnersHeader />

            <TopThreeCards
              winners={activeWinners}
              isLoading={isLeaderboardLoading}
            />

            <Tabs index={tab} onChange={setTab} variant="unstyled">
              <TabList justifyContent="center" gap="14px">
                <Tab
                  borderRadius="full"
                  px="26px"
                  py="10px"
                  fontWeight="700"
                  fontSize="14px"
                  color="#dfced5"
                  border="1px solid rgba(240, 168, 184, 0.2)"
                  bg="rgba(240, 168, 184, 0.06)"
                  backdropFilter="blur(16px)"
                  transition="all 0.3s ease"
                  _selected={{
                    bg: 'linear-gradient(135deg, rgba(240, 168, 184, 0.28), rgba(192, 74, 103, 0.38))',
                    color: '#fff1ec',
                    borderColor: '#f0a8b8',
                    boxShadow: '0 0 20px rgba(240, 168, 184, 0.35)',
                    transform: 'scale(1.03)',
                  }}
                  _hover={{
                    borderColor: '#f0a8b8',
                    bg: 'rgba(240, 168, 184, 0.12)',
                  }}
                >
                  Overall Podium
                </Tab>
                <Tab
                  borderRadius="full"
                  px="26px"
                  py="10px"
                  fontWeight="700"
                  fontSize="14px"
                  color="#dfced5"
                  border="1px solid rgba(240, 168, 184, 0.2)"
                  bg="rgba(240, 168, 184, 0.06)"
                  backdropFilter="blur(16px)"
                  transition="all 0.3s ease"
                  _selected={{
                    bg: 'linear-gradient(135deg, rgba(240, 168, 184, 0.28), rgba(192, 74, 103, 0.38))',
                    color: '#fff1ec',
                    borderColor: '#f0a8b8',
                    boxShadow: '0 0 20px rgba(240, 168, 184, 0.35)',
                    transform: 'scale(1.03)',
                  }}
                  _hover={{
                    borderColor: '#f0a8b8',
                    bg: 'rgba(240, 168, 184, 0.12)',
                  }}
                >
                  IIIT A Podium
                </Tab>
              </TabList>

              <TabPanels mt="8px">
                <TabPanel p="0">
                  <Box position="relative">
                    <OverallSideStats stats={stats} />
                    <Podium
                      winners={overallWinners}
                      isLoading={isLeaderboardLoading}
                    />
                  </Box>
                </TabPanel>

                <TabPanel p="0">
                  <Box position="relative">
                    <OverallSideStats stats={stats} />
                    <Podium
                      winners={collegeWinners}
                      isLoading={isLeaderboardLoading}
                    />
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Stack>
        </Box>
      </Box>
    </ClickSpark>
  );
}
