"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputLeftElement,
  Collapse,
  Link,
} from "@chakra-ui/react";
import {
  FaUniversity,
  FaTrophy,
  FaMedal,
  FaCrown,
  FaUsers,
  FaCodeBranch,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaBolt,
  FaFire,
} from "react-icons/fa";
import { RowObj } from "./ColumnsTable";
import { NextAvatar } from "components/image/Avatar";

interface CampusBattleDashboardProps {
  tableData: RowObj[];
  eventName: string;
}

export interface CollegeStats {
  id: string;
  name: string;
  points: number;
  prs: number;
  contributors: number;
  avgPoints: number;
  topContributor: RowObj;
  allContributors: RowObj[];
}

function normalizeCollegeName(raw: string): string {
  const s = raw.trim();
  const lower = s
    .toLowerCase()
    .replace(/[,.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (
    lower.includes("iiit allahabad") ||
    lower === "iiita" ||
    (lower.includes("indian institute of information technology") &&
      lower.includes("allahabad"))
  ) {
    return "IIIT Allahabad";
  }
  if (
    lower.includes("iiit vadodara") ||
    (lower.includes("indian institute of information technology") &&
      lower.includes("vadodara"))
  ) {
    return "IIIT Vadodara";
  }
  if (lower.includes("chennai institute of technology")) {
    return "Chennai Institute of Technology";
  }
  if (lower.includes("motilal nehru") || lower.includes("mnnit")) {
    return "MNNIT Allahabad";
  }
  if (lower.includes("amity")) {
    return "Amity University";
  }
  if (lower.includes("nit raipur")) {
    return "NIT Raipur";
  }
  if (lower.includes("nit hamirpur")) {
    return "NIT Hamirpur";
  }
  if (lower.includes("nit srinagar")) {
    return "NIT Srinagar";
  }
  if (lower.includes("nit silchar")) {
    return "NIT Silchar";
  }
  if (lower.includes("iit dhanbad") || lower.includes("iit ism")) {
    return "IIT (ISM) Dhanbad";
  }
  return s;
}

export default function CampusBattleDashboard({
  tableData,
  eventName,
}: CampusBattleDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCollege, setExpandedCollege] = useState<string | null>(null);

  // Group and rank colleges
  const { colleges, totalEventPoints, dominantCollege, highestYieldCollege } =
    useMemo(() => {
      const map: Record<string, CollegeStats> = {};

      tableData.forEach((u) => {
        const rawCollege = (u.college ?? "").trim();
        if (!rawCollege || rawCollege.toLowerCase() === "unknown") return;

        const normalized = normalizeCollegeName(rawCollege);
        const pts = Number(u.points) || 0;
        const prs = Number(u.prmerged) || 0;

        if (!map[normalized]) {
          map[normalized] = {
            id: normalized,
            name: normalized,
            points: 0,
            prs: 0,
            contributors: 0,
            avgPoints: 0,
            topContributor: u,
            allContributors: [],
          };
        }

        map[normalized].points += pts;
        map[normalized].prs += prs;
        map[normalized].contributors += 1;
        map[normalized].allContributors.push(u);

        if (pts > (Number(map[normalized].topContributor.points) || 0)) {
          map[normalized].topContributor = u;
        }
      });

      const list = Object.values(map).map((col) => {
        col.avgPoints = Math.round(col.points / Math.max(1, col.contributors));
        col.allContributors.sort(
          (a, b) => (Number(b.points) || 0) - (Number(a.points) || 0)
        );
        return col;
      });

      list.sort((a, b) => b.points - a.points);

      const totalEventPoints = list.reduce((acc, c) => acc + c.points, 0);
      const dominantCollege = list[0];
      const highestYieldCollege = [...list]
        .filter((c) => c.contributors >= 2)
        .sort((a, b) => b.avgPoints - a.avgPoints)[0];

      return {
        colleges: list,
        totalEventPoints,
        dominantCollege,
        highestYieldCollege,
      };
    }, [tableData]);

  const filteredColleges = useMemo(() => {
    if (!searchQuery.trim()) return colleges;
    const q = searchQuery.toLowerCase();
    return colleges.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.topContributor.name.toLowerCase().includes(q) ||
        c.topContributor.githubid.toLowerCase().includes(q)
    );
  }, [colleges, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedCollege((prev) => (prev === id ? null : id));
  };

  if (!tableData || tableData.length === 0) {
    return (
      <Flex direction="column" align="center" justify="center" py="50px">
        <Text color="#AEBCC7" fontSize="16px">
          No college data available for {eventName}.
        </Text>
      </Flex>
    );
  }

  const top1 = colleges[0];
  const top2 = colleges[1];
  const top3 = colleges[2];

  return (
    <Flex direction="column" gap="24px" w="100%">
      {/* 1. TOP 3 CAMPUS SHOWCASE (PODIUM) */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: "16px", md: "20px" }} alignItems="flex-end">
        {/* #2 SILVER CAMPUS */}
        {top2 && (
          <Box
            p="20px"
            borderRadius="22px"
            bg="linear-gradient(135deg, rgba(16, 37, 53, 0.75) 0%, rgba(13, 34, 51, 0.70) 100%)"
            border="1px solid rgba(226, 232, 240, 0.35)"
            backdropFilter="blur(20px)"
            boxShadow="0 10px 30px rgba(0, 0, 0, 0.45)"
            order={{ base: 2, md: 1 }}
            position="relative"
            overflow="hidden"
          >
            <Flex
              align="center"
              justify="center"
              gap="6px"
              px="12px"
              py="3px"
              borderRadius="full"
              bg="rgba(226, 232, 240, 0.15)"
              border="1px solid rgba(226, 232, 240, 0.4)"
              color="#E2E8F0"
              fontSize="12px"
              fontWeight="900"
              fontFamily="var(--f-mono)"
              w="fit-content"
              mb="12px"
            >
              <FaMedal size={11} color="#E2E8F0" /> #2 RUNNER-UP
            </Flex>

            <Text
              fontSize="18px"
              fontWeight="800"
              color="#F4F1E8"
              mb="4px"
              noOfLines={1}
              title={top2.name}
            >
              {top2.name}
            </Text>

            <Text
              fontFamily="var(--f-mono)"
              fontSize="28px"
              fontWeight="900"
              color="#E2E8F0"
              lineHeight="1"
              mb="12px"
            >
              {top2.points.toLocaleString()}{" "}
              <Text as="span" fontSize="14px" fontWeight="600" color="#AEBCC7">
                pts
              </Text>
            </Text>

            <Flex justify="space-between" align="center" p="10px 14px" bg="rgba(0,0,0,0.25)" borderRadius="14px" mb="12px">
              <Text fontSize="12px" color="#AEBCC7">
                <Text as="span" fontWeight="800" color="#F4F1E8">{top2.contributors}</Text> Contributors
              </Text>
              <Text fontSize="12px" color="#AEBCC7">
                <Text as="span" fontWeight="800" color="#F4F1E8">{top2.prs}</Text> PRs
              </Text>
            </Flex>

            {/* Campus MVP */}
            <Flex align="center" gap="10px" p="8px 12px" bg="rgba(226, 232, 240, 0.08)" borderRadius="12px">
              <NextAvatar src={top2.topContributor.avatarUrl} h="32px" w="32px" />
              <Box minW={0}>
                <Text fontSize="10px" color="#E2E8F0" fontWeight="700" letterSpacing="0.05em">
                  CAMPUS MVP
                </Text>
                <Text fontSize="12px" fontWeight="700" color="#F4F1E8" noOfLines={1}>
                  {top2.topContributor.name} ({top2.topContributor.points} pts)
                </Text>
              </Box>
            </Flex>
          </Box>
        )}

        {/* #1 GOLD CAMPUS (ELEVATED CHAMPION) */}
        {top1 && (
          <Box
            p="24px"
            borderRadius="24px"
            bg="linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(13, 34, 51, 0.85) 100%)"
            border="2px solid rgba(255, 215, 0, 0.55)"
            backdropFilter="blur(22px)"
            boxShadow="0 14px 40px rgba(255, 215, 0, 0.25), 0 0 30px rgba(255, 215, 0, 0.15)"
            order={{ base: 1, md: 2 }}
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="-20px"
              right="-20px"
              w="100px"
              h="100px"
              borderRadius="full"
              bg="rgba(255, 215, 0, 0.12)"
              filter="blur(25px)"
            />

            <Flex
              align="center"
              justify="center"
              gap="6px"
              px="14px"
              py="4px"
              borderRadius="full"
              bg="linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
              color="#0C1C2C"
              fontSize="12px"
              fontWeight="900"
              fontFamily="var(--f-mono)"
              w="fit-content"
              mb="14px"
              boxShadow="0 4px 14px rgba(255, 215, 0, 0.4)"
            >
              <FaCrown size={13} color="#0C1C2C" /> #1 REIGNING CHAMPION
            </Flex>

            <Text
              fontSize="20px"
              fontWeight="900"
              color="#F4F1E8"
              mb="6px"
              noOfLines={1}
              title={top1.name}
            >
              {top1.name}
            </Text>

            <Text
              fontFamily="var(--f-mono)"
              fontSize="36px"
              fontWeight="900"
              color="#FFD700"
              lineHeight="1"
              mb="14px"
            >
              {top1.points.toLocaleString()}{" "}
              <Text as="span" fontSize="16px" fontWeight="600" color="#AEBCC7">
                pts
              </Text>
            </Text>

            <Flex justify="space-between" align="center" p="12px 16px" bg="rgba(0,0,0,0.35)" borderRadius="16px" border="1px solid rgba(255, 215, 0, 0.25)" mb="14px">
              <Box>
                <Text fontSize="11px" color="#AEBCC7" textTransform="uppercase" fontWeight="700">
                  Dev Squad
                </Text>
                <Text fontSize="15px" fontWeight="900" color="#F4F1E8">
                  {top1.contributors} creators
                </Text>
              </Box>
              <Box textAlign="right">
                <Text fontSize="11px" color="#AEBCC7" textTransform="uppercase" fontWeight="700">
                  Total PRs
                </Text>
                <Text fontSize="15px" fontWeight="900" color="#FFD700">
                  {top1.prs} merged
                </Text>
              </Box>
            </Flex>

            {/* Campus MVP */}
            <Flex align="center" gap="12px" p="10px 14px" bg="rgba(255, 215, 0, 0.12)" borderRadius="14px" border="1px solid rgba(255, 215, 0, 0.3)">
              <NextAvatar src={top1.topContributor.avatarUrl} h="38px" w="38px" />
              <Box minW={0}>
                <Text fontSize="11px" color="#FFD700" fontWeight="900" letterSpacing="0.06em">
                  ★ CAMPUS MVP
                </Text>
                <Text fontSize="13px" fontWeight="800" color="#F4F1E8" noOfLines={1}>
                  {top1.topContributor.name} ({top1.topContributor.points} pts)
                </Text>
              </Box>
            </Flex>
          </Box>
        )}

        {/* #3 BRONZE CAMPUS */}
        {top3 && (
          <Box
            p="20px"
            borderRadius="22px"
            bg="linear-gradient(135deg, rgba(16, 37, 53, 0.75) 0%, rgba(13, 34, 51, 0.70) 100%)"
            border="1px solid rgba(88, 185, 154, 0.35)"
            backdropFilter="blur(20px)"
            boxShadow="0 10px 30px rgba(0, 0, 0, 0.45)"
            order={{ base: 3, md: 3 }}
            position="relative"
            overflow="hidden"
          >
            <Flex
              align="center"
              justify="center"
              gap="6px"
              px="12px"
              py="3px"
              borderRadius="full"
              bg="rgba(88, 185, 154, 0.15)"
              border="1px solid rgba(88, 185, 154, 0.4)"
              color="#B8E5D5"
              fontSize="12px"
              fontWeight="900"
              fontFamily="var(--f-mono)"
              w="fit-content"
              mb="12px"
            >
              <FaMedal size={11} color="#B8E5D5" /> #3 CONTENDER
            </Flex>

            <Text
              fontSize="18px"
              fontWeight="800"
              color="#F4F1E8"
              mb="4px"
              noOfLines={1}
              title={top3.name}
            >
              {top3.name}
            </Text>

            <Text
              fontFamily="var(--f-mono)"
              fontSize="28px"
              fontWeight="900"
              color="#B8E5D5"
              lineHeight="1"
              mb="12px"
            >
              {top3.points.toLocaleString()}{" "}
              <Text as="span" fontSize="14px" fontWeight="600" color="#AEBCC7">
                pts
              </Text>
            </Text>

            <Flex justify="space-between" align="center" p="10px 14px" bg="rgba(0,0,0,0.25)" borderRadius="14px" mb="12px">
              <Text fontSize="12px" color="#AEBCC7">
                <Text as="span" fontWeight="800" color="#F4F1E8">{top3.contributors}</Text> Contributors
              </Text>
              <Text fontSize="12px" color="#AEBCC7">
                <Text as="span" fontWeight="800" color="#F4F1E8">{top3.prs}</Text> PRs
              </Text>
            </Flex>

            {/* Campus MVP */}
            <Flex align="center" gap="10px" p="8px 12px" bg="rgba(88, 185, 154, 0.08)" borderRadius="12px">
              <NextAvatar src={top3.topContributor.avatarUrl} h="32px" w="32px" />
              <Box minW={0}>
                <Text fontSize="10px" color="#B8E5D5" fontWeight="700" letterSpacing="0.05em">
                  CAMPUS MVP
                </Text>
                <Text fontSize="12px" fontWeight="700" color="#F4F1E8" noOfLines={1}>
                  {top3.topContributor.name} ({top3.topContributor.points} pts)
                </Text>
              </Box>
            </Flex>
          </Box>
        )}
      </SimpleGrid>

      {/* 2. CAMPUS BATTLE TABLE CONTAINER */}
      <Box
        borderRadius="24px"
        bg="linear-gradient(135deg, rgba(16, 37, 53, 0.85) 0%, rgba(13, 34, 51, 0.82) 100%)"
        border="1px solid rgba(88, 185, 154, 0.22)"
        backdropFilter="blur(24px)"
        boxShadow="0 18px 45px rgba(0, 0, 0, 0.55)"
        p={{ base: "16px", md: "24px" }}
      >
        {/* Table Header & Search */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          gap="16px"
          mb="20px"
          pb="16px"
          borderBottom="1px solid rgba(88, 185, 154, 0.14)"
        >
          <Box>
            <Flex align="center" gap="10px">
              <Box color="#B8E5D5">
                <FaUniversity size={20} />
              </Box>
              <Text
                fontFamily="var(--f-display), 'Cormorant Garamond', Georgia, serif"
                fontSize={{ base: "22px", md: "26px" }}
                fontWeight="700"
                color="#F4F1E8"
                lineHeight="1.2"
              >
                Campus Leaderboard
              </Text>
            </Flex>
            <Text fontSize="13px" color="#AEBCC7" mt="4px">
              {colleges.length} competing colleges & universities · Ranked by cumulative points
            </Text>
          </Box>

          {/* Quick Search */}
          <InputGroup maxW={{ base: "100%", sm: "280px" }}>
            <InputLeftElement pointerEvents="none" color="#AEBCC7">
              <FaSearch size={14} />
            </InputLeftElement>
            <Input
              placeholder="Search college or MVP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="rgba(7, 19, 31, 0.65)"
              border="1px solid rgba(88, 185, 154, 0.22)"
              borderRadius="full"
              color="#F4F1E8"
              fontSize="13px"
              _focus={{
                borderColor: "#B8E5D5",
                boxShadow: "0 0 10px rgba(88, 185, 154, 0.3)",
              }}
              _placeholder={{ color: "rgba(174, 188, 199, 0.5)" }}
            />
          </InputGroup>
        </Flex>

        {/* Table */}
        <Box overflowX="auto" borderRadius="18px" border="1px solid rgba(88, 185, 154, 0.16)" bg="rgba(7, 19, 31, 0.45)">
          <Table variant="unstyled" minW="760px">
            <Thead bg="rgba(88, 185, 154, 0.06)" borderBottom="1px solid rgba(88, 185, 154, 0.2)">
              <Tr>
                <Th py="14px" px="16px" color="#AEBCC7" fontFamily="var(--f-mono)" fontSize="12px" letterSpacing="0.12em" textAlign="center">
                  RANK
                </Th>
                <Th py="14px" px="16px" color="#AEBCC7" fontFamily="var(--f-mono)" fontSize="12px" letterSpacing="0.12em">
                  COLLEGE / INSTITUTION
                </Th>
                <Th py="14px" px="16px" color="#AEBCC7" fontFamily="var(--f-mono)" fontSize="12px" letterSpacing="0.12em" textAlign="center">
                  CONTRIBUTORS
                </Th>
                <Th py="14px" px="16px" color="#AEBCC7" fontFamily="var(--f-mono)" fontSize="12px" letterSpacing="0.12em" textAlign="center">
                  PRS MERGED
                </Th>
                <Th py="14px" px="16px" color="#AEBCC7" fontFamily="var(--f-mono)" fontSize="12px" letterSpacing="0.12em" textAlign="center">
                  AVG / DEV
                </Th>
                <Th py="14px" px="16px" color="#AEBCC7" fontFamily="var(--f-mono)" fontSize="12px" letterSpacing="0.12em" textAlign="right">
                  TOTAL POINTS
                </Th>
              </Tr>
            </Thead>

            <Tbody>
              {filteredColleges.map((col, idx) => {
                const rank = idx + 1;
                const isExpanded = expandedCollege === col.id;
                const rankColor =
                  rank === 1
                    ? "#FFD700"
                    : rank === 2
                    ? "#E2E8F0"
                    : rank === 3
                    ? "#B8E5D5"
                    : "#AEBCC7";

                return (
                  <React.Fragment key={col.id}>
                    <Tr
                      cursor="pointer"
                      onClick={() => toggleExpand(col.id)}
                      transition="all 0.2s ease"
                      bg={isExpanded ? "rgba(88, 185, 154, 0.09)" : "transparent"}
                      _hover={{ bg: "rgba(88, 185, 154, 0.07)" }}
                      borderBottom="1px solid rgba(88, 185, 154, 0.1)"
                    >
                      {/* Rank */}
                      <Td py="16px" px="16px" textAlign="center">
                        <Flex justify="center" align="center">
                          {rank <= 3 ? (
                            <Flex
                              align="center"
                              justify="center"
                              gap="5px"
                              px="10px"
                              py="3px"
                              borderRadius="full"
                              bg={
                                rank === 1
                                  ? "rgba(255, 215, 0, 0.12)"
                                  : rank === 2
                                  ? "rgba(226, 232, 240, 0.12)"
                                  : "rgba(88, 185, 154, 0.12)"
                              }
                              border="1px solid"
                              borderColor={rankColor}
                            >
                              <FaTrophy color={rankColor} size={12} />
                              <Text
                                fontFamily="var(--f-mono)"
                                fontWeight="800"
                                fontSize="13px"
                                color={rankColor}
                              >
                                #{rank}
                              </Text>
                            </Flex>
                          ) : (
                            <Text
                              fontFamily="var(--f-mono)"
                              fontWeight="700"
                              fontSize="14px"
                              color="#AEBCC7"
                            >
                              #{rank}
                            </Text>
                          )}
                        </Flex>
                      </Td>

                      {/* College Name & MVP subtitle */}
                      <Td py="16px" px="16px">
                        <Box>
                          <Flex align="center" gap="8px">
                            <Text fontWeight="800" fontSize="15px" color="#F4F1E8">
                              {col.name}
                            </Text>
                            <Box color="#AEBCC7" opacity={0.6}>
                              {isExpanded ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                            </Box>
                          </Flex>
                          <Text fontSize="12px" color="#AEBCC7" opacity={0.8} mt="2px">
                            MVP: <Text as="span" color="#D4F0E7" fontWeight="600">{col.topContributor.name}</Text> (@{col.topContributor.githubid})
                          </Text>
                        </Box>
                      </Td>

                      {/* Contributors count */}
                      <Td py="16px" px="16px" textAlign="center">
                        <Flex justify="center">
                          <Flex
                            align="center"
                            gap="6px"
                            px="12px"
                            py="3px"
                            borderRadius="full"
                            bg="rgba(88, 185, 154, 0.1)"
                            border="1px solid rgba(88, 185, 154, 0.2)"
                            color="#F4F1E8"
                            fontSize="13px"
                            fontWeight="700"
                          >
                            <FaUsers size={11} color="#B8E5D5" />
                            {col.contributors} devs
                          </Flex>
                        </Flex>
                      </Td>

                      {/* PRs */}
                      <Td py="16px" px="16px" textAlign="center">
                        <Flex justify="center">
                          <Flex
                            align="center"
                            gap="6px"
                            px="12px"
                            py="3px"
                            borderRadius="full"
                            bg="rgba(88, 185, 154, 0.1)"
                            border="1px solid rgba(88, 185, 154, 0.2)"
                            color="#F4F1E8"
                            fontFamily="var(--f-mono)"
                            fontSize="13px"
                            fontWeight="700"
                          >
                            <FaCodeBranch size={11} color="#B8E5D5" />
                            {col.prs} PRs
                          </Flex>
                        </Flex>
                      </Td>

                      {/* Avg / Dev */}
                      <Td py="16px" px="16px" textAlign="center">
                        <Text fontFamily="var(--f-mono)" fontWeight="700" fontSize="13px" color="#AEBCC7">
                          {col.avgPoints} pts
                        </Text>
                      </Td>

                      {/* Total Points */}
                      <Td py="16px" px="16px" textAlign="right">
                        <Flex justify="flex-end" align="center" gap="8px">
                          <Text
                            fontFamily="var(--f-mono)"
                            fontWeight="900"
                            fontSize="16px"
                            color={rank === 1 ? "#FFD700" : "#D4F0E7"}
                          >
                            {col.points.toLocaleString()}
                          </Text>
                          <FaTrophy color={rank === 1 ? "#FFD700" : "#B8E5D5"} size={13} />
                        </Flex>
                      </Td>
                    </Tr>

                    {/* EXPANDABLE CONTRIBUTORS LIST FOR THIS COLLEGE */}
                    {isExpanded && (
                      <Tr bg="rgba(7, 19, 31, 0.55)">
                        <Td colSpan={6} py="16px" px="24px">
                          <Box>
                            <Text
                              fontSize="12px"
                              fontWeight="700"
                              color="#B8E5D5"
                              letterSpacing="0.08em"
                              textTransform="uppercase"
                              mb="10px"
                            >
                              Top Contributors from {col.name} ({col.contributors} total)
                            </Text>

                            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="12px">
                              {col.allContributors.map((user, uIdx) => (
                                <Link
                                  key={user.githubid}
                                  href={`/user/profile/${user.githubid}`}
                                  _hover={{ textDecoration: "none" }}
                                >
                                  <Flex
                                    align="center"
                                    gap="10px"
                                    p="10px 14px"
                                    borderRadius="14px"
                                    bg="rgba(16, 37, 53, 0.7)"
                                    border="1px solid rgba(88, 185, 154, 0.16)"
                                    transition="all 0.2s ease"
                                    _hover={{
                                      borderColor: "#B8E5D5",
                                      transform: "translateY(-1px)",
                                      bg: "rgba(13, 34, 51, 0.8)",
                                    }}
                                  >
                                    <NextAvatar src={user.avatarUrl} h="34px" w="34px" />
                                    <Box minW={0} flex="1">
                                      <Flex align="center" justify="space-between">
                                        <Text fontWeight="800" fontSize="13px" color="#F4F1E8" noOfLines={1}>
                                          {user.name}
                                        </Text>
                                        <Text fontFamily="var(--f-mono)" fontWeight="800" fontSize="12px" color="#D4F0E7">
                                          #{user.position}
                                        </Text>
                                      </Flex>
                                      <Flex justify="space-between" align="center" mt="2px">
                                        <Text fontSize="11px" color="#AEBCC7" opacity={0.7} noOfLines={1}>
                                          @{user.githubid}
                                        </Text>
                                        <Text fontSize="11px" color="#B8E5D5" fontWeight="700" fontFamily="var(--f-mono)">
                                          {user.points} pts
                                        </Text>
                                      </Flex>
                                    </Box>
                                  </Flex>
                                </Link>
                              ))}
                            </SimpleGrid>
                          </Box>
                        </Td>
                      </Tr>
                    )}
                  </React.Fragment>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Flex>
  );
}
