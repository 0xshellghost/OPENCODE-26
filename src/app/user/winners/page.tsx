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
import { Line } from 'react-chartjs-2';
import {
  FaCrown,
  FaTrophy,
  FaMedal,
  FaStar,
  FaAward,
} from 'react-icons/fa';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);


type Winner = {
  position: number;
  name: string;
  githubid: string;
  points: number;
  prmerged: number;
  color?: string
};

type RawPoint = {
  date: string;
  points: number;
};

const OVERALL_COLORS = [
  '#c65eaf',
  '#b4aea2',
  '#3e3b40',

];

const COLLEGE_COLORS = [
  '#45c07f',
  '#e690a2',
  '#b4aea2',
  '#8a32cd',
  '#F5C542',

];
const RANK_COLORS = [
  '#c65eaf',
  '#b4aea2',
  '#3e3b40',
  '#8a32cd',
  '#F5C542',
]


const OVERALL_WINNERS: Winner[] = [
  { position: 1, name: 'Ishan Raj Singh', githubid: 'ishanrajsingh', points: 5110, prmerged: 195, color: OVERALL_COLORS[0] },
  { position: 2, name: 'Apoorv Mittal', githubid: 'Apoorv012', points: 4585, prmerged: 177, color: OVERALL_COLORS[1] },
  { position: 3, name: 'Prashant Kumar Dwivedi', githubid: 'dwivediprashant', points: 4485, prmerged: 171, color: OVERALL_COLORS[2] },
];

const COLLEGE_WINNERS: Winner[] = [
  { position: 1, name: 'Krishna Sikheriya', githubid: 'Krishna200608', points: 3095, prmerged: 48, color: COLLEGE_COLORS[0] },
  { position: 2, name: 'Vishva Modh', githubid: 'ViMo018', points: 2590, prmerged: 41, color: COLLEGE_COLORS[2] },
  { position: 2, name: 'Ibrahim Raza Beg', githubid: 'PHOX-9', points: 2590, prmerged: 36, color: COLLEGE_COLORS[1] },
  { position: 3, name: 'Omdeep', githubid: 'omicoded19', points: 1160, prmerged: 29, color: COLLEGE_COLORS[3] },
  { position: 4, name: 'Khushi Shorey', githubid: 'khushishorey', points: 1100, prmerged: 22, color: COLLEGE_COLORS[4] },
];

// Removed WinnersBackground as layout handles JapaneseBackground variant="winners"

function VictorySideIcons() {
  const color = opencodeTokens.colors.text.secondary;

  const Icon = ({
    IconComp,
    top,
    side,
    size = 64,
  }: {
    IconComp: any;
    top: string;
    side: 'left' | 'right';
    size?: number;
  }) => (
    <Box
      position="absolute"
      top={top}
      {...(side === 'left'
        ? { left: '48px' }
        : { right: '48px' })}
      fontSize={`${size}px`}
      opacity={0.22}
      color={color}
      pointerEvents="none"
      userSelect="none"
      display={{ base: 'none', lg: 'block' }}
      filter="blur(0.4px)"
    >
      <IconComp />
    </Box>
  );

  return (
    <>
      {/* LEFT SIDE */}
      <Icon IconComp={FaCrown} top="18%" side="left" size={70} />
      <Icon IconComp={FaStar} top="45%" side="left" size={58} />
      <Icon IconComp={FaAward} top="70%" side="left" size={64} />

      {/* RIGHT SIDE */}
      <Icon IconComp={FaTrophy} top="20%" side="right" size={72} />
      <Icon IconComp={FaMedal} top="48%" side="right" size={60} />
      <Icon IconComp={FaStar} top="74%" side="right" size={56} />
    </>
  );
}



