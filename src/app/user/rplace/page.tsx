'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  HStack,
  VStack,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  Flame,
  Trophy,
  Zap,
  Palette,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import Canvas from '../../../components/Canvas/Canvas';
import BlurText from 'components/reactbits/BlurText';
import PageHeading from 'components/japanese/PageHeading';
import { getApiBase } from 'utils/apiBase';

function getBackendApiUrl() {
  return getApiBase();
}

// ─── Theme constants ───
const SERIF = 'var(--f-display)';
const LIVE_GREEN = 'var(--status-live-text)';

const statTile = {
  p: { base: '14px 16px', md: '18px 20px' },
  borderRadius: '14px',
  bg: 'var(--card-soft)',
  border: '1px solid var(--border)',
  transition: 'all 0.2s ease',
  _hover: { borderColor: 'var(--border-strong)', transform: 'translateY(-2px)' },
} as const;

const tileLabel = {
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--subtle)',
} as const;

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function calculateTier(points: number) {
  if (points >= 400) return { maxPixels: 32, cooldown: 60 };
  if (points >= 300) return { maxPixels: 16, cooldown: 60 };
  if (points >= 150) return { maxPixels: 8, cooldown: 60 };
  if (points >= 50) return { maxPixels: 4, cooldown: 60 };
  return { maxPixels: 2, cooldown: 60 };
}

