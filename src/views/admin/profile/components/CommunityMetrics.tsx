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

export interface CommunityMetricsProps {
  prMerged: number;
  pointsEarned: number;
  rank?: number | null;
  totalParticipants?: number;
  totalPRsSubmitted?: number;
  isStaffOrMentor?: boolean;
}

export const TIERS = [
  { name: 'Initiate', minPts: 0, color: '#AEBCC7', icon: Shield },
  { name: 'Challenger', minPts: 500, color: '#63B3ED', icon: Shield },
  { name: 'Master', minPts: 1500, color: '#B794F4', icon: Award },
  { name: 'Grandmaster', minPts: 3000, color: '#FFD700', icon: Crown },
  { name: 'Legend', minPts: 4500, color: '#B8E5D5', icon: Star },
] as const;

export default function CommunityMetrics({
  prMerged = 0,
  pointsEarned = 0,
  rank,
  totalParticipants = 0,
  totalPRsSubmitted,
  isStaffOrMentor = false,
}: CommunityMetricsProps) {
  // Safe numerical normalization
  const safeMerged = Math.max(0, Number(prMerged) || 0);
  const safePoints = Math.max(0, Number(pointsEarned) || 0);
  const safeTotalPRs = totalPRsSubmitted !== undefined ? Math.max(safeMerged, Number(totalPRsSubmitted) || 0) : safeMerged;

  // Tier Calculations based on actual points
  const { currentTier, nextTier, pointsToNextTier, tierProgressPct } = useMemo(() => {
    const revIdx = TIERS.slice().reverse().findIndex((t) => safePoints >= t.minPts);
    const tier = revIdx !== -1 ? TIERS[TIERS.length - 1 - revIdx] : TIERS[0];
    const nxt = TIERS.find((t) => t.minPts > safePoints) || null;
    const gap = nxt ? Math.max(0, nxt.minPts - safePoints) : 0;

    let pct = 100;
    if (nxt) {
      const prevMin = tier.minPts;
      const range = nxt.minPts - prevMin;
      const progress = safePoints - prevMin;
      pct = Math.max(0, Math.min(100, Math.round((progress / range) * 100)));
    }

    return {
      currentTier: tier,
      nextTier: nxt,
      pointsToNextTier: gap,
      tierProgressPct: pct,
    };
  }, [safePoints]);

  // Rank & Percentile Logic
  // A participant is competitively ranked if rank is a positive number and they have points > 0
  const isCompetitivelyRanked = !isStaffOrMentor && typeof rank === 'number' && rank > 0 && safePoints > 0;
  const rankNumber = isCompetitivelyRanked ? rank : null;

  const topPercentile = useMemo(() => {
    if (!isCompetitivelyRanked || !rankNumber || !totalParticipants || totalParticipants <= 0) {
      return null;
    }
    const pct = Math.ceil((rankNumber / totalParticipants) * 100);
    return Math.max(1, Math.min(100, pct));
  }, [isCompetitivelyRanked, rankNumber, totalParticipants]);

  // Merge Rate & Contribution Efficiency
  const avgPts = safeMerged > 0 ? (safePoints / safeMerged).toFixed(1) : '0';
  const mergeRate = safeTotalPRs > 0 ? Math.round((safeMerged / safeTotalPRs) * 100) : 0;

  const statCardBg = 'var(--card-soft)';
  const statBorder = 'var(--border)';

  const CurrentTierIcon = currentTier.icon;

  return (
    <Box h="100%" display="flex" flexDirection="column" justifyContent="space-between">
      {/* Section Title */}
      <Flex
        justify="space-between"
        align="center"
        mb="20px"
        pb="12px"
        borderBottom="1px solid rgba(174, 188, 199, 0.12)"
      >
        <Text
          fontSize="16px"
          fontWeight="700"
          color="var(--fg)"
          letterSpacing="0.02em"
        >
          Community Metrics
        </Text>
        <Text fontSize="12px" color="var(--muted)" fontFamily="var(--f-mono)" letterSpacing="0.08em" textTransform="uppercase">
          Season Standings
        </Text>
      </Flex>

      {/* 2x2 Metric Cards Grid */}
      <Grid
        templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }}
        gap={{ base: '14px', md: '18px' }}
        mb={{ base: '16px', md: '20px' }}
      >
        {/* 1. Merged PRs */}
        <Box
          bg={statCardBg}
          border="1px solid"
          borderColor={statBorder}
          borderRadius="20px"
          p={{ base: '18px 20px', md: '22px 24px' }}
          position="relative"
          overflow="hidden"
          transition="all 0.3s ease"
          _hover={{
            borderColor: 'var(--accent)',
            transform: 'translateY(-2px)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <Flex justify="space-between" align="flex-start">
            <Text
              fontSize={{ base: '28px', md: '34px' }}
              fontWeight="900"
              lineHeight="1"
              color="var(--fg)"
              fontFamily="var(--f-mono)"
            >
              <CountUp to={safeMerged} duration={1} />
            </Text>
            <Flex
              align="center"
              justify="center"
              w="36px"
              h="36px"
              borderRadius="12px"
              bg="var(--accent-soft)"
              border="1px solid var(--border)"
              color="var(--accent)"
            >
              <Icon as={GitMerge} w="16px" h="16px" />
            </Flex>
          </Flex>
          <Text
            fontSize="14px"
            fontWeight="700"
            color="var(--muted)"
            mt="10px"
          >
            Merged PRs
          </Text>
          {safeTotalPRs === 0 ? (
            <Text fontSize="12px" color="var(--muted)" mt="2px">
              No PRs submitted yet
            </Text>
          ) : safeTotalPRs > safeMerged ? (
            <Text fontSize="12px" color="var(--accent)" fontWeight="600" mt="2px">
              {mergeRate}% merged ({safeMerged}/{safeTotalPRs})
            </Text>
          ) : (
            <Text fontSize="12px" color="var(--accent)" fontWeight="600" mt="2px">
              {mergeRate}% merged
            </Text>
          )}
        </Box>

        {/* 2. Points Earned */}
        <Box
          bg={statCardBg}
          border="1px solid"
          borderColor={statBorder}
          borderRadius="20px"
          p={{ base: '18px 20px', md: '22px 24px' }}
          position="relative"
          overflow="hidden"
          transition="all 0.3s ease"
          _hover={{
            borderColor: '#FFD700',
            transform: 'translateY(-2px)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <Flex justify="space-between" align="flex-start">
            <Text
              fontSize={{ base: '28px', md: '34px' }}
              fontWeight="900"
              lineHeight="1"
              color="#FFD700"
              fontFamily="var(--f-mono)"
            >
              <CountUp to={safePoints} duration={1.2} separator="," />
            </Text>
            <Flex
              align="center"
              justify="center"
              w="36px"
              h="36px"
              borderRadius="12px"
              bg="rgba(255, 215, 0, 0.15)"
              border="1px solid rgba(255, 215, 0, 0.35)"
              color="#FFD700"
            >
              <Icon as={Star} w="16px" h="16px" />
            </Flex>
          </Flex>
          <Text
            fontSize="14px"
            fontWeight="700"
            color="var(--muted)"
            mt="10px"
          >
            Points Earned
          </Text>
          <Text fontSize="12px" color="var(--muted)" mt="2px">
            Avg {avgPts} pts/PR
          </Text>
        </Box>

        {/* 3. Current Tier */}
        <Box
          bg={statCardBg}
          border="1px solid"
          borderColor={statBorder}
          borderRadius="20px"
          p={{ base: '18px 20px', md: '22px 24px' }}
          position="relative"
          overflow="hidden"
          transition="all 0.3s ease"
          _hover={{
            borderColor: currentTier.color,
            transform: 'translateY(-2px)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <Flex justify="space-between" align="flex-start">
            <Text
              fontSize={{ base: '22px', md: '26px' }}
              fontWeight="900"
              lineHeight="1"
              color={currentTier.color}
              fontFamily="var(--f-body)"
              noOfLines={1}
            >
              {currentTier.name}
            </Text>
            <Flex
              align="center"
              justify="center"
              w="36px"
              h="36px"
              borderRadius="12px"
              bg={`${currentTier.color}22`}
              border={`1px solid ${currentTier.color}55`}
              color={currentTier.color}
            >
              <Icon as={CurrentTierIcon} w="16px" h="16px" />
            </Flex>
          </Flex>
          <Text
            fontSize="14px"
            fontWeight="700"
            color="var(--muted)"
            mt="10px"
          >
            Current Tier
          </Text>
          <Text fontSize="12px" color="var(--muted)" mt="2px">
            {currentTier.minPts.toLocaleString()}+ pts league
          </Text>
        </Box>

        {/* 4. Standing & Percentile */}
        <Box
          bg={statCardBg}
          border="1px solid"
          borderColor={statBorder}
          borderRadius="20px"
          p={{ base: '18px 20px', md: '22px 24px' }}
          position="relative"
          overflow="hidden"
          transition="all 0.3s ease"
          _hover={{
            borderColor: 'var(--accent)',
            transform: 'translateY(-2px)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <Flex justify="space-between" align="flex-start">
            {isStaffOrMentor ? (
              <Text
                fontSize={{ base: '24px', md: '30px' }}
                fontWeight="900"
                lineHeight="1"
                color="#FBBF24"
                fontFamily="var(--f-body)"
              >
                Staff
              </Text>
            ) : isCompetitivelyRanked && rankNumber ? (
              <Text
                fontSize={{ base: '28px', md: '34px' }}
                fontWeight="900"
                lineHeight="1"
                color="var(--fg)"
                fontFamily="var(--f-mono)"
              >
                #{rankNumber}
              </Text>
            ) : (
              <Text
                fontSize={{ base: '22px', md: '28px' }}
                fontWeight="900"
                lineHeight="1"
                color="var(--muted)"
                fontFamily="var(--f-body)"
              >
                Unranked
              </Text>
            )}

            <Flex
              align="center"
              justify="center"
              w="36px"
              h="36px"
              borderRadius="12px"
              bg={isStaffOrMentor ? 'rgba(245, 158, 11, 0.16)' : 'var(--accent-soft)'}
              border="1px solid"
              borderColor={isStaffOrMentor ? 'rgba(245, 158, 11, 0.4)' : 'var(--border)'}
              color={isStaffOrMentor ? '#FBBF24' : 'var(--accent)'}
            >
              <Icon as={isStaffOrMentor ? Crown : Award} w="16px" h="16px" />
            </Flex>
          </Flex>

          <Text
            fontSize="14px"
            fontWeight="700"
            color="var(--muted)"
            mt="10px"
          >
            Standing
          </Text>

          {isStaffOrMentor ? (
            <Text fontSize="12px" color="#FBBF24" fontWeight="700" mt="2px">
              Staff / Mentor
            </Text>
          ) : isCompetitivelyRanked && topPercentile !== null ? (
            <Text fontSize="12px" color="var(--accent)" fontWeight="700" mt="2px">
              Top {topPercentile}% Contributor
            </Text>
          ) : isCompetitivelyRanked && rankNumber ? (
            <Text fontSize="12px" color="var(--accent)" fontWeight="700" mt="2px">
              Leaderboard Rank #{rankNumber}
            </Text>
          ) : (
            <Text fontSize="12px" color="var(--muted)" mt="2px">
              Not ranked yet
            </Text>
          )}
        </Box>
      </Grid>

      {/* Tier Level-Up Progress Box (Spacious & Clear) */}
      <Box
        p={{ base: '18px 20px', md: '20px 24px' }}
        borderRadius="20px"
        bg="var(--card-soft)"
        border="1px solid var(--border)"
        mt="auto"
      >
        <Flex justify="space-between" align="center" mb="12px" fontSize="13px">
          <Flex align="center" gap="8px">
            <Icon as={CurrentTierIcon} w="14px" h="14px" color={currentTier.color} />
            <Text fontWeight="800" color="var(--fg)">
              Tier Progression
            </Text>
          </Flex>
          {nextTier ? (
            <Text fontFamily="var(--f-mono)" fontWeight="700" color="var(--accent)" fontSize="13px">
              +<CountUp to={pointsToNextTier} duration={1.2} separator="," /> pts to {nextTier.name}
            </Text>
          ) : (
            <Text fontWeight="700" color="#FFD700" fontSize="13px">
              ★ Max Tier Reached
            </Text>
          )}
        </Flex>

        {/* Progress Bar */}
        <Box h="8px" w="100%" bg="var(--accent-soft)" borderRadius="full" overflow="hidden" mb="10px">
          <Box
            h="100%"
            w={`${tierProgressPct}%`}
            bg={
              nextTier
                ? "linear-gradient(90deg, var(--accent) 0%, #FFD700 100%)"
                : "linear-gradient(90deg, #FFD700 0%, var(--accent) 100%)"
            }
            borderRadius="full"
            transition="width 0.6s ease"
          />
        </Box>

        <Flex justify="space-between" fontSize="12px" color="var(--muted)">
          <Text>{currentTier.name} ({currentTier.minPts.toLocaleString()} pts)</Text>
          <Text>{nextTier ? `${nextTier.name} (${nextTier.minPts.toLocaleString()} pts)` : 'Legend (4,500+ pts)'}</Text>
        </Flex>
      </Box>
    </Box>
  );
}