function TopThreeCards({ winners }: { winners: Winner[] }) {
  const bg = opencodeTokens.colors.background.glassDark;
  const text = opencodeTokens.colors.text.primary;
  const muted = opencodeTokens.colors.text.secondary;
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <Flex justify="center" gap="28px" wrap="wrap" mt="28px">
      {winners.slice(0, 3).map((w, i) => (
        <Box
          key={w.githubid}
          className="glass-panel"
          borderRadius="22px"
          px="26px"
          py="22px"
          minW="270px"
          boxShadow={`0 10px 30px ${RANK_COLORS[w.position - 1]}33`}
          border={`1px solid ${RANK_COLORS[w.position - 1]}66`}
          position="relative"
        >
          {/* ===== ICONS ===== */}
          <Flex
            position="absolute"
            top="-20px"
            right="18px"
            gap="6px"
            fontSize="32px"
          >

            <span>{medals[i]}</span>
          </Flex>

          {/* ===== USER ===== */}
          <Flex align="center" gap="14px" mb="14px">
            <Avatar
              src={`https://github.com/${w.githubid}.png`}
              size="md"
              border={`3px solid ${RANK_COLORS[w.position - 1]}`}
            />
            <Box>
              <Text fontWeight="800" color={text}>
                {w.name}
              </Text>
              <Text fontSize="12px" color={muted}>
                @{w.githubid}
              </Text>
            </Box>
          </Flex>

          {/* ===== STATS ===== */}
          <Flex justify="space-between" mt="10px">
            <Box>
              <Text fontSize="11px" color={muted}>
                POINTS
              </Text>
              <Text fontSize="22px" fontWeight="900" color={text}>
                {w.points}
              </Text>
            </Box>

            <Box textAlign="right">
              <Text fontSize="11px" color={muted}>
                PRs MERGED
              </Text>
              <Text fontSize="22px" fontWeight="900" color={text}>
                {w.prmerged}
              </Text>
            </Box>
          </Flex>
        </Box>
      ))}
    </Flex>
  );
}

import { FaCodeBranch, FaUsers } from 'react-icons/fa';

