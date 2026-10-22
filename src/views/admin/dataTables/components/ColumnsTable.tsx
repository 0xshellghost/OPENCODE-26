"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
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
import { FaTrophy, FaList, FaChartLine } from "react-icons/fa";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

import Card from "components/card/Card";
import LeaderboardGraph from "./LeadearboardGraph";
import { NextAvatar } from "components/image/Avatar";
import { isMaintainer } from "constants/Maintainers";

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

const TROPHY_COLORS: Record<number, string> = {
  1: "#F5C542", // Gold (Warm Amber)
  2: "#94A3B8", // Silver (Slate Silver)
  3: "#D97706", // Bronze (Warm Bronze)
};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function getCurrentGithubId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return JSON.parse(localStorage.getItem("user") ?? "{}")?.githubId;
  } catch {
    return undefined;
  }
}

/**
 * Top 3 trophy and numeric position badge used by both desktop and mobile views.
 */
function RankBadge({ position }: { position: string | number }) {
  const pos = typeof position === "string" ? parseInt(position, 10) : position;
  const isTop3 = typeof pos === "number" && !Number.isNaN(pos) && pos >= 1 && pos <= 3;
  const trophyColor = isTop3 ? TROPHY_COLORS[pos as 1 | 2 | 3] : undefined;

  if (isTop3 && trophyColor) {
    return (
      <Flex
        align="center"
        justify="center"
        gap="6px"
        px="12px"
        py="4px"
        borderRadius="full"
        bg={
          pos === 1
            ? "rgba(245, 197, 66, 0.15)"
            : pos === 2
            ? "rgba(148, 163, 184, 0.15)"
            : "rgba(217, 119, 6, 0.15)"
        }
        border="1px solid"
        borderColor={
          pos === 1
            ? "rgba(245, 197, 66, 0.45)"
            : pos === 2
            ? "rgba(148, 163, 184, 0.45)"
            : "rgba(217, 119, 6, 0.45)"
        }
        boxShadow={
          pos === 1
            ? "0 0 12px rgba(245, 197, 66, 0.25)"
            : pos === 2
            ? "0 0 12px rgba(148, 163, 184, 0.2)"
            : "0 0 12px rgba(217, 119, 6, 0.2)"
        }
      >
        <FaTrophy color={trophyColor} size={13} />
        <Text
          fontFamily="var(--f-mono), monospace"
          fontWeight="800"
          fontSize="13px"
          color={trophyColor}
        >
          {pos}
        </Text>
      </Flex>
    );
  }

  return (
    <Text
      fontFamily="var(--f-mono), monospace"
      fontWeight="700"
      fontSize="14px"
      color="var(--muted)"
    >
      {position}
    </Text>
  );
}

/**
 * Interactive User Popover displaying avatar, maintainer/self badges, and quick stats.
 */
