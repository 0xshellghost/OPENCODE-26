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

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ─── Theme constants ───
const SERIF = "Georgia, 'Times New Roman', serif";
const LIVE_GREEN = '#7fcf9f';

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
  if (points >= 100) return { maxPixels: 10, cooldown: 5 };
  if (points >= 50) return { maxPixels: 5, cooldown: 10 };
  if (points >= 20) return { maxPixels: 3, cooldown: 15 };
  if (points >= 10) return { maxPixels: 2, cooldown: 30 };
  return { maxPixels: 1, cooldown: 60 };
}

export default function RPlaceCanvasPage() {
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [maxPixels, setMaxPixels] = useState<number>(1);
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

    fetch(`${BACKEND_API_URL}/api/v1/participant/${encodeURIComponent(username)}/pr-points`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (body && body.data) {
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

  // Points progress calculation towards max tier (100 pts)
  const points = userPoints ?? 0;
  const targetPoints = 100;
  const isMaxBoost = points >= targetPoints;
  const progressPercent = Math.min(100, Math.max(0, Math.round((points / targetPoints) * 100)));

  const userTier = useMemo(() => ({ maxPixels, cooldown }), [maxPixels, cooldown]);

  return (
    <VStack spacing="24px" align="stretch" w="100%">
      {/* ─── 1. HEADER ─── */}
      <div className="oc-page-heading" style={{ marginBottom: 0, width: '100%' }}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'stretch', md: 'center' }}
          justify="space-between"
          gap={{ base: '16px', md: '24px' }}
          w="100%"
        >
          <Box flex="1" minW={0}>
            <p className="oc-eyebrow">
              <span />
              Community Canvas · OpenCode 2026
            </p>

            <Flex align="center" gap="14px" flexWrap="wrap" mb="14px">
              <h1 style={{ marginBottom: 0 }}>R/Place Canvas</h1>
              <HStack
                spacing="6px"
                px="10px"
                py="4px"
                bg="rgba(127, 207, 159, 0.12)"
                border="1px solid rgba(127, 207, 159, 0.35)"
                borderRadius="full"
              >
                <Box w="7px" h="7px" borderRadius="full" bg={LIVE_GREEN} className="pulse-live-dot" />
                <Text fontSize="11px" fontWeight="700" color={LIVE_GREEN} letterSpacing="0.1em">
                  LIVE
                </Text>
              </HStack>
            </Flex>

            <p className="oc-description">
              Every contribution leaves its mark. Place pixels directly on the live community canvas below,
              collaborate with other contributors, and use your OpenCode PR points to unlock faster cooldowns and bigger pixel bursts.
            </p>
          </Box>
        </Flex>
      </div>

      {/* ─── 2. INTERACTIVE HERO CANVAS ─── */}
      <Canvas userTier={userTier} userHandle={userHandle} />

      {/* ─── 3. LEADERBOARD ADVANTAGE & TIERS ─── */}
      <Box className="glass-panel" p={{ base: '20px', sm: '24px', md: '32px' }}>
        <p className="oc-eyebrow">
          <span />
          Leaderboard Advantage
        </p>
        <h2
          style={{
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: 'clamp(26px, 3vw, 34px)',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            marginBottom: 10,
            color: 'var(--text)',
          }}
        >
          Canvas Powers &amp; Participant Status
        </h2>
        <p className="oc-description">
          OpenCode PR points boost your canvas capabilities. Reach 100+ points to unlock the maximum placement burst
          of 10 pixels with a rapid 5-second cooldown.
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
              <Text as="span" fontFamily="'DM Sans', sans-serif" fontSize="14px" color="var(--muted)">
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
              <Text as="span" fontFamily="'DM Sans', sans-serif" fontSize="14px" color="var(--muted)">
                {' '}
                sec
              </Text>
            </Text>
            <Text fontSize="12px" color="var(--subtle)" mt="4px">
              Cooldown duration per pixel drop
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
                {isMaxBoost ? 'Max boost unlocked' : `${points} / ${targetPoints} points to unlock 10 pixels`}
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
              {isMaxBoost ? '10 pixels · 5s cooldown active' : 'Target: 10 pixels · 5s cooldown'}
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