function OverallSideStats() {
  const glass = opencodeTokens.colors.background.glassLight;
  const text = opencodeTokens.colors.text.primary;
  const muted = opencodeTokens.colors.text.secondary;

  const Circle = ({
    icon: Icon,
    title,
    stats,
    side,
  }: {
    icon: any;
    title: string;
    stats: { value: string; label: string }[];
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
      backdropFilter="blur(14px)"
      border="1px solid rgba(255,255,255,0.25)"
      boxShadow="0 20px 40px rgba(0,0,0,0.08)"
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      gap="10px"
      textAlign="center"
      zIndex={1}
    >

      <Box
        fontSize="30px"
        color="#F5C542"
        mb="6px"
        filter="drop-shadow(0 0 12px rgba(245,197,66,0.35))"
      >
        <Icon />
      </Box>


      <Text
        fontSize="11px"
        letterSpacing="0.14em"
        textTransform="uppercase"
        color={muted}
      >
        {title}
      </Text>


      {stats.map((s) => (
        <Box key={s.label}>
          <Text fontSize="22px" fontWeight="900" color={text}>
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
        stats={[
          { value: '3,768', label: 'Pull Requests Raised' },

        ]}
      />


      <Circle
        icon={FaUsers}
        title="Community"
        side="right"
        stats={[
          { value: '1,000+', label: 'Total Registrations' },
        ]}
      />
    </>
  );
}




async function fetchProgress(githubId: string) {
  const res = await fetch(
    `https://events.geekhaven.in/back/api/v1/leaderboard/progress/${githubId}?eventName=Opencode`,
  );
  const json = await res.json();
  return json.data.data as RawPoint[];
}



function buildDateRange(start: string, end: string) {
  const dates: string[] = [];
  let d = new Date(start);
  const endDate = new Date(end);
  while (d <= endDate) {
    dates.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function normalizeProgress(raw: RawPoint[], labels: string[]) {
  const map = new Map<string, number>();
  raw
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .forEach((r) => map.set(r.date.slice(0, 10), r.points));

  let current = 0;
  return labels.map((d) => {
    if (map.has(d)) current = map.get(d)!;
    return current;
  });
}



function Podium({ winners, colors }: { winners: Winner[]; colors: string[] }) {
  const text = opencodeTokens.colors.text.primary;
  const muted = opencodeTokens.colors.text.secondary;
  const glass = opencodeTokens.colors.background.glassLight;

  const order =
    winners.length === 3
      ? [winners[1], winners[0], winners[2]]
      : [winners[3], winners[1], winners[0], winners[2], winners[4]];

  const heights =
    winners.length === 3
      ? ['160px', '210px', '140px']
      : ['120px', '170px', '230px', '160px', '130px'];

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
                src={`https://github.com/${w.githubid}.png`}
                size={w.position === 1 ? 'xl' : 'lg'}
                border={`4px solid ${w.color}`}
                mb="8px"
              />

              <Text fontWeight="800" color={text}>
                {w.name}
              </Text>
              <Text fontSize="12px" color={muted} mb="8px">
                @{w.githubid}
              </Text>

              <Box
                h={heights[i]}
                w="110px"
                bg={w.color}
                borderRadius="16px 16px 0 0"
                boxShadow="xl"
                position="relative"
                overflow="hidden"
                role="group"
              >

                <Flex
                  h="100%"
                  align="center"
                  justify="center"
                  fontSize="22px"
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
                  backdropFilter="blur(8px)"
                  opacity={0}
                  transition="opacity 0.25s ease"
                  _groupHover={{ opacity: 1 }}
                >
                  <Text fontSize="12px" color={muted}>
                    POINTS
                  </Text>
                  <Text fontSize="20px" fontWeight="900" color={text}>
                    {w.points}
                  </Text>

                  <Box h="8px" />

                  <Text fontSize="12px" color={muted}>
                    PRs MERGED
                  </Text>
                  <Text fontSize="20px" fontWeight="900" color={text}>
                    {w.prmerged}
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
  const titleColor = opencodeTokens.colors.text.primary;
  const subtitleColor = opencodeTokens.colors.text.secondary;
  const dividerColor = opencodeTokens.colors.accent.sakura;

  return (
    <Stack spacing="12px" align="center" mt="20px">



      <Text
        fontSize={{ base: '32px', md: '48px' }}
        fontWeight="400"
        lineHeight="1.1"
        className="text-sakura-gradient"
        textAlign="center"
      >
        Legacy of Legends
      </Text>


      <Text
        fontSize="14px"
        color={subtitleColor}
        textAlign="center"
        maxW="420px"
      >
        Top Performers and their Journey through Opencode
      </Text>
      <Box
        h="2px"
        w="120px"
        bg={dividerColor}
        borderRadius="full"
        mt="6px"
      />
    </Stack>
  );
}



export default function WinnersPodiumComparisonPage() {
  const [tab, setTab] = useState(0);
  const users = tab === 0 ? OVERALL_WINNERS : COLLEGE_WINNERS;

  const labels = useMemo(
    () => buildDateRange('2025-12-26', '2026-01-31'),
    [],
  );

  const query = useQuery({
    queryKey: ['progress', tab],
    queryFn: () => Promise.all(users.map((u) => fetchProgress(u.githubid))),
  });

  const chartData = useMemo(() => {
    if (!query.data) return null;
    const colors = tab === 0 ? OVERALL_COLORS : COLLEGE_COLORS;
    return {
      labels,
      datasets: users.map((u, i) => {
        const col = u.color ?? colors[i];
        return ({
          label: u.name,
          data: normalizeProgress(query.data[i], labels),
          borderColor: col,
          backgroundColor: `${col}33`,
          fill: true,
          tension: 0.35,
          pointRadius: 2,
        });
      }),
    };
  }, [query.data, users, labels]);

  return (
    <Box minH="100vh" position="relative" overflow="hidden">
      <Box position="relative" zIndex={1}>

        <Stack spacing="36px">
          <WinnersHeader />

          <TopThreeCards
            winners={tab === 0 ? OVERALL_WINNERS : COLLEGE_WINNERS}
          />

          <Tabs index={tab} onChange={setTab} variant="soft-rounded" colorScheme="purple">
            <TabList>
              <Tab>Overall</Tab>
              <Tab>IIIT A</Tab>
            </TabList>



            <TabPanels>
              <TabPanel>
                <Box position="relative">
                  <OverallSideStats />
                  <Podium
                    winners={OVERALL_WINNERS.slice(0, 3)}
                    colors={OVERALL_COLORS}
                  />
                </Box>
              </TabPanel>

              <TabPanel>
                <Box position="relative">
                  <OverallSideStats />
                  <Podium winners={COLLEGE_WINNERS.slice(0, 5)} colors={COLLEGE_COLORS} />
                </Box>

              </TabPanel>
            </TabPanels>
          </Tabs>

          {(query.isLoading || (chartData && !query.isError)) && (
            <Box h="380px">
              {query.isLoading && <Skeleton h="100%" />}
              {!query.isLoading && chartData && (
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    scales: { x: { ticks: { maxTicksLimit: 8 } } },
                  }}
                />
              )}
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
