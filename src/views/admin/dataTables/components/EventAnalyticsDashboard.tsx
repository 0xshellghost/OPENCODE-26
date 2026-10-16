"use client";

import React, { useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  SimpleGrid,
  Progress,
  Link,
  Tooltip,
} from "@chakra-ui/react";
import {
  FaTrophy,
  FaCodeBranch,
  FaUniversity,
  FaSeedling,
  FaCrown,
  FaMedal,
  FaFire,
  FaChartPie,
} from "react-icons/fa";
import { RowObj } from "./ColumnsTable";
import { NextAvatar } from "components/image/Avatar";

interface EventAnalyticsDashboardProps {
  tableData: RowObj[];
  eventName: string;
}

export default function EventAnalyticsDashboard({
  tableData,
  eventName,
}: EventAnalyticsDashboardProps) {
  // Calculations
  const stats = useMemo(() => {
    const totalParticipants = tableData.length;
    const totalPRs = tableData.reduce(
      (acc, u) => acc + (Number(u.prmerged) || 0),
      0
    );
    const totalPoints = tableData.reduce(
      (acc, u) => acc + (Number(u.points) || 0),
      0
    );

    const avgPRsPerContributor =
      totalParticipants > 0 ? (totalPRs / totalParticipants).toFixed(1) : "0";
    const avgPointsPerPR =
      totalPRs > 0 ? (totalPoints / totalPRs).toFixed(1) : "0";

    // 1st Year stats (grad year 2029)
    const firstYearRows = tableData.filter(
      (u) => String(u.graduationYear ?? "").trim() === "2029"
    );
    const firstYearCount = firstYearRows.length;
    const firstYearPRs = firstYearRows.reduce(
      (acc, u) => acc + (Number(u.prmerged) || 0),
      0
    );
    const firstYearPoints = firstYearRows.reduce(
      (acc, u) => acc + (Number(u.points) || 0),
      0
    );
    const firstYearPct =
      totalPRs > 0 ? Math.round((firstYearPRs / totalPRs) * 100) : 0;

    // College breakdown
    const collegeMap: Record<
      string,
      { name: string; points: number; contributors: number; prs: number }
    > = {};

    tableData.forEach((u) => {
      const college = (u.college ?? "").trim();
      if (!college || college.toLowerCase() === "unknown") return;
      if (!collegeMap[college]) {
        collegeMap[college] = {
          name: college,
          points: 0,
          contributors: 0,
          prs: 0,
        };
      }
      collegeMap[college].points += Number(u.points) || 0;
      collegeMap[college].contributors += 1;
      collegeMap[college].prs += Number(u.prmerged) || 0;
    });

    const sortedColleges = Object.values(collegeMap).sort(
      (a, b) => b.points - a.points
    );
    const topCollege = sortedColleges[0] ?? {
      name: "Open Community",
      points: totalPoints,
      contributors: totalParticipants,
      prs: totalPRs,
    };

    // Tiers breakdown
    const tiers = {
      elite: tableData.filter((u) => u.points >= 4000).length,
      master: tableData.filter((u) => u.points >= 2000 && u.points < 4000)
        .length,
      challenger: tableData.filter((u) => u.points >= 1000 && u.points < 2000)
        .length,
      emerging: tableData.filter((u) => u.points < 1000).length,
    };

    // Top 3 for Podium
    const top1 = tableData.find((u) => String(u.position) === "1") || tableData[0];
    const top2 = tableData.find((u) => String(u.position) === "2") || tableData[1];
    const top3 = tableData.find((u) => String(u.position) === "3") || tableData[2];

    return {
      totalParticipants,
      totalPRs,
      totalPoints,
      avgPRsPerContributor,
      avgPointsPerPR,
      firstYearCount,
      firstYearPRs,
      firstYearPoints,
      firstYearPct,
      topCollege,
      sortedColleges: sortedColleges.slice(0, 5),
      tiers,
      top1,
      top2,
      top3,
    };
  }, [tableData]);

  if (!tableData || tableData.length === 0) {
    return (
      <Flex direction="column" align="center" justify="center" py="50px">
        <Text color="#dfced5" fontSize="16px">
          No participant data available for {eventName}.
        </Text>
      </Flex>
    );
  }

  const maxCollegePoints = stats.sortedColleges[0]?.points || 1;

  return (
    <Flex direction="column" gap="24px" w="100%">
      {/* 1. TOP 4 KEY METRIC CARDS */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing="16px">
        {/* Metric 1: Total Merged PRs */}
        <Box
          p="20px"
          borderRadius="20px"
          bg="linear-gradient(135deg, rgba(35, 20, 44, 0.75) 0%, rgba(48, 26, 56, 0.70) 100%)"
          border="1px solid rgba(240, 168, 184, 0.22)"
          backdropFilter="blur(18px)"
          boxShadow="0 10px 30px rgba(0, 0, 0, 0.45)"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="-10px"
            right="-10px"
            w="70px"
            h="70px"
            borderRadius="full"
            bg="rgba(240, 168, 184, 0.08)"
            filter="blur(20px)"
          />
          <Flex justify="space-between" align="center" mb="12px">
            <Text
              fontFamily="var(--f-mono), monospace"
              fontSize="12px"
              fontWeight="700"
              color="#dfced5"
              letterSpacing="0.1em"
              textTransform="uppercase"
            >
              Merged PRs
            </Text>
            <Flex
              p="8px"
              borderRadius="12px"
              bg="rgba(240, 168, 184, 0.15)"
              color="#f0a8b8"
            >
              <FaCodeBranch size={15} />
            </Flex>
          </Flex>
          <Text
            fontFamily="var(--f-mono), monospace"
            fontSize={{ base: "28px", md: "34px" }}
            fontWeight="900"
            color="#fff1ec"
            lineHeight="1"
            mb="6px"
          >
            {stats.totalPRs.toLocaleString()}
          </Text>
          <Text fontSize="12px" color="#dfced5" opacity={0.85}>
            Avg <Text as="span" color="#f0a8b8" fontWeight="700">{stats.avgPRsPerContributor}</Text> PRs per creator
          </Text>
        </Box>

        {/* Metric 2: Total Bounty Points */}
        <Box
          p="20px"
          borderRadius="20px"
          bg="linear-gradient(135deg, rgba(35, 20, 44, 0.75) 0%, rgba(48, 26, 56, 0.70) 100%)"
          border="1px solid rgba(240, 168, 184, 0.22)"
          backdropFilter="blur(18px)"
          boxShadow="0 10px 30px rgba(0, 0, 0, 0.45)"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="-10px"
            right="-10px"
            w="70px"
            h="70px"
            borderRadius="full"
            bg="rgba(255, 215, 0, 0.08)"
            filter="blur(20px)"
          />
          <Flex justify="space-between" align="center" mb="12px">
            <Text
              fontFamily="var(--f-mono), monospace"
              fontSize="12px"
              fontWeight="700"
              color="#dfced5"
              letterSpacing="0.1em"
              textTransform="uppercase"
            >
              Total Points
            </Text>
            <Flex
              p="8px"
              borderRadius="12px"
              bg="rgba(255, 215, 0, 0.15)"
              color="#FFD700"
            >
              <FaTrophy size={15} />
            </Flex>
          </Flex>
          <Text
            fontFamily="var(--f-mono), monospace"
            fontSize={{ base: "28px", md: "34px" }}
            fontWeight="900"
            color="#FFD700"
            lineHeight="1"
            mb="6px"
          >
            {stats.totalPoints.toLocaleString()}
          </Text>
          <Text fontSize="12px" color="#dfced5" opacity={0.85}>
            Avg <Text as="span" color="#FFD700" fontWeight="700">{stats.avgPointsPerPR}</Text> pts per merged PR
          </Text>
        </Box>

        {/* Metric 3: First-Year Impact */}
        <Box
          p="20px"
          borderRadius="20px"
          bg="linear-gradient(135deg, rgba(35, 20, 44, 0.75) 0%, rgba(48, 26, 56, 0.70) 100%)"
          border="1px solid rgba(240, 168, 184, 0.22)"
          backdropFilter="blur(18px)"
          boxShadow="0 10px 30px rgba(0, 0, 0, 0.45)"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="-10px"
            right="-10px"
            w="70px"
            h="70px"
            borderRadius="full"
            bg="rgba(129, 230, 217, 0.08)"
            filter="blur(20px)"
          />
          <Flex justify="space-between" align="center" mb="12px">
            <Text
              fontFamily="var(--f-mono), monospace"
              fontSize="12px"
              fontWeight="700"
              color="#dfced5"
              letterSpacing="0.1em"
              textTransform="uppercase"
            >
              1st Year Impact
            </Text>
            <Flex
              p="8px"
              borderRadius="12px"
              bg="rgba(72, 187, 120, 0.18)"
              color="#68D391"
            >
              <FaSeedling size={15} />
            </Flex>
          </Flex>
          <Text
            fontFamily="var(--f-mono), monospace"
            fontSize={{ base: "28px", md: "34px" }}
            fontWeight="900"
            color="#68D391"
            lineHeight="1"
            mb="6px"
          >
            {stats.firstYearCount}{" "}
            <Text as="span" fontSize="16px" fontWeight="600" color="#dfced5">
              devs
            </Text>
          </Text>
          <Text fontSize="12px" color="#dfced5" opacity={0.85}>
            <Text as="span" color="#68D391" fontWeight="700">{stats.firstYearPRs}</Text> PRs ({stats.firstYearPct}% of event activity)
          </Text>
        </Box>

        {/* Metric 4: Top Campus */}
        <Box
          p="20px"
          borderRadius="20px"
          bg="linear-gradient(135deg, rgba(35, 20, 44, 0.75) 0%, rgba(48, 26, 56, 0.70) 100%)"
          border="1px solid rgba(240, 168, 184, 0.22)"
          backdropFilter="blur(18px)"
          boxShadow="0 10px 30px rgba(0, 0, 0, 0.45)"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="-10px"
            right="-10px"
            w="70px"
            h="70px"
            borderRadius="full"
            bg="rgba(240, 168, 184, 0.08)"
            filter="blur(20px)"
          />
          <Flex justify="space-between" align="center" mb="12px">
            <Text
              fontFamily="var(--f-mono), monospace"
              fontSize="12px"
              fontWeight="700"
              color="#dfced5"
              letterSpacing="0.1em"
              textTransform="uppercase"
            >
              Top Campus
            </Text>
            <Flex
              p="8px"
              borderRadius="12px"
              bg="rgba(240, 168, 184, 0.15)"
              color="#f0a8b8"
            >
              <FaUniversity size={15} />
            </Flex>
          </Flex>
          <Text
            fontFamily="var(--f-sans), sans-serif"
            fontSize="18px"
            fontWeight="800"
            color="#fff1ec"
            lineHeight="1.2"
            mb="6px"
            noOfLines={1}
            title={stats.topCollege.name}
          >
            {stats.topCollege.name}
          </Text>
          <Text fontSize="12px" color="#dfced5" opacity={0.85}>
            <Text as="span" color="#f0a8b8" fontWeight="700">{stats.topCollege.points.toLocaleString()}</Text> pts · {stats.topCollege.contributors} contributors
          </Text>
        </Box>
      </SimpleGrid>

      {/* 2. PODIUM OF CHAMPIONS (Top 3 Contenders) */}
      <Box
        p={{ base: "18px", md: "24px" }}
        borderRadius="24px"
        bg="linear-gradient(135deg, rgba(32, 18, 40, 0.8) 0%, rgba(44, 24, 52, 0.75) 100%)"
        border="1px solid rgba(240, 168, 184, 0.22)"
        backdropFilter="blur(20px)"
        boxShadow="0 14px 40px rgba(0, 0, 0, 0.5)"
      >
        <Flex align="center" justify="space-between" mb="20px" flexWrap="wrap" gap="10px">
          <Flex align="center" gap="10px">
            <Box color="#FFD700">
              <FaCrown size={20} />
            </Box>
            <Box>
              <Text
                fontFamily="var(--f-display), 'Cormorant Garamond', Georgia, serif"
                fontSize="22px"
                fontWeight="700"
                color="#fff1ec"
                lineHeight="1.1"
              >
                Podium of Champions
              </Text>
              <Text fontSize="12px" color="#dfced5" opacity={0.8}>
                The vanguard leading this season's rankings
              </Text>
            </Box>
          </Flex>

          <Flex
            align="center"
            gap="6px"
            px="12px"
            py="4px"
            borderRadius="full"
            bg="rgba(240, 168, 184, 0.12)"
            border="1px solid rgba(240, 168, 184, 0.25)"
            fontSize="12px"
            color="#f0a8b8"
            fontWeight="700"
          >
            <FaFire size={12} /> Live Standings
          </Flex>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: "16px", md: "20px" }} alignItems="flex-end">
          {/* #2 SILVER (Rank 2) */}
          {stats.top2 && (
            <Flex
              direction="column"
              align="center"
              p="20px"
              borderRadius="20px"
              bg="rgba(226, 232, 240, 0.05)"
              border="1px solid rgba(226, 232, 240, 0.3)"
              boxShadow="0 8px 24px rgba(0, 0, 0, 0.35)"
              transition="transform 0.2s ease"
              _hover={{ transform: "translateY(-3px)", borderColor: "rgba(226, 232, 240, 0.5)" }}
              order={{ base: 2, md: 1 }}
            >
              <Flex
                align="center"
                justify="center"
                gap="4px"
                px="10px"
                py="2px"
                borderRadius="full"
                bg="rgba(226, 232, 240, 0.15)"
                border="1px solid rgba(226, 232, 240, 0.4)"
                color="#E2E8F0"
                fontSize="12px"
                fontWeight="800"
                fontFamily="var(--f-mono)"
                mb="12px"
              >
                <FaMedal size={11} color="#E2E8F0" /> #2 SILVER
              </Flex>

              <Box
                borderRadius="full"
                p="3px"
                bg="linear-gradient(135deg, #E2E8F0 0%, #A0AEC0 100%)"
                mb="10px"
                boxShadow="0 0 16px rgba(226, 232, 240, 0.3)"
              >
                <NextAvatar src={stats.top2.avatarUrl} h="60px" w="60px" />
              </Box>

              <Link
                href={`/user/profile/${stats.top2.githubid}`}
                _hover={{ textDecoration: "none" }}
              >
                <Text fontWeight="800" fontSize="16px" color="#fff1ec" textAlign="center">
                  {stats.top2.name}
                </Text>
                <Text fontSize="12px" color="#dfced5" opacity={0.8} textAlign="center" mb="12px">
                  @{stats.top2.githubid}
                </Text>
              </Link>

              <Flex justify="space-between" w="100%" px="14px" py="8px" bg="rgba(0,0,0,0.25)" borderRadius="12px">
                <Text fontSize="12px" color="#dfced5">
                  PRs: <Text as="span" fontWeight="800" color="#fff1ec">{stats.top2.prmerged}</Text>
                </Text>
                <Text fontSize="12px" fontWeight="800" color="#E2E8F0" fontFamily="var(--f-mono)">
                  {stats.top2.points} pts
                </Text>
              </Flex>
            </Flex>
          )}

          {/* #1 GOLD (Rank 1 - Featured elevated) */}
          {stats.top1 && (
            <Flex
              direction="column"
              align="center"
              p="24px"
              borderRadius="22px"
              bg="linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(240, 168, 184, 0.08) 100%)"
              border="2px solid rgba(255, 215, 0, 0.5)"
              boxShadow="0 14px 40px rgba(255, 215, 0, 0.2), 0 0 30px rgba(255, 215, 0, 0.15)"
              transition="transform 0.2s ease"
              _hover={{ transform: "translateY(-4px)", borderColor: "#FFD700" }}
              position="relative"
              order={{ base: 1, md: 2 }}
            >
              <Flex
                align="center"
                justify="center"
                gap="6px"
                px="14px"
                py="4px"
                borderRadius="full"
                bg="linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
                color="#1a0c16"
                fontSize="12px"
                fontWeight="900"
                fontFamily="var(--f-mono)"
                letterSpacing="0.08em"
                boxShadow="0 4px 14px rgba(255, 215, 0, 0.4)"
                mb="14px"
              >
                <FaCrown size={13} color="#1a0c16" /> #1 CHAMPION
              </Flex>

              <Box
                borderRadius="full"
                p="4px"
                bg="linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
                mb="12px"
                boxShadow="0 0 24px rgba(255, 215, 0, 0.5)"
              >
                <NextAvatar src={stats.top1.avatarUrl} h="76px" w="76px" />
              </Box>

              <Link
                href={`/user/profile/${stats.top1.githubid}`}
                _hover={{ textDecoration: "none" }}
              >
                <Text fontWeight="900" fontSize="18px" color="#fff1ec" textAlign="center">
                  {stats.top1.name}
                </Text>
                <Text fontSize="13px" color="#FFD700" opacity={0.9} textAlign="center" mb="14px" fontWeight="600">
                  @{stats.top1.githubid}
                </Text>
              </Link>

              <Flex justify="space-between" w="100%" px="16px" py="10px" bg="rgba(0,0,0,0.35)" borderRadius="14px" border="1px solid rgba(255, 215, 0, 0.25)">
                <Text fontSize="13px" color="#dfced5">
                  Merged: <Text as="span" fontWeight="800" color="#fff1ec">{stats.top1.prmerged} PRs</Text>
                </Text>
                <Flex align="center" gap="6px">
                  <Text fontSize="15px" fontWeight="900" color="#FFD700" fontFamily="var(--f-mono)">
                    {stats.top1.points}
                  </Text>
                  <FaTrophy color="#FFD700" size={13} />
                </Flex>
              </Flex>
            </Flex>
          )}

          {/* #3 BRONZE (Rank 3) */}
          {stats.top3 && (
            <Flex
              direction="column"
              align="center"
              p="20px"
              borderRadius="20px"
              bg="rgba(240, 168, 184, 0.05)"
              border="1px solid rgba(240, 168, 184, 0.3)"
              boxShadow="0 8px 24px rgba(0, 0, 0, 0.35)"
              transition="transform 0.2s ease"
              _hover={{ transform: "translateY(-3px)", borderColor: "rgba(240, 168, 184, 0.5)" }}
              order={{ base: 3, md: 3 }}
            >
              <Flex
                align="center"
                justify="center"
                gap="4px"
                px="10px"
                py="2px"
                borderRadius="full"
                bg="rgba(240, 168, 184, 0.15)"
                border="1px solid rgba(240, 168, 184, 0.4)"
                color="#f0a8b8"
                fontSize="12px"
                fontWeight="800"
                fontFamily="var(--f-mono)"
                mb="12px"
              >
                <FaMedal size={11} color="#f0a8b8" /> #3 BRONZE
              </Flex>

              <Box
                borderRadius="full"
                p="3px"
                bg="linear-gradient(135deg, #f0a8b8 0%, #c04a67 100%)"
                mb="10px"
                boxShadow="0 0 16px rgba(240, 168, 184, 0.3)"
              >
                <NextAvatar src={stats.top3.avatarUrl} h="60px" w="60px" />
              </Box>

              <Link
                href={`/user/profile/${stats.top3.githubid}`}
                _hover={{ textDecoration: "none" }}
              >
                <Text fontWeight="800" fontSize="16px" color="#fff1ec" textAlign="center">
                  {stats.top3.name}
                </Text>
                <Text fontSize="12px" color="#dfced5" opacity={0.8} textAlign="center" mb="12px">
                  @{stats.top3.githubid}
                </Text>
              </Link>

              <Flex justify="space-between" w="100%" px="14px" py="8px" bg="rgba(0,0,0,0.25)" borderRadius="12px">
                <Text fontSize="12px" color="#dfced5">
                  PRs: <Text as="span" fontWeight="800" color="#fff1ec">{stats.top3.prmerged}</Text>
                </Text>
                <Text fontSize="12px" fontWeight="800" color="#f0a8b8" fontFamily="var(--f-mono)">
                  {stats.top3.points} pts
                </Text>
              </Flex>
            </Flex>
          )}
        </SimpleGrid>
      </Box>

      {/* 3. TWO-COLUMN BREAKDOWN: CAMPUS BATTLE & TIER DISTRIBUTION */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="20px">
        {/* Column A: Top Campuses */}
        <Box
          p="22px"
          borderRadius="24px"
          bg="linear-gradient(135deg, rgba(32, 18, 40, 0.8) 0%, rgba(44, 24, 52, 0.75) 100%)"
          border="1px solid rgba(240, 168, 184, 0.22)"
          backdropFilter="blur(20px)"
          boxShadow="0 14px 40px rgba(0, 0, 0, 0.45)"
        >
          <Flex align="center" justify="space-between" mb="16px">
            <Flex align="center" gap="10px">
              <Box color="#f0a8b8">
                <FaUniversity size={18} />
              </Box>
              <Box>
                <Text fontWeight="800" fontSize="17px" color="#fff1ec">
                  Campus Showdown
                </Text>
                <Text fontSize="12px" color="#dfced5" opacity={0.8}>
                  Leading institutions by cumulative points
                </Text>
              </Box>
            </Flex>
          </Flex>

          <Flex direction="column" gap="14px">
            {stats.sortedColleges.map((col, idx) => {
              const pct = Math.round((col.points / maxCollegePoints) * 100);
              const rankColor =
                idx === 0 ? "#FFD700" : idx === 1 ? "#E2E8F0" : idx === 2 ? "#f0a8b8" : "#dfced5";

              return (
                <Box key={col.name}>
                  <Flex justify="space-between" align="center" mb="6px">
                    <Flex align="center" gap="8px" maxW="70%">
                      <Text
                        fontFamily="var(--f-mono)"
                        fontWeight="800"
                        fontSize="13px"
                        color={rankColor}
                        minW="22px"
                      >
                        #{idx + 1}
                      </Text>
                      <Text
                        fontSize="13px"
                        fontWeight="700"
                        color="#fff1ec"
                        noOfLines={1}
                        title={col.name}
                      >
                        {col.name}
                      </Text>
                    </Flex>
                    <Flex align="center" gap="8px">
                      <Text fontSize="12px" color="#dfced5" opacity={0.7}>
                        {col.contributors} devs
                      </Text>
                      <Text
                        fontFamily="var(--f-mono)"
                        fontWeight="800"
                        fontSize="13px"
                        color="#ffd0dc"
                      >
                        {col.points.toLocaleString()} pts
                      </Text>
                    </Flex>
                  </Flex>

                  {/* Progress bar */}
                  <Box
                    h="6px"
                    w="100%"
                    bg="rgba(240, 168, 184, 0.1)"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      h="100%"
                      w={`${Math.max(4, pct)}%`}
                      bg={
                        idx === 0
                          ? "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)"
                          : "linear-gradient(90deg, #f0a8b8 0%, #c04a67 100%)"
                      }
                      borderRadius="full"
                      transition="width 0.6s ease"
                    />
                  </Box>
                </Box>
              );
            })}
          </Flex>
        </Box>

        {/* Column B: Contributor Tier Distribution */}
        <Box
          p="22px"
          borderRadius="24px"
          bg="linear-gradient(135deg, rgba(32, 18, 40, 0.8) 0%, rgba(44, 24, 52, 0.75) 100%)"
          border="1px solid rgba(240, 168, 184, 0.22)"
          backdropFilter="blur(20px)"
          boxShadow="0 14px 40px rgba(0, 0, 0, 0.45)"
        >
          <Flex align="center" justify="space-between" mb="16px">
            <Flex align="center" gap="10px">
              <Box color="#f0a8b8">
                <FaChartPie size={18} />
              </Box>
              <Box>
                <Text fontWeight="800" fontSize="17px" color="#fff1ec">
                  Contributor Tiers
                </Text>
                <Text fontSize="12px" color="#dfced5" opacity={0.8}>
                  Point distribution across all {stats.totalParticipants} participants
                </Text>
              </Box>
            </Flex>
          </Flex>

          <Flex direction="column" gap="14px">
            {/* Grandmaster (4000+) */}
            <Box>
              <Flex justify="space-between" align="center" mb="6px">
                <Flex align="center" gap="8px">
                  <Box w="8px" h="8px" borderRadius="full" bg="#FFD700" />
                  <Text fontSize="13px" fontWeight="700" color="#fff1ec">
                    Grandmaster (4,000+ pts)
                  </Text>
                </Flex>
                <Text fontFamily="var(--f-mono)" fontWeight="800" fontSize="13px" color="#FFD700">
                  {stats.tiers.elite}{" "}
                  <Text as="span" fontSize="11px" color="#dfced5" fontWeight="500">
                    ({Math.round((stats.tiers.elite / Math.max(1, stats.totalParticipants)) * 100)}%)
                  </Text>
                </Text>
              </Flex>
              <Box h="6px" w="100%" bg="rgba(240, 168, 184, 0.1)" borderRadius="full" overflow="hidden">
                <Box
                  h="100%"
                  w={`${Math.max(2, (stats.tiers.elite / Math.max(1, stats.totalParticipants)) * 100)}%`}
                  bg="linear-gradient(90deg, #FFD700 0%, #FFA500 100%)"
                  borderRadius="full"
                />
              </Box>
            </Box>

            {/* Master (2000 - 3999) */}
            <Box>
              <Flex justify="space-between" align="center" mb="6px">
                <Flex align="center" gap="8px">
                  <Box w="8px" h="8px" borderRadius="full" bg="#B794F4" />
                  <Text fontSize="13px" fontWeight="700" color="#fff1ec">
                    Master (2,000 – 3,999 pts)
                  </Text>
                </Flex>
                <Text fontFamily="var(--f-mono)" fontWeight="800" fontSize="13px" color="#B794F4">
                  {stats.tiers.master}{" "}
                  <Text as="span" fontSize="11px" color="#dfced5" fontWeight="500">
                    ({Math.round((stats.tiers.master / Math.max(1, stats.totalParticipants)) * 100)}%)
                  </Text>
                </Text>
              </Flex>
              <Box h="6px" w="100%" bg="rgba(240, 168, 184, 0.1)" borderRadius="full" overflow="hidden">
                <Box
                  h="100%"
                  w={`${Math.max(2, (stats.tiers.master / Math.max(1, stats.totalParticipants)) * 100)}%`}
                  bg="linear-gradient(90deg, #B794F4 0%, #9F7AEA 100%)"
                  borderRadius="full"
                />
              </Box>
            </Box>

            {/* Challenger (1000 - 1999) */}
            <Box>
              <Flex justify="space-between" align="center" mb="6px">
                <Flex align="center" gap="8px">
                  <Box w="8px" h="8px" borderRadius="full" bg="#63B3ED" />
                  <Text fontSize="13px" fontWeight="700" color="#fff1ec">
                    Challenger (1,000 – 1,999 pts)
                  </Text>
                </Flex>
                <Text fontFamily="var(--f-mono)" fontWeight="800" fontSize="13px" color="#63B3ED">
                  {stats.tiers.challenger}{" "}
                  <Text as="span" fontSize="11px" color="#dfced5" fontWeight="500">
                    ({Math.round((stats.tiers.challenger / Math.max(1, stats.totalParticipants)) * 100)}%)
                  </Text>
                </Text>
              </Flex>
              <Box h="6px" w="100%" bg="rgba(240, 168, 184, 0.1)" borderRadius="full" overflow="hidden">
                <Box
                  h="100%"
                  w={`${Math.max(2, (stats.tiers.challenger / Math.max(1, stats.totalParticipants)) * 100)}%`}
                  bg="linear-gradient(90deg, #63B3ED 0%, #4299E1 100%)"
                  borderRadius="full"
                />
              </Box>
            </Box>

            {/* Emerging (<1000) */}
            <Box>
              <Flex justify="space-between" align="center" mb="6px">
                <Flex align="center" gap="8px">
                  <Box w="8px" h="8px" borderRadius="full" bg="#f0a8b8" />
                  <Text fontSize="13px" fontWeight="700" color="#fff1ec">
                    Rising Contributors (&lt; 1,000 pts)
                  </Text>
                </Flex>
                <Text fontFamily="var(--f-mono)" fontWeight="800" fontSize="13px" color="#f0a8b8">
                  {stats.tiers.emerging}{" "}
                  <Text as="span" fontSize="11px" color="#dfced5" fontWeight="500">
                    ({Math.round((stats.tiers.emerging / Math.max(1, stats.totalParticipants)) * 100)}%)
                  </Text>
                </Text>
              </Flex>
              <Box h="6px" w="100%" bg="rgba(240, 168, 184, 0.1)" borderRadius="full" overflow="hidden">
                <Box
                  h="100%"
                  w={`${Math.max(2, (stats.tiers.emerging / Math.max(1, stats.totalParticipants)) * 100)}%`}
                  bg="linear-gradient(90deg, #f0a8b8 0%, #c04a67 100%)"
                  borderRadius="full"
                />
              </Box>
            </Box>
          </Flex>
        </Box>
      </SimpleGrid>
    </Flex>
  );
}