export default function RPlaceCanvasPage() {
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [maxPixels, setMaxPixels] = useState<number>(2);
  const [cooldown, setCooldown] = useState<number>(60);
  const [userHandle, setUserHandle] = useState<string | null>(null);

  // Fetch participant Leaderboard PR points from backend to determine tier & cooldown perks
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const decoded = parseJwt(token);
    if (!decoded?.id) return;

    const username = decoded.id;
    setUserHandle(username);

    fetch(`${getBackendApiUrl()}/api/v1/participant/${encodeURIComponent(username)}/pr-points`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (body && body.data !== undefined) {
          const points = typeof body.data === 'number' ? body.data : (body.data.points ?? 0);
          setUserPoints(points);
          const tier = calculateTier(points);
          setMaxPixels(tier.maxPixels);
          setCooldown(tier.cooldown);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch leaderboard PR points:', err);
      });
  }, []);

  // Points progress calculation towards max tier (400 pts)
  const points = userPoints ?? 0;
  const targetPoints = 400;
  const isMaxBoost = points >= targetPoints;
  const progressPercent = Math.min(100, Math.max(0, Math.round((points / targetPoints) * 100)));

  const userTier = useMemo(() => ({ maxPixels, cooldown }), [maxPixels, cooldown]);

  return (
    <VStack spacing="24px" align="stretch" w="100%">
      {/* ─── 1. HEADER ─── */}
      <PageHeading
        eyebrow="COMMUNITY CANVAS · OPENCODE 2026"
        title="R/Place Canvas"
        description="Every contribution leaves its mark. Place pixels directly on the live community canvas below, collaborate with other contributors, and use your OpenCode PR points to unlock faster cooldowns and bigger pixel bursts."
        badge={
          <HStack
            spacing="7px"
            px="12px"
            py="5px"
            bg="var(--status-live-bg)"
            border="1px solid var(--status-live-border)"
            borderRadius="full"
            backdropFilter="blur(12px)"
          >
            <Box w="8px" h="8px" borderRadius="full" bg={LIVE_GREEN} className="pulse-live-dot" />
            <Text fontSize="11px" fontWeight="700" color={LIVE_GREEN} letterSpacing="0.12em" fontFamily="var(--f-mono)">
              LIVE NOW
            </Text>
          </HStack>
        }
      >
        巨大画布
      </PageHeading>

      {/* ─── 2. INTERACTIVE HERO CANVAS ─── */}
      <Canvas userTier={userTier} userHandle={userHandle} />

      {/* ─── 3. LEADERBOARD ADVANTAGE & TIERS ─── */}
      <Box className="glass-panel" p={{ base: '20px', sm: '24px', md: '32px' }}>
        <h2
          style={{
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: 'clamp(26px, 3vw, 34px)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: 10,
            color: 'var(--text)',
          }}
        >
          Canvas Powers &amp; Participant Status
        </h2>
        <p className="oc-description">
          OpenCode PR points boost your canvas capabilities. Reach 400+ points to unlock the maximum placement burst
          of 32 pixels with a 60-second cooldown window.
        </p>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: '12px', md: '16px' }} my="24px" w="100%">
          {/* Points */}
          <Box {...statTile}>
            <Flex justify="space-between" align="center" mb="8px">
              <Text {...tileLabel}>Leaderboard Points</Text>
              <Box p="6px" borderRadius="10px" bg="var(--accent-soft)" color="var(--accent)">
                <Flame size={17} />
              </Box>
            </Flex>
            <Text fontFamily={SERIF} fontSize="34px" color="var(--text)" letterSpacing="-0.02em" lineHeight="1.2">
              {userPoints !== null ? userPoints : 0}
            </Text>
            <Text fontSize="12px" color="var(--subtle)" mt="4px">
              {userHandle ? `@${userHandle}` : 'Earned via OpenCode PR merges'}
            </Text>
          </Box>

          {/* Pixels */}
          <Box {...statTile}>
            <Flex justify="space-between" align="center" mb="8px">
              <Text {...tileLabel}>Pixels Available</Text>
              <Box p="6px" borderRadius="10px" bg="rgba(127, 207, 159, 0.14)" color={LIVE_GREEN}>
                <Palette size={17} />
              </Box>
            </Flex>
            <Text fontFamily={SERIF} fontSize="34px" color="var(--text)" letterSpacing="-0.02em" lineHeight="1.2">
              {maxPixels}{' '}
              <Text as="span" fontFamily="var(--f-body)" fontSize="14px" color="var(--muted)">
                {maxPixels === 1 ? 'pixel' : 'pixels'}
              </Text>
            </Text>
            <Text fontSize="12px" color="var(--subtle)" mt="4px">
              Burst capacity per reload
            </Text>
          </Box>

          {/* Cooldown */}
          <Box {...statTile}>
            <Flex justify="space-between" align="center" mb="8px">
              <Text {...tileLabel}>Cooldown</Text>
              <Box p="6px" borderRadius="10px" bg="rgba(230, 194, 122, 0.15)" color="#e6c27a">
                <Zap size={17} />
              </Box>
            </Flex>
            <Text fontFamily={SERIF} fontSize="34px" color="var(--text)" letterSpacing="-0.02em" lineHeight="1.2">
              {cooldown}
              <Text as="span" fontFamily="var(--f-body)" fontSize="14px" color="var(--muted)">
                {' '}
                sec
              </Text>
            </Text>
            <Text fontSize="12px" color="var(--subtle)" mt="4px">
              Cooldown window duration
            </Text>
          </Box>
        </SimpleGrid>

        {/* Progress */}
        <Box
          p={{ base: '14px 16px', md: '18px 20px' }}
          borderRadius="14px"
          bg="var(--card-soft)"
          border="1px solid var(--border)"
          w="100%"
          mb="24px"
        >
          <Flex justify="space-between" align="center" mb="12px" flexWrap="wrap" gap="8px">
            <HStack spacing="10px" flexWrap="wrap">
              <Text fontSize="13px" fontWeight="600" color="var(--text)">
                {isMaxBoost ? 'Max boost unlocked' : `${points} / ${targetPoints} points to unlock 32 pixels`}
              </Text>
              <Box
                px="10px"
                py="2px"
                borderRadius="full"
                fontSize="11px"
                fontWeight="700"
                letterSpacing="0.06em"
                bg={isMaxBoost ? 'rgba(127, 207, 159, 0.16)' : 'var(--accent-soft)'}
                color={isMaxBoost ? LIVE_GREEN : 'var(--accent)'}
                border="1px solid"
                borderColor={isMaxBoost ? 'rgba(127, 207, 159, 0.4)' : 'var(--border-strong)'}
              >
                {isMaxBoost ? 'MAX BOOST' : `${targetPoints - points} PTS TO GO`}
              </Box>
            </HStack>
            <Text fontSize="12px" color="var(--subtle)">
              {isMaxBoost ? '32 pixels · 60s cooldown active' : 'Target: 32 pixels · 60s cooldown'}
            </Text>
          </Flex>

          <Box
            w="100%"
            h="8px"
            borderRadius="full"
            bg="var(--accent-soft)"
            overflow="hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={targetPoints}
            aria-valuenow={Math.min(points, targetPoints)}
          >
            <Box
              h="100%"
              w={`${progressPercent}%`}
              bg="var(--accent)"
              borderRadius="full"
              boxShadow="0 0 12px var(--accent)"
              transition="width 0.4s ease"
            />
          </Box>
        </Box>

        {/* In-app navigation actions */}
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          justify="space-between"
          align={{ base: 'stretch', sm: 'center' }}
          gap="14px"
        >
          <Link
            href="/user/leaderboard/Opencode"
            className="oc-button oc-button-secondary"
            aria-label="View Leaderboard"
          >
            <Trophy size={16} />
            View Leaderboard
          </Link>

          <Link
            href="/user/repos"
            className="oc-button oc-button-secondary"
            aria-label="Explore Repositories"
          >
            Explore Repositories
            <ArrowUpRight size={16} />
          </Link>
        </Flex>
      </Box>
    </VStack>
  );
}