'use client';

import {
  Avatar,
  Box,
  Flex,
  Skeleton,
  Spinner,
  Stack,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Text,
} from '@chakra-ui/react';
import { Trophy, Medal, Award } from 'lucide-react';
import { opencodeTokens } from '../../../theme/opencode-tokens';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFeatures } from 'contexts/FeaturesContext';
import { isAdminUser } from 'utils/jwt';
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
      <Flex justify="center" gap={{ base: '16px', md: '28px' }} wrap="wrap" mt="28px">
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            borderRadius="22px"
            px={{ base: '18px', sm: '26px' }}
            py={{ base: '18px', sm: '22px' }}
            w={{ base: '100%', sm: 'auto' }}
            minW={{ base: '100%', sm: '260px' }}
            maxW={{ base: '100%', sm: '320px' }}
            bg="var(--surface)"
            border="1px solid var(--border)"
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
    <Flex justify="center" gap={{ base: '16px', md: '28px' }} wrap="wrap" mt="28px">
      {winners.slice(0, 3).map((w, i) => (
        <Box
          key={w.githubid}
          borderRadius="20px"
          px={{ base: '18px', sm: '24px' }}
          py={{ base: '18px', sm: '20px' }}
          w={{ base: '100%', sm: 'auto' }}
          minW={{ base: '100%', sm: '260px' }}
          maxW={{ base: '100%', sm: '320px' }}
          flex={{ base: '1 1 100%', sm: '1 1 260px' }}
          bg="var(--surface)"
          backdropFilter="blur(20px)"
          boxShadow="var(--shadow)"
          border={`1px solid ${w.color || RANK_COLORS[w.position - 1] || '#F5C542'}40`}
          position="relative"
          transition="transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease"
          _hover={{
            transform: 'translateY(-2px)',
            borderColor: w.color || RANK_COLORS[w.position - 1] || '#F5C542',
          }}
        >
          {/* ===== MEDAL BADGE (Vector SVG) ===== */}
          <Flex
            position="absolute"
            top="14px"
            right="14px"
            align="center"
            gap="5px"
            px="9px"
            py="3px"
            borderRadius="full"
            bg="var(--surface-2)"
            border={`1px solid ${w.color || RANK_COLORS[w.position - 1] || '#F5C542'}55`}
            color={w.color || RANK_COLORS[w.position - 1] || '#F5C542'}
            fontSize="11px"
            fontWeight="700"
            fontFamily="var(--f-mono)"
          >
            {i === 0 ? <Trophy size={13} /> : <Medal size={13} />}
            <span>#{w.position}</span>
          </Flex>

          {/* ===== USER INFO ===== */}
          <Flex align="center" gap="14px" mb="14px" pr="60px">
            <Avatar
              src={w.avatarUrl || `https://github.com/${w.githubid}.png`}
              name={w.name}
              size="md"
              border={`2.5px solid ${w.color || RANK_COLORS[w.position - 1] || '#F5C542'}`}
              boxShadow={`0 0 12px ${w.color || RANK_COLORS[w.position - 1] || '#F5C542'}33`}
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

function OverallSideStats({ stats }: { stats: { totalPRs: number; totalRegistrations: number } }) {
  const glass = 'var(--surface)';
  const text = opencodeTokens.colors.text.primary;
  const muted = opencodeTokens.colors.text.secondary;

  return (
    <Flex
      direction={{ base: 'column', sm: 'row' }}
      align="center"
      justify="center"
      gap={{ base: '12px', sm: '20px' }}
      my="20px"
      w="100%"
      maxW="680px"
      mx="auto"
    >
      <Box
        flex="1"
        w="100%"
        p="14px 18px"
        borderRadius="16px"
        bg={glass}
        border="1px solid var(--border)"
        boxShadow="var(--shadow)"
        backdropFilter="blur(16px)"
        display="flex"
        alignItems="center"
        gap="14px"
      >
        <Box p="9px" borderRadius="10px" bg="var(--accent-soft)" color="var(--accent)" flexShrink={0}>
          <FaCodeBranch size={17} />
        </Box>
        <Box minW="0">
          <Text fontSize="10px" letterSpacing="0.12em" textTransform="uppercase" fontWeight="700" color={muted}>
            Contributions
          </Text>
          <Text fontSize="20px" fontWeight="900" color={text} fontFamily="var(--f-mono)" lineHeight="1.2">
            <CountUp to={stats.totalPRs} separator="," duration={1.2} />
          </Text>
          <Text fontSize="11px" color={muted}>
            Pull Requests Merged
          </Text>
        </Box>
      </Box>

      <Box
        flex="1"
        w="100%"
        p="14px 18px"
        borderRadius="16px"
        bg={glass}
        border="1px solid var(--border)"
        boxShadow="var(--shadow)"
        backdropFilter="blur(16px)"
        display="flex"
        alignItems="center"
        gap="14px"
      >
        <Box p="9px" borderRadius="10px" bg="var(--secondary-soft)" color="var(--secondary)" flexShrink={0}>
          <FaUsers size={17} />
        </Box>
        <Box minW="0">
          <Text fontSize="10px" letterSpacing="0.12em" textTransform="uppercase" fontWeight="700" color={muted}>
            Community
          </Text>
          <Text fontSize="20px" fontWeight="900" color={text} fontFamily="var(--f-mono)" lineHeight="1.2">
            <CountUp to={stats.totalRegistrations} separator="," duration={1.2} />
          </Text>
          <Text fontSize="11px" color={muted}>
            Total Participants
          </Text>
        </Box>
      </Box>
    </Flex>
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
  const glass = 'var(--card-bg)';

  if (isLoading) {
    return (
      <Flex justify="center" align="flex-end" gap={{ base: '8px', sm: '14px', md: '18px' }} h="280px" mt="32px">
        {[140, 210, 160].map((h, i) => (
          <Skeleton key={i} w={{ base: '65px', sm: '90px', md: '110px' }} h={`${h}px`} borderRadius="16px 16px 0 0" />
        ))}
      </Flex>
    );
  }

  if (winners.length === 0) {
    return (
      <div className="glass-panel oc-empty" style={{ margin: '32px 0' }}>
        <Trophy size={36} />
        <h2>No winners recorded yet</h2>
        <p>Leaderboard entries and winners will appear here once contributions are scored for this category.</p>
      </div>
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
      width="100%"
      position="relative"
      overflowX="auto"
      py="8px"
    >
      <Box display="flex" justifyContent="center" px={{ base: '8px', sm: '16px' }} minW="fit-content">
        <Box
          display="grid"
          gridTemplateColumns={{
            base: `repeat(${order.length}, minmax(60px, 80px))`,
            sm: `repeat(${order.length}, 100px)`,
            md: `repeat(${order.length}, 120px)`,
          }}
          justifyContent="center"
          alignItems="end"
          columnGap={{ base: '8px', sm: '14px', md: '18px' }}
          mt="32px"
        >
          {order.map((w, i) => (
            <Box key={w.githubid} textAlign="center" minW={0}>
              <Avatar
                src={w.avatarUrl || `https://github.com/${w.githubid}.png`}
                name={w.name}
                size={w.position === 1 ? { base: 'md', md: 'xl' } : { base: 'sm', md: 'lg' }}
                border={`4px solid ${w.color || '#F5C542'}`}
                boxShadow={`0 0 20px ${w.color || '#F5C542'}55`}
                mb="8px"
              />

              <Text fontWeight="800" color={text} fontSize={{ base: '11px', sm: '13px', md: '14px' }} noOfLines={1} title={w.name}>
                {w.name}
              </Text>
              <Text fontSize={{ base: '10px', sm: '11px', md: '12px' }} color={muted} mb="8px" noOfLines={1}>
                @{w.githubid}
              </Text>

              <Box
                h={heights[i] || '160px'}
                w={{ base: '65px', sm: '90px', md: '110px' }}
                mx="auto"
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
                  fontSize={{ base: '18px', md: '24px' }}
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
                  p={{ base: '4px', md: '8px' }}
                >
                  <Text fontSize={{ base: '9px', md: '11px' }} color={muted} fontWeight="700">
                    POINTS
                  </Text>
                  <Text fontSize={{ base: '12px', md: '18px' }} fontWeight="900" color={text} fontFamily="var(--f-mono)">
                    <CountUp to={w.points} separator="," duration={1} />
                  </Text>

                  <Box h={{ base: '2px', md: '6px' }} />

                  <Text fontSize={{ base: '9px', md: '11px' }} color={muted} fontWeight="700">
                    PRs
                  </Text>
                  <Text fontSize={{ base: '12px', md: '18px' }} fontWeight="900" color={text} fontFamily="var(--f-mono)">
                    <CountUp to={w.prmerged} separator="," duration={1} />
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
    <header style={{ textAlign: 'center', marginBottom: '32px', paddingBottom: '28px', borderBottom: '1px solid var(--line)', maxWidth: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '100%', width: '100%' }}>
        <h1
          style={{
            fontFamily: 'var(--f-display)',
            fontWeight: 300,
            fontSize: 'var(--fs-page-title, clamp(32px, 5.5vw, 54px))',
            lineHeight: 1.15,
            letterSpacing: '0.01em',
            textAlign: 'center',
            margin: '0 0 10px',
            color: 'var(--fg)',
            maxWidth: '100%',
            wordBreak: 'break-word',
            textWrap: 'balance',
          }}
        >
          <BlurText text="Legacy of Legends" delay={50} animateBy="words" direction="top" />
        </h1>
        <p className="oc-description" style={{ textAlign: 'center', maxWidth: '540px', margin: 0 }}>
          Top Performers and their Journey through Opencode
        </p>
      </div>
    </header>
  );
}

export default function WinnersPodiumComparisonPage() {
  const [tab, setTab] = useState(0);
  const router = useRouter();
  const { features, isLoading: isFeaturesLoading } = useFeatures();

  useEffect(() => {
    if (isFeaturesLoading) return;
    if (!features.showWinners && !isAdminUser()) {
      router.replace('/user/events');
    }
  }, [isFeaturesLoading, features.showWinners, router]);

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
      name: entry.name || entry.githubid || 'Participant',
      githubid: entry.githubid || '',
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
      name: entry.name || entry.githubid || 'Participant',
      githubid: entry.githubid || '',
      points: Number(entry.points) || 0,
      prmerged: Number(entry.prmerged) || 0,
      avatarUrl: entry.avatarUrl,
      color: COLLEGE_COLORS[idx] || RANK_COLORS[idx] || '#45c07f',
    }));
  }, [leaderboardData]);

  // 5. Derive Live Community & Contribution Stats
  const stats = useMemo(() => {
    if (!leaderboardData || leaderboardData.length === 0) {
      return { totalPRs: 0, totalRegistrations: 0 };
    }
    const totalPRs = leaderboardData.reduce(
      (acc, curr) => acc + (Number(curr.prmerged) || 0),
      0
    );
    const count = leaderboardData.length;
    return {
      totalPRs,
      totalRegistrations: count,
    };
  }, [leaderboardData]);

  const activeWinners = tab === 0 ? overallWinners : collegeWinners;

  if (isFeaturesLoading) {
    return (
      <Flex minH="60vh" align="center" justify="center">
        <Spinner size="xl" color="var(--accent)" />
      </Flex>
    );
  }

  if (!features.showWinners && !isAdminUser()) {
    return null;
  }

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
              <TabList justifyContent="center" gap={{ base: '8px', sm: '14px' }}>
                <Tab
                  borderRadius="full"
                  px={{ base: '18px', md: '26px' }}
                  py={{ base: '8px', md: '10px' }}
                  fontWeight="700"
                  fontSize={{ base: '12px', md: '14px' }}
                  color="var(--muted)"
                  border="1px solid var(--border)"
                  bg="var(--card-soft)"
                  backdropFilter="blur(16px)"
                  transition="all 0.3s ease"
                  _selected={{
                    bg: 'var(--accent)',
                    color: 'var(--accent-ink)',
                    borderColor: 'var(--accent)',
                    boxShadow: '0 0 20px var(--accent-soft)',
                    transform: 'scale(1.03)',
                  }}
                  _hover={{
                    borderColor: 'var(--accent)',
                    bg: 'var(--accent-soft)',
                  }}
                >
                  Overall Podium
                </Tab>
                <Tab
                  borderRadius="full"
                  px={{ base: '18px', md: '26px' }}
                  py={{ base: '8px', md: '10px' }}
                  fontWeight="700"
                  fontSize={{ base: '12px', md: '14px' }}
                  color="var(--muted)"
                  border="1px solid var(--border)"
                  bg="var(--card-soft)"
                  backdropFilter="blur(16px)"
                  transition="all 0.3s ease"
                  _selected={{
                    bg: 'var(--accent)',
                    color: 'var(--accent-ink)',
                    borderColor: 'var(--accent)',
                    boxShadow: '0 0 20px var(--accent-soft)',
                    transform: 'scale(1.03)',
                  }}
                  _hover={{
                    borderColor: 'var(--accent)',
                    bg: 'var(--accent-soft)',
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
