"use client";

import {
  Flex,
  Box,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Link,
  Button,
  useBreakpointValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
} from "@chakra-ui/react";
import * as React from "react";
import { isMaintainer } from "constants/Maintainers";
import { FaTrophy, FaChartLine, FaList, FaFlagCheckered } from "react-icons/fa";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import Card from "components/card/Card";
import PersonalRaceTracker from "./PersonalRaceTracker";
import { NextAvatar } from "components/image/Avatar";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

export type RowObj = {
  position: string;
  name: string;
  avatarUrl: string;
  githubid: string;
  prmerged: number;
  points: number;
  prDetailsURL: string;
  college?: string;
  graduationYear?: string | number;
};

const columnHelper = createColumnHelper<RowObj>();

function getCurrentGithubID(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return JSON.parse(localStorage.getItem('user') ?? '{}')?.githubId;
  } catch {
    return undefined;
  }
}

const trophyColors: Record<number, string> = {
  1: "#FFD700", // Gold
  2: "#E2E8F0", // Silver
  3: "#F0A8B8", // Sakura Bronze
};

function MobileLeaderboard({ table }: { table: any }) {
  if (!table) return null;
  const rows = table.getPaginationRowModel().rows;

  return (
    <Flex direction="column" gap="14px">
      {/* LIST */}
      {rows.map((row: any) => {
        const user = row.original as RowObj;
        const rank = Number(user.position);
        const isTop3 = !Number.isNaN(rank) && rank >= 1 && rank <= 3;
        const trophyColor = trophyColors[rank as 1 | 2 | 3];

        return (
          <Flex
            key={user.githubid}
            align="center"
            justify="space-between"
            p="14px"
            borderRadius="18px"
            bg="linear-gradient(135deg, rgba(30, 18, 38, 0.78) 0%, rgba(45, 26, 54, 0.72) 100%)"
            border="1px solid rgba(240, 168, 184, 0.18)"
            backdropFilter="blur(16px)"
            boxShadow="0 8px 24px rgba(0, 0, 0, 0.4)"
            transition="all 0.2s ease"
            _hover={{
              borderColor: "rgba(240, 168, 184, 0.35)",
              transform: "translateY(-1px)",
            }}
          >
            <Link
              href={`/user/profile/${user.githubid}`}
              _hover={{ textDecoration: "none" }}
            >
              <Flex align="center" gap="12px">
                <Flex align="center" justify="center" minW="32px">
                  {isTop3 ? (
                    <Flex align="center" gap="4px">
                      <FaTrophy color={trophyColor} size={14} />
                      <Text
                        fontFamily="var(--f-mono), monospace"
                        fontWeight="800"
                        fontSize="14px"
                        color={trophyColor}
                      >
                        {user.position}
                      </Text>
                    </Flex>
                  ) : (
                    <Text
                      fontFamily="var(--f-mono), monospace"
                      fontWeight="700"
                      fontSize="14px"
                      color="#dfced5"
                    >
                      {user.position}
                    </Text>
                  )}
                </Flex>

                <Box
                  borderRadius="full"
                  p="2px"
                  bg="linear-gradient(135deg, rgba(240, 168, 184, 0.4), rgba(192, 74, 103, 0.2))"
                >
                  <NextAvatar
                    src={user.avatarUrl}
                    h="42px"
                    w="42px"
                  />
                </Box>

                <Box>
                  <Text fontWeight="700" fontSize="14px" color="#fff1ec">
                    {user.name}
                  </Text>
                  <Text fontSize="12px" color="#dfced5" opacity={0.8}>
                    @{user.githubid}
                  </Text>
                </Box>
              </Flex>
            </Link>

            <Flex align="center" gap="10px">
              <Flex
                align="center"
                justify="center"
                px="10px"
                py="3px"
                borderRadius="full"
                bg="rgba(240, 168, 184, 0.12)"
                border="1px solid rgba(240, 168, 184, 0.28)"
                color="#fff1ec"
                fontFamily="var(--f-mono), monospace"
                fontWeight="700"
                fontSize="12px"
              >
                {user.prmerged} PRs
              </Flex>

              <Flex align="center" gap="6px">
                <Text
                  fontWeight="800"
                  fontFamily="var(--f-mono), monospace"
                  color="#ffd0dc"
                  fontSize="15px"
                >
                  {user.points}
                </Text>
                <FaTrophy color="#FFD700" size={12} />
              </Flex>
            </Flex>
          </Flex>
        );
      })}

      {/* PAGINATION */}
      <Flex direction="column" gap="10px" mt="10px">
        <Text
          fontSize="12px"
          color="#dfced5"
          textAlign="center"
          fontFamily="var(--f-mono), monospace"
        >
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {Math.max(1, table.getPageCount())}
        </Text>

        <Flex gap="10px">
          <Button
            flex="1"
            size="sm"
            h="36px"
            onClick={() => table.previousPage()}
            isDisabled={!table.getCanPreviousPage()}
            borderRadius="full"
            bg="rgba(240, 168, 184, 0.1)"
            border="1px solid rgba(240, 168, 184, 0.25)"
            color="#fff1ec"
            _hover={{
              bg: "rgba(240, 168, 184, 0.2)",
              borderColor: "#f0a8b8",
            }}
            _disabled={{
              opacity: 0.35,
              cursor: "not-allowed",
              bg: "transparent",
            }}
          >
            Prev
          </Button>

          <Button
            flex="1"
            size="sm"
            h="36px"
            onClick={() => table.nextPage()}
            isDisabled={!table.getCanNextPage()}
            borderRadius="full"
            bg="rgba(240, 168, 184, 0.1)"
            border="1px solid rgba(240, 168, 184, 0.25)"
            color="#fff1ec"
            _hover={{
              bg: "rgba(240, 168, 184, 0.2)",
              borderColor: "#f0a8b8",
            }}
            _disabled={{
              opacity: 0.35,
              cursor: "not-allowed",
              bg: "transparent",
            }}
          >
            Next
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}

function ColumnTable({
  tableData,
  eventName,
}: {
  tableData: RowObj[];
  eventName: string;
}) {
  const [currentGithubID, setCurrentGithubID] = React.useState<string | undefined>(undefined);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [showRankings, setShowRankings] = React.useState(true);

  React.useEffect(() => {
    setCurrentGithubID(getCurrentGithubID());
  }, []);

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 50,
  });

  const isCurrentUser = (row: any) =>
    Boolean(currentGithubID && row.original.githubid === currentGithubID);

  const isMobile = useBreakpointValue({ base: true, md: false });

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("position", {
        header: () => (
          <Flex justify="center">
            <Text letterSpacing="0.14em">RANK</Text>
          </Flex>
        ),
        cell: (info) => {
          const value = info.getValue();
          const pos = typeof value === "string" ? parseInt(value, 10) : value;
          const display = Number.isNaN(Number(pos)) ? value : pos;
          const isTop3 = typeof pos === "number" && pos >= 1 && pos <= 3;
          const trophyColor = trophyColors[pos as 1 | 2 | 3];

          return (
            <Flex justify="center" align="center">
              {isTop3 ? (
                <Flex
                  align="center"
                  justify="center"
                  gap="6px"
                  px="12px"
                  py="4px"
                  borderRadius="full"
                  bg={
                    pos === 1
                      ? "rgba(255, 215, 0, 0.12)"
                      : pos === 2
                      ? "rgba(226, 232, 240, 0.12)"
                      : "rgba(240, 168, 184, 0.12)"
                  }
                  border="1px solid"
                  borderColor={
                    pos === 1
                      ? "rgba(255, 215, 0, 0.45)"
                      : pos === 2
                      ? "rgba(226, 232, 240, 0.45)"
                      : "rgba(240, 168, 184, 0.45)"
                  }
                  boxShadow={
                    pos === 1
                      ? "0 0 12px rgba(255, 215, 0, 0.25)"
                      : pos === 2
                      ? "0 0 12px rgba(226, 232, 240, 0.2)"
                      : "0 0 12px rgba(240, 168, 184, 0.2)"
                  }
                >
                  <FaTrophy color={trophyColor} size={13} />
                  <Text
                    fontFamily="var(--f-mono), monospace"
                    fontWeight="800"
                    fontSize="13px"
                    color={trophyColor}
                  >
                    {display}
                  </Text>
                </Flex>
              ) : (
                <Text
                  fontFamily="var(--f-mono), monospace"
                  fontWeight="700"
                  fontSize="14px"
                  color="#dfced5"
                >
                  {display}
                </Text>
              )}
            </Flex>
          );
        },
      }),

      columnHelper.accessor("name", {
        header: () => (
          <Text textAlign="left" letterSpacing="0.14em">
            NAME
          </Text>
        ),
        cell: (info) => {
          const row = info.row.original;
          return (
            <Box textAlign="left">
              <Text fontWeight="700" fontSize="15px" color="#fff1ec">
                {info.getValue()}
              </Text>
              {row.college && (
                <Text
                  fontSize="12px"
                  color="#dfced5"
                  opacity={0.7}
                  noOfLines={1}
                  maxW="240px"
                >
                  {row.college}
                </Text>
              )}
            </Box>
          );
        },
      }),

      columnHelper.accessor("githubid", {
        header: () => (
          <Text textAlign="left" letterSpacing="0.14em">
            GITHUB
          </Text>
        ),
        cell: (info) => {
          const githubId = info.getValue();
          const isYou = githubId === currentGithubID;
          const maintainer = isMaintainer(githubId);
          const rowData = info.row.original;

          return (
            <Popover trigger="hover" placement="right" openDelay={0} isLazy>
              <PopoverTrigger>
                <Box display="inline-block">
                  <Link
                    href={`/user/profile/${githubId}`}
                    _hover={{ textDecoration: "none" }}
                  >
                    <Flex align="center" gap="10px">
                      <Box position="relative">
                        <Box
                          borderRadius="full"
                          p="2px"
                          bg="linear-gradient(135deg, rgba(240, 168, 184, 0.45), rgba(192, 74, 103, 0.25))"
                          transition="transform 0.2s ease"
                          _hover={{ transform: "scale(1.06)" }}
                        >
                          <NextAvatar
                            src={info.row.original.avatarUrl}
                            h="40px"
                            w="40px"
                          />
                        </Box>

                        {maintainer && (
                          <Box
                            position="absolute"
                            top="-8px"
                            right="-14px"
                            bg="linear-gradient(135deg, #FFB547 0%, #ED8936 100%)"
                            color="#1a0c16"
                            fontSize="9px"
                            fontWeight="900"
                            px="6px"
                            py="1px"
                            borderRadius="full"
                            boxShadow="0 2px 6px rgba(0,0,0,0.4)"
                            letterSpacing="0.05em"
                          >
                            MENTOR
                          </Box>
                        )}
                      </Box>

                      <Flex align="center" gap="8px">
                        <Text
                          fontWeight="700"
                          fontSize="14px"
                          color="#fff1ec"
                          transition="color 0.2s ease"
                          _hover={{ color: "#f0a8b8" }}
                        >
                          {githubId}
                        </Text>

                        {isYou && (
                          <Box
                            px="8px"
                            py="2px"
                            fontSize="10px"
                            fontWeight="900"
                            borderRadius="full"
                            bg="linear-gradient(135deg, #f0a8b8 0%, #c04a67 100%)"
                            color="#1a0c16"
                            boxShadow="0 2px 8px rgba(240, 168, 184, 0.4)"
                            letterSpacing="0.06em"
                          >
                            YOU
                          </Box>
                        )}
                      </Flex>
                    </Flex>
                  </Link>
                </Box>
              </PopoverTrigger>

              <PopoverContent
                bg="rgba(28, 16, 34, 0.96)"
                color="#fff1ec"
                border="1px solid rgba(240, 168, 184, 0.35)"
                borderRadius="16px"
                w="auto"
                minW="220px"
                boxShadow="0 18px 45px rgba(0, 0, 0, 0.8), 0 0 20px rgba(240, 168, 184, 0.15)"
                backdropFilter="blur(20px)"
                _focus={{ outline: "none" }}
                zIndex="popover"
              >
                <PopoverArrow bg="rgba(28, 16, 34, 0.96)" />
                <PopoverBody p="16px">
                  <Text
                    fontWeight="800"
                    fontSize="md"
                    mb="3"
                    color="#fff1ec"
                    fontFamily="var(--f-sans)"
                  >
                    {rowData.name}
                  </Text>

                  <Flex justify="space-between" align="center" mb="2">
                    <Text fontSize="sm" color="#dfced5" fontWeight="500">
                      Points
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="800"
                      color="#f0a8b8"
                      fontFamily="var(--f-mono), monospace"
                    >
                      {rowData.points}
                    </Text>
                  </Flex>

                  <Flex justify="space-between" align="center" mb="4">
                    <Text fontSize="sm" color="#dfced5" fontWeight="500">
                      PRs Merged
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="800"
                      color="#fff1ec"
                      fontFamily="var(--f-mono), monospace"
                    >
                      {rowData.prmerged}
                    </Text>
                  </Flex>

                  <Text
                    fontSize="xs"
                    color="#f0a8b8"
                    fontWeight="700"
                    align="center"
                    letterSpacing="0.04em"
                  >
                    Click to view profile &rarr;
                  </Text>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          );
        },
      }),

      columnHelper.accessor("prmerged", {
        header: () => (
          <Flex justify="center">
            <Text letterSpacing="0.14em">PRS</Text>
          </Flex>
        ),
        cell: (info) => (
          <Flex justify="center">
            <Flex
              align="center"
              justify="center"
              minW="42px"
              h="32px"
              px="12px"
              borderRadius="full"
              bg="rgba(240, 168, 184, 0.12)"
              border="1px solid rgba(240, 168, 184, 0.28)"
              color="#fff1ec"
              fontFamily="var(--f-mono), monospace"
              fontWeight="800"
              fontSize="13px"
              boxShadow="inset 0 0 8px rgba(240, 168, 184, 0.08)"
            >
              {info.getValue()}
            </Flex>
          </Flex>
        ),
      }),

      columnHelper.accessor("points", {
        header: () => (
          <Flex justify="flex-end">
            <Text letterSpacing="0.14em">POINTS</Text>
          </Flex>
        ),
        cell: (info) => (
          <Flex justify="flex-end" align="center" gap="8px">
            <Text
              fontFamily="var(--f-mono), monospace"
              fontWeight="800"
              fontSize="15px"
              color="#ffd0dc"
            >
              {info.getValue()}
            </Text>
            <FaTrophy color="#FFD700" size={14} />
          </Flex>
        ),
      }),
    ],
    [currentGithubID]
  );

  const tbodyRef = React.useRef<HTMLTableSectionElement | null>(null);
  const prevFlipStateRef = React.useRef<Flip.FlipState | null>(null);

  React.useLayoutEffect(() => {
    if (!tbodyRef.current || isMobile || !showRankings) return;

    const rows = Array.from(
      tbodyRef.current.querySelectorAll("tr[data-row-id]")
    );

    const state = Flip.getState(rows);
    if (prevFlipStateRef.current) {
      Flip.from(prevFlipStateRef.current, {
        duration: 0.6,
        stagger: 0.02,
        ease: "power2.out",
        absolute: true,
      });
    }
    prevFlipStateRef.current = state;
  }, [pagination.pageIndex, sorting, isMobile, showRankings]);

  const reorderedData = React.useMemo(() => {
    if (!currentGithubID) return tableData;

    const currentUser = tableData.find(
      (u) => u.githubid === currentGithubID
    );

    if (!currentUser) return tableData;

    return [
      currentUser,
      ...tableData.filter((u) => u.githubid !== currentGithubID),
    ];
  }, [tableData]);

  const table = useReactTable({
    data: reorderedData,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => String(row.githubid),
  });

  return (
    <Card
      flexDirection="column"
      w="100%"
      px={{ base: "14px", md: "24px" }}
      py={{ base: "18px", md: "24px" }}
      borderRadius="24px"
      bg="linear-gradient(135deg, rgba(30, 18, 38, 0.85) 0%, rgba(42, 24, 50, 0.82) 100%)"
      border="1px solid rgba(240, 168, 184, 0.22)"
      backdropFilter="blur(24px)"
      boxShadow="0 20px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(240, 168, 184, 0.08), inset 0 1px 0 0 rgba(255, 241, 236, 0.1)"
      zIndex={10}
    >
      {/* HEADER */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        gap="16px"
        mb="22px"
        pb="18px"
        borderBottom="1px solid rgba(240, 168, 184, 0.14)"
      >
        <Box>
          <Text
            fontFamily="var(--f-display), 'Cormorant Garamond', Georgia, serif"
            fontSize={{ base: "24px", md: "30px" }}
            fontWeight="700"
            color="#fff1ec"
            letterSpacing="0.02em"
            lineHeight="1.2"
          >
            Contributor Rankings
          </Text>
          <Text
            fontSize="13px"
            color="#dfced5"
            mt="4px"
            fontWeight="500"
          >
            Every merged PR shapes the season. Find your standing among open source creators.
          </Text>
        </Box>

        {/* View Toggle: Rankings vs Analytics */}
        <Flex
          align="center"
          p="3px"
          bg="rgba(20, 12, 24, 0.75)"
          borderRadius="full"
          border="1px solid rgba(240, 168, 184, 0.22)"
          boxShadow="inset 0 2px 6px rgba(0,0,0,0.4)"
          alignSelf={{ base: "stretch", sm: "auto" }}
        >
          <Button
            size="sm"
            h="34px"
            px="16px"
            borderRadius="full"
            fontSize="13px"
            fontWeight={showRankings ? "700" : "500"}
            leftIcon={<FaList size={12} />}
            bg={
              showRankings
                ? "linear-gradient(135deg, #f0a8b8 0%, #ea8ea2 100%)"
                : "transparent"
            }
            color={showRankings ? "#1a0c16" : "#dfced5"}
            boxShadow={
              showRankings
                ? "0 2px 10px rgba(240, 168, 184, 0.35)"
                : "none"
            }
            _hover={{
              color: showRankings ? "#1a0c16" : "#fff1ec",
              bg: showRankings
                ? "linear-gradient(135deg, #f3b6c4 0%, #f09cb0 100%)"
                : "rgba(240, 168, 184, 0.08)",
            }}
            _active={{ transform: "scale(0.98)" }}
            transition="all 0.2s ease"
            onClick={() => setShowRankings(true)}
          >
            Rankings
          </Button>

          <Button
            size="sm"
            h="34px"
            px="16px"
            borderRadius="full"
            fontSize="13px"
            fontWeight={!showRankings ? "700" : "500"}
            leftIcon={<FaFlagCheckered size={12} />}
            bg={
              !showRankings
                ? "linear-gradient(135deg, #f0a8b8 0%, #ea8ea2 100%)"
                : "transparent"
            }
            color={!showRankings ? "#1a0c16" : "#dfced5"}
            boxShadow={
              !showRankings
                ? "0 2px 10px rgba(240, 168, 184, 0.35)"
                : "none"
            }
            _hover={{
              color: !showRankings ? "#1a0c16" : "#fff1ec",
              bg: !showRankings
                ? "linear-gradient(135deg, #f3b6c4 0%, #f09cb0 100%)"
                : "rgba(240, 168, 184, 0.08)",
            }}
            _active={{ transform: "scale(0.98)" }}
            transition="all 0.2s ease"
            onClick={() => setShowRankings(false)}
          >
            Race Tracker
          </Button>
        </Flex>
      </Flex>

      {showRankings ? (
        isMobile ? (
          <MobileLeaderboard table={table} />
        ) : (
          <Box
            overflowX="auto"
            borderRadius="18px"
            border="1px solid rgba(240, 168, 184, 0.16)"
            bg="rgba(20, 12, 24, 0.45)"
          >
            <Table variant="unstyled" minW="720px">
              <Thead
                bg="rgba(240, 168, 184, 0.06)"
                borderBottom="1px solid rgba(240, 168, 184, 0.2)"
              >
                {table.getHeaderGroups().map((hg) => (
                  <Tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <Th
                        key={header.id}
                        py="14px"
                        px="18px"
                        fontFamily="var(--f-mono), monospace"
                        fontSize="12px"
                        letterSpacing="0.14em"
                        fontWeight="700"
                        color="#dfced5"
                        textTransform="uppercase"
                        borderColor="transparent"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </Th>
                    ))}
                  </Tr>
                ))}
              </Thead>

              <Tbody ref={tbodyRef}>
                {table.getPaginationRowModel().rows.map((row) => (
                  <Tr
                    key={row.id}
                    data-row-id={row.id}
                    bg={
                      isCurrentUser(row)
                        ? "linear-gradient(90deg, rgba(240, 168, 184, 0.18) 0%, rgba(192, 74, 103, 0.14) 100%)"
                        : "transparent"
                    }
                    color="#fff1ec"
                    boxShadow={
                      isCurrentUser(row)
                        ? "inset 3px 0 0 #f0a8b8, 0 0 20px rgba(240, 168, 184, 0.15)"
                        : "none"
                    }
                    _hover={{
                      bg: isCurrentUser(row)
                        ? "linear-gradient(90deg, rgba(240, 168, 184, 0.25) 0%, rgba(192, 74, 103, 0.20) 100%)"
                        : "rgba(240, 168, 184, 0.07)",
                    }}
                    borderBottom="1px solid"
                    borderColor="rgba(240, 168, 184, 0.1)"
                    transition="all 0.2s ease"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Td key={cell.id} py="16px" px="18px">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {/* DESKTOP PAGINATION */}
            <Flex
              px="18px"
              py="16px"
              justify="space-between"
              align="center"
              borderTop="1px solid rgba(240, 168, 184, 0.12)"
              bg="rgba(20, 12, 24, 0.3)"
              flexWrap="wrap"
              gap="12px"
            >
              <Text
                fontSize="13px"
                color="#dfced5"
                fontFamily="var(--f-mono), monospace"
                fontWeight="600"
              >
                Page {pagination.pageIndex + 1} of{" "}
                {Math.max(1, table.getPageCount())}
              </Text>

              <Flex gap="10px">
                <Button
                  size="sm"
                  h="34px"
                  px="18px"
                  borderRadius="full"
                  fontSize="13px"
                  fontWeight="700"
                  bg="rgba(240, 168, 184, 0.1)"
                  border="1px solid rgba(240, 168, 184, 0.24)"
                  color="#fff1ec"
                  _hover={{
                    bg: "rgba(240, 168, 184, 0.22)",
                    borderColor: "#f0a8b8",
                    boxShadow: "0 0 12px rgba(240, 168, 184, 0.25)",
                  }}
                  _disabled={{
                    opacity: 0.35,
                    cursor: "not-allowed",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    bg: "transparent",
                  }}
                  onClick={() => table.previousPage()}
                  isDisabled={!table.getCanPreviousPage()}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  h="34px"
                  px="18px"
                  borderRadius="full"
                  fontSize="13px"
                  fontWeight="700"
                  bg="rgba(240, 168, 184, 0.1)"
                  border="1px solid rgba(240, 168, 184, 0.24)"
                  color="#fff1ec"
                  _hover={{
                    bg: "rgba(240, 168, 184, 0.22)",
                    borderColor: "#f0a8b8",
                    boxShadow: "0 0 12px rgba(240, 168, 184, 0.25)",
                  }}
                  _disabled={{
                    opacity: 0.35,
                    cursor: "not-allowed",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    bg: "transparent",
                  }}
                  onClick={() => table.nextPage()}
                  isDisabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </Flex>
            </Flex>
          </Box>
        )
      ) : (
        <PersonalRaceTracker
          tableData={tableData}
          eventName={decodeURIComponent(eventName)}
        />
      )}
    </Card>
  );
}

export default React.memo(ColumnTable);