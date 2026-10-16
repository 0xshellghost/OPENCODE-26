'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Flex,
  Grid,
  Icon,
  Text,
} from '@chakra-ui/react';
import { GitMerge, Star, Award, Crown, Shield } from 'lucide-react';
import CountUp from '../../../../components/reactbits/CountUp';

interface CommunityMetricsProps {
  prMerged: number;
  pointsEarned: number;
  rank?: number;
  totalParticipants?: number;
  totalPRsSubmitted?: number;
}

const TIERS = [
  { name: 'Initiate', minPts: 0, color: '#dfced5', icon: Shield },
  { name: 'Challenger', minPts: 500, color: '#63B3ED', icon: Shield },
  { name: 'Master', minPts: 1500, color: '#B794F4', icon: Award },
  { name: 'Grandmaster', minPts: 3000, color: '#FFD700', icon: Crown },
  { name: 'Legend', minPts: 4500, color: '#f0a8b8', icon: Star },
];

export default function CommunityMetrics({
  prMerged = 0,
  pointsEarned = 0,
  rank,
  totalParticipants = 50,
  totalPRsSubmitted,
}: CommunityMetricsProps) {
  // Calculations
  const { currentTier, nextTier, pointsToNextTier, tierProgressPct } = useMemo(() => {
    const revIdx = TIERS.slice().reverse().findIndex((t) => pointsEarned >= t.minPts);
    const tier = revIdx !== -1 ? TIERS[TIERS.length - 1 - revIdx] : TIERS[0];
    const nxt = TIERS.find((t) => t.minPts > pointsEarned);
    const gap = nxt ? nxt.minPts - pointsEarned : 0;

    let pct = 100;
    if (nxt) {
      const prevMin = tier.minPts;
      const range = nxt.minPts - prevMin;
      const progress = pointsEarned - prevMin;
      pct = Math.max(3, Math.min(100, Math.round((progress / range) * 100)));
    }

    return {
      currentTier: tier,
      nextTier: nxt,
      pointsToNextTier: gap,
      tierProgressPct: pct,
    };
  }, [pointsEarned]);

  // Rank & Percentile
  const rankNumber = Number(rank) || 42;
  const totalCount = Math.max(rankNumber, totalParticipants);
  const percentile = Math.max(1, Math.round(((totalCount - rankNumber + 1) / totalCount) * 100));
  const topPercentile = 100 - percentile + 1;

  // Efficiency
  const avgPts = prMerged > 0 ? (pointsEarned / prMerged).toFixed(1) : '0';
  const totalSubmitted = Math.max(prMerged, totalPRsSubmitted || prMerged);
  const mergeRate = totalSubmitted > 0 ? Math.round((prMerged / totalSubmitted) * 100) : 100;

  const statCardBg = 'rgba(240, 168, 184, 0.06)';
  const statBorder = 'rgba(240, 168, 184, 0.2)';

  const CurrentTierIcon = currentTier.icon;

  return (
    <Box h="100%" display="flex" flexDirection="column" justifyContent="space-between">
      {/* Section Title */}
      <Flex justify="space-between" align="center" mb="16px">
        <Text
          fontSize="15px"
          fontWeight="700"
          color="#fff1ec"
        >
          Community Metrics
        </Text>
        <Text fontSize="12px" color="#dfced5" opacity={0.8} fontFamily="var(--f-mono)">
          Season Standings
        </Text>
      </Flex>

      {/* 2x2 Metric Cards Grid */}
      <Grid
        templateColumns="1fr 1fr"
        gap="12px"
        mb="14px"
      >
        {/* 1. Merged PRs */}
        <Box
          bg={statCardBg}
          border="1px solid"
          borderColor={statBorder}
          borderRadius="16px"
          p="14px"
          textAlign="center"
          position="relative"
          overflow="hidden"
          transition="all 0.3s ease"
          _hover={{
            borderColor: '#f0a8b8',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Flex
            position="absolute"
            top="10px"
            left="10px"
            align="center"
            justify="center"
            w="26px"
            h="26px"
            borderRadius="8px"
            bg="rgba(240, 168, 184, 0.15)"
            border="1px solid rgba(240, 168, 184, 0.3)"
          >
            <Icon as={GitMerge} w="13px" h="13px" color="#f0a8b8" />
          </Flex>

          <Text
            fontSize="26px"
            fontWeight="900"
            lineHeight="1"
            color="#fff1ec"
            fontFamily="var(--f-mono)"
            mt="8px"
          >
            <CountUp to={prMerged} duration={1} />
          </Text>
          <Text
            fontSize="12px"
            fontWeight="700"
            color="#dfced5"
            mt="4px"
          >
            Merged PRs
          </Text>
          <Text fontSize="11px" color="#dfced5" opacity={0.7} mt="1px">
            {mergeRate}% merged
          </Text>
        </Box>

        {/* 2. Points Earned */}
        <Box
          bg={statCardBg}
          border="1px solid"
          borderColor={statBorder}
          borderRadius="16px"
          p="14px"
          textAlign="center"
          position="relative"
          overflow="hidden"
          transition="all 0.3s ease"
          _hover={{
            borderColor: '#FFD700',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Flex
            position="absolute"
            top="10px"
            left="10px"
            align="center"
            justify="center"
            w="26px"
            h="26px"
            borderRadius="8px"
            bg="rgba(255, 215, 0, 0.15)"
            border="1px solid rgba(255, 215, 0, 0.3)"
          >
            <Icon as={Star} w="13px" h="13px" color="#FFD700" />
          </Flex>

          <Text
            fontSize="26px"
            fontWeight="900"
            lineHeight="1"
            color="#FFD700"
            fontFamily="var(--f-mono)"
            mt="8px"
          >
            <CountUp to={pointsEarned} duration={1.2} separator="," />
          </Text>
          <Text
            fontSize="12px"
            fontWeight="700"
            color="#dfced5"
            mt="4px"
          >
            Points Earned
          </Text>
          <Text fontSize="11px" color="#dfced5" opacity={0.7} mt="1px">
            Avg {avgPts} pts/PR
          </Text>
        </Box>

        {/* 3. Current Tier */}
        <Box
          bg={statCardBg}
          border="1px solid"
          borderColor={statBorder}
          borderRadius="16px"
          p="14px"
          textAlign="center"
          position="relative"
          overflow="hidden"
          transition="all 0.3s ease"
          _hover={{
            borderColor: currentTier.color,
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Flex
            position="absolute"
            top="10px"
            left="10px"
            align="center"
            justify="center"
            w="26px"
            h="26px"
            borderRadius="8px"
            bg={`${currentTier.color}22`}
            border={`1px solid ${currentTier.color}55`}
          >
            <Icon as={CurrentTierIcon} w="13px" h="13px" color={currentTier.color} />
          </Flex>

          <Text
            fontSize="20px"
            fontWeight="900"
            lineHeight="1"
            color={currentTier.color}
            fontFamily="var(--f-sans)"
            mt="12px"
            noOfLines={1}
          >
            {currentTier.name}
          </Text>
          <Text
            fontSize="12px"
            fontWeight="700"
            color="#dfced5"
            mt="4px"
          >
            Current Tier
          </Text>
          <Text fontSize="11px" color="#dfced5" opacity={0.7} mt="1px">
            {currentTier.minPts.toLocaleString()}+ pts league
          </Text>
        </Box>

        {/* 4. Standing & Percentile */}
        <Box
          bg={statCardBg}
          border="1px solid"
          borderColor={statBorder}
          borderRadius="16px"
          p="14px"
          textAlign="center"
          position="relative"
          overflow="hidden"
          transition="all 0.3s ease"
          _hover={{
            borderColor: '#f0a8b8',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Flex
            position="absolute"
            top="10px"
            left="10px"
            align="center"
            justify="center"
            w="26px"
            h="26px"
            borderRadius="8px"
            bg="rgba(240, 168, 184, 0.15)"
            border="1px solid rgba(240, 168, 184, 0.3)"
          >
            <Icon as={Award} w="13px" h="13px" color="#f0a8b8" />
          </Flex>

          <Text
            fontSize="26px"
            fontWeight="900"
            lineHeight="1"
            color="#fff1ec"
            fontFamily="var(--f-mono)"
            mt="8px"
          >
            #<CountUp to={rankNumber} duration={1} />
          </Text>
          <Text
            fontSize="12px"
            fontWeight="700"
            color="#dfced5"
            mt="4px"
          >
            Standing
          </Text>
          <Text fontSize="11px" color="#f0a8b8" fontWeight="700" mt="1px">
            Top <CountUp to={topPercentile} duration={1.2} />% Contributor
          </Text>
        </Box>
      </Grid>

      {/* Tier Level-Up Progress Box (Fills the remaining height) */}
      <Box
        p="14px 16px"
        borderRadius="16px"
        bg="rgba(20, 12, 24, 0.45)"
        border="1px solid rgba(240, 168, 184, 0.16)"
      >
        <Flex justify="space-between" align="center" mb="8px" fontSize="12px">
          <Flex align="center" gap="6px">
            <Icon as={CurrentTierIcon} w="12px" h="12px" color={currentTier.color} />
            <Text fontWeight="800" color="#fff1ec">
              Tier Progression
            </Text>
          </Flex>
          {nextTier ? (
            <Text fontFamily="var(--f-mono)" fontWeight="700" color="#f0a8b8">
              +<CountUp to={pointsToNextTier} duration={1.2} separator="," /> pts to {nextTier.name}
            </Text>
          ) : (
            <Text fontWeight="700" color="#FFD700">
              ★ Max Tier Reached
            </Text>
          )}
        </Flex>

        {/* Progress Bar */}
        <Box h="7px" w="100%" bg="rgba(240, 168, 184, 0.12)" borderRadius="full" overflow="hidden" mb="6px">
          <Box
            h="100%"
            w={`${tierProgressPct}%`}
            bg={
              nextTier
                ? "linear-gradient(90deg, #f0a8b8 0%, #FFD700 100%)"
                : "linear-gradient(90deg, #FFD700 0%, #f0a8b8 100%)"
            }
            borderRadius="full"
            transition="width 0.6s ease"
          />
        </Box>

        <Flex justify="space-between" fontSize="11px" color="#dfced5" opacity={0.8}>
          <Text>{currentTier.name} ({currentTier.minPts} pts)</Text>
          <Text>{nextTier ? `${nextTier.name} (${nextTier.minPts} pts)` : 'Legend (4,500+)'}</Text>
        </Flex>
      </Box>
    </Box>
  );
}
