"use client";

import React, { useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaTrophy,
  FaArrowUp,
  FaShieldAlt,
  FaSeedling,
  FaStar,
  FaMedal,
  FaCrown,
} from "react-icons/fa";
import { RowObj } from "./ColumnsTable";
import { NextAvatar } from "components/image/Avatar";

interface PersonalRaceTrackerProps {
  tableData: RowObj[];
  eventName: string;
}

const TIERS = [
  { name: "Initiate", minPts: 0, icon: FaSeedling, color: "var(--muted)" },
  { name: "Challenger", minPts: 500, icon: FaStar, color: "#63B3ED" },
  { name: "Master", minPts: 1500, icon: FaMedal, color: "#B794F4" },
  { name: "Grandmaster", minPts: 3000, icon: FaCrown, color: "#FFD700" },
  { name: "Legend", minPts: 4500, icon: FaTrophy, color: "var(--accent)" },
];

export default function PersonalRaceTracker({
  tableData,
  eventName,
}: PersonalRaceTrackerProps) {
  // Logged-in user githubId from localStorage
  const currentGithubID =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") ?? "{}")?.githubId
      : undefined;

  const raceData = useMemo(() => {
    if (!tableData || tableData.length === 0) return null;

    const sorted = [...tableData].sort(
      (a, b) => (Number(b.points) || 0) - (Number(a.points) || 0)
    );

    // Pick logged-in user if found on leaderboard, else #4 or #1
    let userIndex = -1;
    if (currentGithubID) {
      userIndex = sorted.findIndex(
        (u) => u.githubid && u.githubid.toLowerCase() === currentGithubID.toLowerCase()
      );
    }
    if (userIndex === -1) {
      userIndex = sorted.length > 3 ? 3 : 0;
    }

    const user = sorted[userIndex];
    const userRank = userIndex + 1;
    const userPoints = Number(user.points) || 0;
    const userPRs = Number(user.prmerged) || 0;

    const leader = sorted[0];
    const leaderPoints = Number(leader.points) || 0;

    // Percentile
    const percentile = Math.max(
      1,
      Math.round(((sorted.length - userIndex) / sorted.length) * 100)
    );
    const topPercentile = 100 - percentile + 1;

    // Person directly above
    const personAbove = userIndex > 0 ? sorted[userIndex - 1] : null;
    const pointsToAbove = personAbove
      ? (Number(personAbove.points) || 0) - userPoints + 1
      : 0;

    // Person directly below
    const personBelow =
      userIndex < sorted.length - 1 ? sorted[userIndex + 1] : null;
    const leadOverBelow = personBelow
      ? userPoints - (Number(personBelow.points) || 0)
      : 0;

    // Distance to #1
    const pointsToLeader = Math.max(0, leaderPoints - userPoints);

    // Tiers calculation
    const revIndex = TIERS.slice().reverse().findIndex((t) => userPoints >= t.minPts);
    const currentTier = revIndex !== -1 ? TIERS[TIERS.length - 1 - revIndex] : TIERS[0];
    const nextTier = TIERS.find((t) => t.minPts > userPoints);
    const pointsToNextTier = nextTier ? nextTier.minPts - userPoints : 0;

    return {
      user,
      userRank,
      userPoints,
      userPRs,
      percentile: topPercentile,
      totalParticipants: sorted.length,
      personAbove,
      pointsToAbove,
      personBelow,
      leadOverBelow,
      leader,
      leaderPoints,
      pointsToLeader,
      currentTier,
      nextTier,
      pointsToNextTier,
    };
  }, [tableData, currentGithubID]);

  if (!raceData) {
    return (
      <Flex direction="column" align="center" justify="center" py="40px">
        <Text color="var(--muted)" fontSize="14px">
          No participant data available for {eventName}.
        </Text>
      </Flex>
    );
  }

  const {
    user,
    userRank,
    userPoints,
    userPRs,
    percentile,
    personAbove,
    pointsToAbove,
    personBelow,
    leadOverBelow,
    leader,
    pointsToLeader,
    currentTier,
    nextTier,
    pointsToNextTier,
  } = raceData;

  const isYou = user.githubid === currentGithubID;
  const CurrentTierIcon = currentTier.icon;

  return (
    <Flex direction="column" gap="16px" w="100%">
      {/* 1. MINIMAL USER STANDING BAR */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        gap="16px"
        p={{ base: "16px", md: "20px" }}
        borderRadius="20px"
        bg="linear-gradient(135deg, rgba(16, 37, 53, 0.75) 0%, rgba(13, 34, 51, 0.70) 100%)"
        border="1px solid rgba(88, 185, 154, 0.2)"
        backdropFilter="blur(16px)"
      >
        <Flex align="center" gap="14px">
          <Box
            borderRadius="full"
            p="2px"
            bg="linear-gradient(135deg, rgba(88, 185, 154, 0.45), rgba(45, 139, 111, 0.25))"
          >
            <NextAvatar src={user.avatarUrl} h="48px" w="48px" />
          </Box>
          <Box>
            <Flex align="center" gap="8px">
              <Text fontWeight="800" fontSize="16px" color="var(--fg)">
                {user.name}
              </Text>
              {isYou && (
                <Box
                  px="7px"
                  py="1px"
                  borderRadius="full"
                  bg="linear-gradient(135deg, #B8E5D5 0%, #2D8B6F 100%)"
                  color="var(--accent-ink)"
                  fontSize="10px"
                  fontWeight="900"
                >
                  YOU
                </Box>
              )}
            </Flex>
            <Text fontSize="12px" color="var(--muted)">
              @{user.githubid} {user.college ? `· ${user.college}` : ""}
            </Text>
          </Box>
        </Flex>

        <Flex gap={{ base: "16px", sm: "24px" }} align="center">
          <Box textAlign={{ base: "left", sm: "right" }}>
            <Text fontSize="11px" color="var(--muted)" fontWeight="600" textTransform="uppercase">
              Rank
            </Text>
            <Text fontFamily="var(--f-mono)" fontSize="18px" fontWeight="900" color="var(--fg)">
              #{userRank}{" "}
              <Text as="span" fontSize="11px" color="var(--accent)" fontWeight="700">
                (Top {percentile}%)
              </Text>
            </Text>
          </Box>

          <Box textAlign={{ base: "left", sm: "right" }}>
            <Text fontSize="11px" color="var(--muted)" fontWeight="600" textTransform="uppercase">
              Points
            </Text>
            <Text fontFamily="var(--f-mono)" fontSize="18px" fontWeight="900" color="#FFD700">
              {userPoints.toLocaleString()}
            </Text>
          </Box>

          <Box textAlign={{ base: "left", sm: "right" }}>
            <Text fontSize="11px" color="var(--muted)" fontWeight="600" textTransform="uppercase">
              PRs
            </Text>
            <Text fontFamily="var(--f-mono)" fontSize="18px" fontWeight="900" color="var(--fg)">
              {userPRs}
            </Text>
          </Box>
        </Flex>
      </Flex>

      {/* 2. MINIMAL 3 GAPS: NEXT RANK, DEFENSE BUFFER, AND LEADER GAP */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="14px">
        {/* Next Rank Above */}
        <Box
          p="16px"
          borderRadius="18px"
          bg="rgba(88, 185, 154, 0.06)"
          border="1px solid rgba(88, 185, 154, 0.18)"
        >
          <Flex align="center" gap="6px" mb="8px">
            <Box color="var(--accent)">
              <FaArrowUp size={12} />
            </Box>
            <Text fontSize="11px" fontWeight="700" color="var(--muted)" textTransform="uppercase" letterSpacing="0.06em">
              To Reach #{Math.max(1, userRank - 1)}
            </Text>
          </Flex>

          {personAbove ? (
            <>
              <Text fontFamily="var(--f-mono)" fontSize="20px" fontWeight="900" color="var(--accent)">
                +{pointsToAbove.toLocaleString()} pts
              </Text>
              <Text fontSize="12px" color="var(--muted)" mt="4px" noOfLines={1}>
                Ahead: {personAbove.name} ({personAbove.points} pts)
              </Text>
            </>
          ) : (
            <Text fontSize="14px" fontWeight="700" color="#FFD700">
              #1 Overall Leader
            </Text>
          )}
        </Box>

        {/* Lead Over Rank Below */}
        <Box
          p="16px"
          borderRadius="18px"
          bg="rgba(88, 185, 154, 0.06)"
          border="1px solid rgba(88, 185, 154, 0.18)"
        >
          <Flex align="center" gap="6px" mb="8px">
            <Box color="#68D391">
              <FaShieldAlt size={12} />
            </Box>
            <Text fontSize="11px" fontWeight="700" color="var(--muted)" textTransform="uppercase" letterSpacing="0.06em">
              Lead Over #{userRank + 1}
            </Text>
          </Flex>

          {personBelow ? (
            <>
              <Text fontFamily="var(--f-mono)" fontSize="20px" fontWeight="900" color="#68D391">
                +{leadOverBelow.toLocaleString()} pts
              </Text>
              <Text fontSize="12px" color="var(--muted)" mt="4px" noOfLines={1}>
                Behind: {personBelow.name} ({personBelow.points} pts)
              </Text>
            </>
          ) : (
            <Text fontSize="14px" fontWeight="700" color="var(--muted)">
              Last position
            </Text>
          )}
        </Box>

        {/* Distance to #1 */}
        <Box
          p="16px"
          borderRadius="18px"
          bg="rgba(88, 185, 154, 0.06)"
          border="1px solid rgba(88, 185, 154, 0.18)"
        >
          <Flex align="center" gap="6px" mb="8px">
            <Box color="#FFD700">
              <FaTrophy size={12} />
            </Box>
            <Text fontSize="11px" fontWeight="700" color="var(--muted)" textTransform="uppercase" letterSpacing="0.06em">
              Distance to #1
            </Text>
          </Flex>

          {userRank > 1 ? (
            <>
              <Text fontFamily="var(--f-mono)" fontSize="20px" fontWeight="900" color="#FFD700">
                +{pointsToLeader.toLocaleString()} pts
              </Text>
              <Text fontSize="12px" color="var(--muted)" mt="4px" noOfLines={1}>
                Leader: {leader.name} ({leader.points} pts)
              </Text>
            </>
          ) : (
            <Text fontSize="14px" fontWeight="700" color="#FFD700">
              Current Champion
            </Text>
          )}
        </Box>
      </SimpleGrid>

      {/* 3. TIER PROGRESSION ROADMAP (Replaces boring progress bar) */}
      <Box
        p={{ base: "14px 16px", md: "18px 20px" }}
        borderRadius="20px"
        bg="var(--card-soft)"
        border="1px solid rgba(88, 185, 154, 0.16)"
      >
        <Flex justify="space-between" align="center" mb="14px" flexWrap="wrap" gap="10px">
          <Flex align="center" gap="8px">
            <Box color={currentTier.color}>
              <CurrentTierIcon size={15} />
            </Box>
            <Text fontSize="13px" fontWeight="800" color="var(--fg)">
              Current Tier: <Text as="span" color={currentTier.color}>{currentTier.name}</Text>
            </Text>
          </Flex>

          {nextTier ? (
            <Text fontSize="12px" color="var(--muted)" fontFamily="var(--f-mono)">
              <Text as="span" color="var(--accent)" fontWeight="800">
                +{pointsToNextTier.toLocaleString()} pts
              </Text>{" "}
              to unlock {nextTier.name}
            </Text>
          ) : (
            <Text fontSize="12px" color="#FFD700" fontWeight="700">
              ★ Highest Tier Achieved!
            </Text>
          )}
        </Flex>

        <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} spacing="10px">
          {TIERS.map((tier) => {
            const isReached = userPoints >= tier.minPts;
            const isCurrent = currentTier.name === tier.name;
            const TierIcon = tier.icon;

            return (
              <Flex
                key={tier.name}
                direction="column"
                align="center"
                p="12px 10px"
                borderRadius="14px"
                bg={
                  isCurrent
                    ? "linear-gradient(135deg, rgba(88, 185, 154, 0.18) 0%, rgba(255, 215, 0, 0.12) 100%)"
                    : isReached
                    ? "rgba(88, 185, 154, 0.05)"
                    : "rgba(0, 0, 0, 0.25)"
                }
                border="1px solid"
                borderColor={
                  isCurrent
                    ? tier.color
                    : isReached
                    ? "rgba(88, 185, 154, 0.22)"
                    : "rgba(255, 255, 255, 0.06)"
                }
                boxShadow={isCurrent ? `0 0 16px ${tier.color}35` : "none"}
                opacity={isReached ? 1 : 0.45}
                transition="all 0.2s ease"
              >
                <Box color={tier.color} mb="6px">
                  <TierIcon size={16} />
                </Box>
                <Text
                  fontSize="12px"
                  fontWeight={isCurrent ? "900" : "700"}
                  color={isCurrent ? "var(--fg)" : tier.color}
                  textAlign="center"
                >
                  {tier.name}
                </Text>
                <Text
                  fontFamily="var(--f-mono)"
                  fontSize="11px"
                  color="var(--muted)"
                  mt="2px"
                >
                  {tier.minPts.toLocaleString()}+ pts
                </Text>

                {isCurrent && (
                  <Box
                    mt="6px"
                    px="6px"
                    py="1px"
                    borderRadius="full"
                    bg={tier.color}
                    color="var(--accent-ink)"
                    fontSize="9px"
                    fontWeight="900"
                    letterSpacing="0.05em"
                  >
                    ACTIVE
                  </Box>
                )}
              </Flex>
            );
          })}
        </SimpleGrid>
      </Box>
    </Flex>
  );
}