function UserCell({
  rowData,
  currentGithubId,
  isOpencode,
}: {
  rowData: RowObj;
  currentGithubId?: string;
  isOpencode: boolean;
}) {
  const isYou = rowData.githubid === currentGithubId;
  const maintainer = isMaintainer(rowData.githubid);

  return (
    <Popover trigger="hover" placement="right" openDelay={0} isLazy>
      <PopoverTrigger>
        <Box display="inline-block">
          <Link
            href={`/user/profile/${rowData.githubid}`}
            _hover={{ textDecoration: "none" }}
          >
            <Flex align="center" gap="10px">
              <Box position="relative">
                <Box
                  borderRadius="full"
                  p="2px"
                  bg="linear-gradient(135deg, rgba(88, 185, 154, 0.45), rgba(45, 139, 111, 0.25))"
                  transition="transform 0.2s ease"
                  _hover={{ transform: "scale(1.06)" }}
                >
                  <NextAvatar src={rowData.avatarUrl} h="40px" w="40px" />
                </Box>

                {maintainer && (
                  <Box
                    position="absolute"
                    top="-8px"
                    right="-14px"
                    bg="var(--secondary)"
                    color="#0C1C2C"
                    fontSize="9px"
                    fontWeight="900"
                    px="6px"
                    py="1px"
                    borderRadius="full"
                    boxShadow="0 2px 6px rgba(0,0,0,0.3)"
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
                  color="var(--fg)"
                  transition="color 0.2s ease"
                  _hover={{ color: "var(--accent)" }}
                >
                  {rowData.githubid}
                </Text>

                {isYou && (
                  <Box
                    bg="var(--accent)"
                    color="var(--accent-ink)"
                    fontSize="10px"
                    fontWeight="900"
                    px="8px"
                    py="2px"
                    borderRadius="full"
                    boxShadow="0 2px 8px var(--accent-soft)"
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
        bg="var(--card-strong)"
        color="var(--fg)"
        border="1px solid var(--border-strong)"
        borderRadius="16px"
        w="auto"
        minW="220px"
        boxShadow="var(--shadow)"
        backdropFilter="blur(20px)"
        _focus={{ outline: "none" }}
        zIndex="popover"
      >
        <PopoverArrow bg="var(--card-strong)" />
        <PopoverBody p="16px">
          <Text
            fontWeight="800"
            fontSize="md"
            mb="3"
            color="var(--fg)"
            fontFamily="var(--f-sans)"
          >
            {rowData.name}
          </Text>

          <Flex justify="space-between" align="center" mb="2">
            <Text fontSize="sm" color="var(--muted)" fontWeight="500">
              {isOpencode ? "Points" : "Score"}
            </Text>
            <Text
              fontSize="sm"
              fontWeight="800"
              color="var(--accent)"
              fontFamily="var(--f-mono), monospace"
            >
              {rowData.points}
            </Text>
          </Flex>

          {isOpencode ? (
            <Flex justify="space-between" align="center" mb="4">
              <Text fontSize="sm" color="var(--muted)" fontWeight="500">
                PRs Merged
              </Text>
              <Text
                fontSize="sm"
                fontWeight="800"
                color="var(--fg)"
                fontFamily="var(--f-mono), monospace"
              >
                {rowData.prmerged}
              </Text>
            </Flex>
          ) : rowData.college ? (
            <Flex justify="space-between" align="center" mb="4">
              <Text fontSize="sm" color="var(--muted)" fontWeight="500">
                College
              </Text>
              <Text
                fontSize="sm"
                fontWeight="700"
                color="var(--fg)"
                noOfLines={1}
                maxW="140px"
              >
                {rowData.college}
              </Text>
            </Flex>
          ) : null}

          <Text
            fontSize="xs"
            color="var(--accent)"
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
}

/**
 * Reusable table pagination controls.
 */
function TablePagination({
  pageIndex,
  pageCount,
  onPrevious,
  onNext,
  canPrevious,
  canNext,
  isMobile = false,
}: {
  pageIndex: number;
  pageCount: number;
  onPrevious: () => void;
  onNext: () => void;
  canPrevious: boolean;
  canNext: boolean;
  isMobile?: boolean;
}) {
  const btnStyle = {
    size: "sm" as const,
    h: "34px",
    borderRadius: "full",
    fontSize: "13px",
    fontWeight: "700",
    bg: "var(--accent-soft)",
    border: "1px solid var(--border)",
    color: "var(--fg)",
    _hover: {
      bg: "var(--accent-soft)",
      borderColor: "var(--accent)",
      boxShadow: "0 0 12px var(--accent-soft)",
    },
    _disabled: {
      opacity: 0.35,
      cursor: "not-allowed",
      borderColor: "var(--border)",
      bg: "transparent",
    },
  };

  if (isMobile) {
    return (
      <Flex direction="column" gap="10px" mt="10px">
        <Text
          fontSize="12px"
          color="var(--muted)"
          textAlign="center"
          fontFamily="var(--f-mono), monospace"
        >
          Page {pageIndex + 1} of {Math.max(1, pageCount)}
        </Text>
        <Flex gap="10px">
          <Button flex="1" {...btnStyle} onClick={onPrevious} isDisabled={!canPrevious}>
            Prev
          </Button>
          <Button flex="1" {...btnStyle} onClick={onNext} isDisabled={!canNext}>
            Next
          </Button>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex
      px="18px"
      py="16px"
      justify="space-between"
      align="center"
      borderTop="1px solid var(--line)"
      bg="var(--card-soft)"
      flexWrap="wrap"
      gap="12px"
    >
      <Text
        fontSize="13px"
        color="var(--muted)"
        fontFamily="var(--f-mono), monospace"
        fontWeight="600"
      >
        Page {pageIndex + 1} of {Math.max(1, pageCount)}
      </Text>
      <Flex gap="10px">
        <Button px="18px" {...btnStyle} onClick={onPrevious} isDisabled={!canPrevious}>
          Prev
        </Button>
        <Button px="18px" {...btnStyle} onClick={onNext} isDisabled={!canNext}>
          Next
        </Button>
      </Flex>
    </Flex>
  );
}

/**
 * Mobile-optimized card layout for leaderboard standings.
 */
function MobileLeaderboard({
  table,
  isOpencode,
}: {
  table: ReturnType<typeof useReactTable<RowObj>>;
  isOpencode: boolean;
}) {
  if (!table) return null;
  const rows = table.getPaginationRowModel().rows;

  return (
    <Flex direction="column" gap="14px">
      {rows.map((row) => {
        const user = row.original;

        return (
          <Flex
            key={user.githubid}
            align="center"
            justify="space-between"
            p="14px"
            borderRadius="18px"
            bg="var(--surface)"
            border="1px solid var(--border)"
            backdropFilter="blur(16px)"
            boxShadow="var(--shadow)"
            transition="all 0.2s ease"
            _hover={{
              borderColor: "var(--border-strong)",
              transform: "translateY(-1px)",
            }}
          >
            <Link
              href={`/user/profile/${user.githubid}`}
              _hover={{ textDecoration: "none" }}
            >
              <Flex align="center" gap="12px">
                <Flex align="center" justify="center" minW="32px">
                  <RankBadge position={user.position} />
                </Flex>

                <Box
                  borderRadius="full"
                  p="2px"
                  bg="linear-gradient(135deg, rgba(88, 185, 154, 0.4), rgba(45, 139, 111, 0.2))"
                >
                  <NextAvatar src={user.avatarUrl} h="42px" w="42px" />
                </Box>

                <Box>
                  <Text fontWeight="700" fontSize="14px" color="var(--fg)">
                    {user.name}
                  </Text>
                  <Text fontSize="12px" color="var(--muted)">
                    @{user.githubid}
                  </Text>
                </Box>
              </Flex>
            </Link>

            <Flex align="center" gap="10px">
              {isOpencode ? (
                <Flex
                  align="center"
                  justify="center"
                  px="10px"
                  py="3px"
                  borderRadius="full"
                  bg="var(--accent-soft)"
                  border="1px solid var(--border)"
                  color="var(--fg)"
                  fontFamily="var(--f-mono), monospace"
                  fontWeight="700"
                  fontSize="12px"
                >
                  {user.prmerged} PRs
                </Flex>
              ) : user.college ? (
                <Flex
                  align="center"
                  justify="center"
                  px="10px"
                  py="3px"
                  borderRadius="full"
                  bg="var(--accent-soft)"
                  border="1px solid var(--border)"
                  color="var(--fg)"
                  fontSize="11px"
                  fontWeight="600"
                  maxW="130px"
                  noOfLines={1}
                >
                  {user.college}
                </Flex>
              ) : null}

              <Flex align="center" gap="6px">
                <Text
                  fontWeight="800"
                  fontFamily="var(--f-mono), monospace"
                  color="var(--accent)"
                  fontSize="15px"
                >
                  {user.points}
                </Text>
                <FaTrophy color="var(--secondary)" size={12} />
              </Flex>
            </Flex>
          </Flex>
        );
      })}

      <TablePagination
        pageIndex={table.getState().pagination.pageIndex}
        pageCount={table.getPageCount()}
        onPrevious={() => table.previousPage()}
        onNext={() => table.nextPage()}
        canPrevious={table.getCanPreviousPage()}
        canNext={table.getCanNextPage()}
        isMobile
      />
    </Flex>
  );
}

/**
 * Main Leaderboard table supporting dynamic event modes (OpenCode vs custom events),
 * row animation via GSAP Flip, and responsive pagination.
 */
function ColumnTable({
  tableData,
  eventName,
}: {
  tableData: RowObj[];
  eventName: string;
}) {
  const [currentGithubId, setCurrentGithubId] = useState<string | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showRankings, setShowRankings] = useState(true);

  useEffect(() => {
    setCurrentGithubId(getCurrentGithubId());
  }, []);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  });

  const isMobile = useBreakpointValue({ base: true, md: false });
  const isOpencode = (eventName || "").toLowerCase().includes("opencode");
  const cleanEventName = decodeURIComponent(eventName || "");

  const columns = useMemo(
    () => [
      columnHelper.accessor("position", {
        header: () => (
          <Flex justify="center">
            <Text letterSpacing="0.14em">RANK</Text>
          </Flex>
        ),
        cell: (info) => (
          <Flex justify="center" align="center">
            <RankBadge position={info.getValue()} />
          </Flex>
        ),
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
              <Text fontWeight="700" fontSize="15px" color="var(--fg)">
                {info.getValue()}
              </Text>
              {row.college && (
                <Text
                  fontSize="12px"
                  color="var(--muted)"
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
        cell: (info) => (
          <UserCell
            rowData={info.row.original}
            currentGithubId={currentGithubId}
            isOpencode={isOpencode}
          />
        ),
      }),

      ...(isOpencode
        ? [
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
                    bg="var(--accent-soft)"
                    border="1px solid var(--border)"
                    color="var(--fg)"
                    fontFamily="var(--f-mono), monospace"
                    fontWeight="800"
                    fontSize="13px"
                    boxShadow="inset 0 0 8px var(--accent-soft)"
                  >
                    {info.getValue()}
                  </Flex>
                </Flex>
              ),
            }),
          ]
        : []),

      columnHelper.accessor("points", {
        header: () => (
          <Flex justify="flex-end">
            <Text letterSpacing="0.14em">{isOpencode ? "POINTS" : "SCORE"}</Text>
          </Flex>
        ),
        cell: (info) => (
          <Flex justify="flex-end" align="center" gap="8px">
            <Text
              fontFamily="var(--f-mono), monospace"
              fontWeight="800"
              fontSize="15px"
              color="var(--accent)"
            >
              {info.getValue()}
            </Text>
            <FaTrophy color="var(--secondary)" size={14} />
          </Flex>
        ),
      }),
    ],
    [currentGithubId, isOpencode]
  );

  const tbodyRef = useRef<HTMLTableSectionElement | null>(null);
  const prevFlipStateRef = useRef<Flip.FlipState | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!tbodyRef.current || isMobile || !showRankings) return;

    const rows = Array.from(tbodyRef.current.querySelectorAll("tr[data-row-id]"));
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

  // Keep logged in user prominently at top if present
  const reorderedData = useMemo(() => {
    if (!currentGithubId) return tableData;
    const currentUser = tableData.find((u) => u.githubid === currentGithubId);
    if (!currentUser) return tableData;

    return [currentUser, ...tableData.filter((u) => u.githubid !== currentGithubId)];
  }, [tableData, currentGithubId]);

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

  const isCurrentUser = (row: any) =>
    Boolean(currentGithubId && row.original.githubid === currentGithubId);

  return (
    <Card
      flexDirection="column"
      w="100%"
      px={{ base: "14px", md: "24px" }}
      py={{ base: "18px", md: "24px" }}
      borderRadius="24px"
      bg="var(--surface)"
      border="1px solid var(--border)"
      backdropFilter="blur(24px)"
      boxShadow="var(--shadow)"
      zIndex={1}
    >
      {/* Header */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        gap="16px"
        mb="22px"
        pb="18px"
        borderBottom="1px solid var(--line)"
      >
        <Box>
          <Text
            fontFamily="var(--f-display), 'Cormorant Garamond', Georgia, serif"
            fontSize={{ base: "24px", md: "30px" }}
            fontWeight="700"
            color="var(--fg)"
            letterSpacing="0.02em"
            lineHeight="1.2"
          >
            {isOpencode ? "Contributor Rankings" : `${cleanEventName} Leaderboard`}
          </Text>
          <Text fontSize="13px" color="var(--muted)" mt="4px" fontWeight="500">
            {isOpencode
              ? "Every merged PR shapes the season. Find your standing among open source creators."
              : `Official participant standings and scores for ${cleanEventName}.`}
          </Text>
        </Box>

        {/* View Toggle: Rankings vs Points Graph (OpenCode only) */}
        {isOpencode && (
          <Flex
            align="center"
            p="3px"
            bg="var(--card-soft)"
            borderRadius="full"
            border="1px solid var(--border)"
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
              bg={showRankings ? "var(--accent)" : "transparent"}
              color={showRankings ? "var(--accent-ink)" : "var(--muted)"}
              boxShadow={
                showRankings ? "0 2px 8px var(--accent-soft)" : "none"
              }
              _hover={{
                color: showRankings ? "var(--accent-ink)" : "var(--fg)",
                bg: showRankings
                  ? "var(--accent-hover)"
                  : "var(--accent-soft)",
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
              leftIcon={<FaChartLine size={12} />}
              bg={!showRankings ? "var(--accent)" : "transparent"}
              color={!showRankings ? "var(--accent-ink)" : "var(--muted)"}
              boxShadow={
                !showRankings ? "0 2px 8px var(--accent-soft)" : "none"
              }
              _hover={{
                color: !showRankings ? "var(--accent-ink)" : "var(--fg)",
                bg: !showRankings
                  ? "var(--accent-hover)"
                  : "var(--accent-soft)",
              }}
              _active={{ transform: "scale(0.98)" }}
              transition="all 0.2s ease"
              onClick={() => setShowRankings(false)}
            >
              Points Graph
            </Button>
          </Flex>
        )}
      </Flex>

      {/* Main Table or Analytics View */}
      {showRankings || !isOpencode ? (
        isMobile ? (
          <MobileLeaderboard table={table} isOpencode={isOpencode} />
        ) : (
          <Box
            overflowX="auto"
            borderRadius="18px"
            border="1px solid var(--border)"
            bg="var(--card-soft)"
          >
            <Table variant="unstyled" minW="720px">
              <Thead
                bg="var(--card-soft)"
                borderBottom="1px solid var(--border)"
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
                        color="var(--muted)"
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
                        ? "linear-gradient(90deg, rgba(88, 185, 154, 0.18) 0%, rgba(45, 139, 111, 0.14) 100%)"
                        : "transparent"
                    }
                    color="var(--fg)"
                    boxShadow={
                      isCurrentUser(row)
                        ? "inset 3px 0 0 var(--accent), 0 0 20px var(--accent-soft)"
                        : "none"
                    }
                    _hover={{
                      bg: isCurrentUser(row)
                        ? "linear-gradient(90deg, rgba(88, 185, 154, 0.25) 0%, rgba(45, 139, 111, 0.20) 100%)"
                        : "var(--accent-soft)",
                    }}
                    borderBottom="1px solid"
                    borderColor="var(--line)"
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

            <TablePagination
              pageIndex={pagination.pageIndex}
              pageCount={table.getPageCount()}
              onPrevious={() => table.previousPage()}
              onNext={() => table.nextPage()}
              canPrevious={table.getCanPreviousPage()}
              canNext={table.getCanNextPage()}
            />
          </Box>
        )
      ) : (
        <Box p={{ base: "12px", md: "20px" }}>
          <LeaderboardGraph
            eventName={cleanEventName}
            topN={10}
            startDate={process.env.NEXT_PUBLIC_EVENT_START_DATE || "2025-12-14"}
          />
        </Box>
      )}
    </Card>
  );
}

export default React.memo(ColumnTable);