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
  useBreakpointValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
} from "@chakra-ui/react";
import { Trophy, List, LineChart, Building2, ExternalLink } from "lucide-react";
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

import LeaderboardGraph from "./LeadearboardGraph";
import ContributorAvatar from "components/common/ContributorAvatar";
import { isMaintainer } from "constants/Maintainers";

gsap.registerPlugin(Flip);

export type RowObj = {
  position: string | number;
  name: string;
  avatarUrl?: string;
  githubid?: string;
  prmerged?: number;
  points?: number;
  prDetailsURL?: string;
  college?: string;
  graduationYear?: string | number;
  isMentor?: boolean;
};

const columnHelper = createColumnHelper<RowObj>();

const TROPHY_COLORS: Record<number, string> = {
  1: "var(--secondary)", // Gold (Theme Adaptive)
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

  if (isTop3) {
    const trophyColor = TROPHY_COLORS[pos as 1 | 2 | 3];
    return (
      <Flex
        align="center"
        justify="center"
        gap="4px"
        px="8px"
        py="2px"
        borderRadius="full"
        bg={
          pos === 1
            ? "var(--secondary-soft)"
            : pos === 2
            ? "rgba(148, 163, 184, 0.12)"
            : "rgba(217, 119, 6, 0.12)"
        }
        border="1px solid"
        borderColor={
          pos === 1
            ? "var(--secondary-border)"
            : pos === 2
            ? "rgba(148, 163, 184, 0.3)"
            : "rgba(217, 119, 6, 0.3)"
        }
      >
        <Text
          fontFamily="var(--f-mono), monospace"
          fontWeight="800"
          fontSize="12.5px"
          color={trophyColor}
        >
          #{pos}
        </Text>
      </Flex>
    );
  }

  return (
    <Text
      fontFamily="var(--f-mono), monospace"
      fontWeight="600"
      fontSize="13px"
      color="var(--muted)"
      textAlign="center"
    >
      #{position}
    </Text>
  );
}

/**
 * Rich, interactive Contributor Hover Card displaying quick dossier and stats.
 */
function ContributorHoverCard({
  row,
  currentGithubId,
  isOpencode,
  children,
}: {
  row: RowObj;
  currentGithubId?: string;
  isOpencode: boolean;
  children: React.ReactNode;
}) {
  const isYou = Boolean(row.githubid && row.githubid === currentGithubId);
  const maintainer = Boolean(row.githubid && (isMaintainer(row.githubid) || row.isMentor));

  if (!row.githubid) {
    return <>{children}</>;
  }

  return (
    <Popover trigger="hover" placement="right-start" openDelay={120} closeDelay={150} isLazy>
      <PopoverTrigger>
        <Box display="inline-flex" alignItems="center" cursor="pointer">
          {children}
        </Box>
      </PopoverTrigger>

      <PopoverContent
        bg="var(--card-strong)"
        color="var(--fg)"
        border="1px solid var(--border-strong)"
        borderRadius="18px"
        w="280px"
        p="0"
        boxShadow="0 16px 40px -10px rgba(0,0,0,0.8), 0 0 24px -4px rgba(88,185,154,0.18)"
        backdropFilter="blur(24px)"
        _focus={{ outline: "none" }}
        zIndex={1400}
      >
        <PopoverArrow bg="var(--card-strong)" />
        <PopoverBody p="16px">
          {/* Header: Avatar, Name, Handle, Badges */}
          <Flex align="center" gap="12px" mb="12px">
            <ContributorAvatar
              name={row.name}
              githubid={row.githubid}
              avatarUrl={row.avatarUrl}
              size="46px"
              fontSize="16px"
            />
            <Box minW={0} flex={1}>
              <Flex align="center" gap="6px" flexWrap="wrap">
                <Text
                  fontWeight="700"
                  fontSize="15px"
                  color="var(--fg)"
                  fontFamily="var(--f-display), 'Cormorant Garamond', Georgia, serif"
                  lineHeight="1.2"
                  noOfLines={1}
                >
                  {row.name}
                </Text>
                {maintainer && (
                  <Box
                    bg="var(--secondary)"
                    color="#0C1C2C"
                    fontSize="9px"
                    fontWeight="900"
                    px="6px"
                    py="1px"
                    borderRadius="full"
                    letterSpacing="0.05em"
                  >
                    MENTOR
                  </Box>
                )}
                {isYou && (
                  <Box
                    bg="var(--accent)"
                    color="var(--accent-ink)"
                    fontSize="9.5px"
                    fontWeight="900"
                    px="6px"
                    py="1px"
                    borderRadius="full"
                    letterSpacing="0.06em"
                  >
                    YOU
                  </Box>
                )}
              </Flex>
              <Text fontSize="12.5px" color="var(--accent)" fontWeight="600" mt="2px">
                @{row.githubid}
              </Text>
            </Box>
          </Flex>

          {/* College badge if available */}
          {row.college && (
            <Flex align="center" gap="6px" mb="12px" px="10px" py="6px" borderRadius="10px" bg="var(--surface-2)">
              <Building2 size={13} color="var(--muted)" />
              <Text fontSize="11.5px" color="var(--muted)" noOfLines={1}>
                {row.college}
              </Text>
            </Flex>
          )}

          {/* Quick Stats Grid */}
          <Flex
            justify="space-between"
            p="10px 14px"
            borderRadius="12px"
            bg="var(--surface-2)"
            border="1px solid var(--border)"
            mb="12px"
          >
            <Box textAlign="center">
              <Text fontSize="10px" color="var(--muted)" fontWeight="600" textTransform="uppercase" letterSpacing="0.08em">
                Rank
              </Text>
              <Text fontSize="14px" fontWeight="800" color="var(--fg)" fontFamily="var(--f-mono)">
                #{row.position}
              </Text>
            </Box>

            <Box textAlign="center">
              <Text fontSize="10px" color="var(--muted)" fontWeight="600" textTransform="uppercase" letterSpacing="0.08em">
                {isOpencode ? "PRs Merged" : "PRs"}
              </Text>
              <Text fontSize="14px" fontWeight="800" color="var(--fg)" fontFamily="var(--f-mono)">
                {row.prmerged ?? 0}
              </Text>
            </Box>

            <Box textAlign="center">
              <Text fontSize="10px" color="var(--muted)" fontWeight="600" textTransform="uppercase" letterSpacing="0.08em">
                Points
              </Text>
              <Text fontSize="14px" fontWeight="800" color="var(--secondary)" fontFamily="var(--f-display)">
                {Number(row.points || 0).toLocaleString()}
              </Text>
            </Box>
          </Flex>

          {/* Footer action link */}
          <Link
            href={`/user/profile/${row.githubid}`}
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap="5px"
            fontSize="12px"
            fontWeight="600"
            color="var(--accent)"
            pt="2px"
            transition="all 0.15s ease"
            _hover={{ textDecoration: "none", color: "var(--fg)", transform: "translateX(2px)" }}
          >
            <span>View Full Profile</span>
            <ExternalLink size={12} />
          </Link>
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
  totalLabel,
  isMobile = false,
}: {
  pageIndex: number;
  pageCount: number;
  onPrevious: () => void;
  onNext: () => void;
  canPrevious: boolean;
  canNext: boolean;
  totalLabel?: string;
  isMobile?: boolean;
}) {
  return (
    <Flex
      px={{ base: "14px", md: "18px" }}
      py="16px"
      justify="space-between"
      align="center"
      borderTop="1px solid var(--line)"
      flexWrap="wrap"
      gap="12px"
      mt="10px"
    >
      <Text
        fontSize="12.5px"
        color="var(--muted)"
        fontFamily="var(--f-mono), monospace"
      >
        {totalLabel || `Page ${pageIndex + 1} of ${Math.max(1, pageCount)}`}
      </Text>
      <Flex gap="8px">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canPrevious}
          style={{
            padding: "6px 16px",
            fontSize: "12px",
            fontFamily: "var(--f-body)",
            fontWeight: "600",
            borderRadius: "8px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
            cursor: canPrevious ? "pointer" : "not-allowed",
            opacity: canPrevious ? 1 : 0.35,
            transition: "all 0.2s ease",
          }}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          style={{
            padding: "6px 16px",
            fontSize: "12px",
            fontFamily: "var(--f-body)",
            fontWeight: "600",
            borderRadius: "8px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
            cursor: canNext ? "pointer" : "not-allowed",
            opacity: canNext ? 1 : 0.35,
            transition: "all 0.2s ease",
          }}
        >
          Next
        </button>
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
  hasPoints,
  currentGithubId,
}: {
  table: ReturnType<typeof useReactTable<RowObj>>;
  isOpencode: boolean;
  hasPoints: boolean;
  currentGithubId?: string;
}) {
  if (!table) return null;
  const rows = table.getPaginationRowModel().rows;
  const totalCount = table.getPrePaginationRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const startCount = rows.length > 0 ? pageIndex * pageSize + 1 : 0;
  const endCount = rows.length > 0 ? Math.min(startCount + rows.length - 1, totalCount) : 0;
  const totalLabel = totalCount > 0
    ? `Showing ${startCount}-${endCount} of ${totalCount.toLocaleString()} contributors`
    : `Showing 0 contributors`;

  return (
    <Flex direction="column" gap="10px">
      {rows.map((row, index) => {
        const user = row.original;
        const rowKey = user.githubid || `${user.name}-${user.position}-${index}`;
        const content = (
          <Flex align="center" gap="10px">
            <Flex align="center" justify="center" minW="26px">
              <RankBadge position={user.position} />
            </Flex>

            <ContributorAvatar
              name={user.name}
              githubid={user.githubid}
              avatarUrl={user.avatarUrl}
              size="36px"
              fontSize="12.5px"
            />

            <Box minW={0}>
              <Text fontWeight="600" fontSize="13.5px" color="var(--fg)" noOfLines={1}>
                {user.name}
              </Text>
              {isOpencode && user.githubid ? (
                <Text fontSize="11.5px" color="var(--muted)">
                  @{user.githubid}
                </Text>
              ) : user.college ? (
                <Text fontSize="11.5px" color="var(--muted)" noOfLines={1} maxW="150px">
                  {user.college}
                </Text>
              ) : null}
            </Box>
          </Flex>
        );

        return (
          <Flex
            key={rowKey}
            align="center"
            justify="space-between"
            p="12px 14px"
            borderRadius="14px"
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
            {isOpencode && user.githubid ? (
              <ContributorHoverCard
                row={user}
                currentGithubId={currentGithubId}
                isOpencode={isOpencode}
              >
                <Link
                  href={`/user/profile/${user.githubid}`}
                  _hover={{ textDecoration: "none" }}
                >
                  {content}
                </Link>
              </ContributorHoverCard>
            ) : (
              content
            )}

            <Flex align="center" gap="10px">
              {isOpencode && user.prmerged !== undefined ? (
                <Text
                  fontSize="12px"
                  color="var(--muted)"
                  fontFamily="var(--f-mono), monospace"
                >
                  {user.prmerged} PRs
                </Text>
              ) : null}

              {(isOpencode || hasPoints) && user.points !== undefined && user.points !== null ? (
                <Flex align="baseline" gap="3px">
                  <Text
                    fontWeight="700"
                    fontFamily="var(--f-display), 'Cormorant Garamond', Georgia, serif"
                    color="var(--secondary)"
                    fontSize="16px"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {Number(user.points).toLocaleString()}
                  </Text>
                  <Text fontSize="11px" color="var(--muted)">
                    pts
                  </Text>
                </Flex>
              ) : null}
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
        totalLabel={totalLabel}
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

  const hasPoints = useMemo(() => {
    if (isOpencode) return true;
    return tableData.some(
      (r) => r.points !== undefined && r.points !== null && !isNaN(Number(r.points))
    );
  }, [isOpencode, tableData]);

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
            CONTRIBUTOR
          </Text>
        ),
        cell: (info) => {
          const row = info.row.original;

          const cellContent = (
            <Flex align="center" gap="12px" textAlign="left">
              <ContributorAvatar
                name={info.getValue()}
                githubid={row.githubid}
                avatarUrl={row.avatarUrl}
                size="38px"
                fontSize="13px"
              />
              <Box minW={0}>
                <Text
                  fontWeight="600"
                  fontSize="14.5px"
                  color="var(--fg)"
                  noOfLines={1}
                >
                  {info.getValue()}
                </Text>
                {row.college && (
                  <Text
                    fontSize="12px"
                    color="var(--muted)"
                    noOfLines={1}
                    maxW={{ base: "180px", lg: "300px" }}
                  >
                    {row.college}
                  </Text>
                )}
              </Box>
            </Flex>
          );

          if (row.githubid) {
            return (
              <ContributorHoverCard
                row={row}
                currentGithubId={currentGithubId}
                isOpencode={isOpencode}
              >
                <Link
                  href={`/user/profile/${row.githubid}`}
                  _hover={{ textDecoration: "none" }}
                >
                  {cellContent}
                </Link>
              </ContributorHoverCard>
            );
          }

          return cellContent;
        },
      }),

      ...(isOpencode
        ? [
            columnHelper.accessor("githubid", {
              header: () => (
                <Text textAlign="left" letterSpacing="0.14em">
                  GITHUB
                </Text>
              ),
              cell: (info) => {
                const row = info.row.original;
                if (!row.githubid) return <Text color="var(--muted)">—</Text>;
                const isYou = Boolean(currentGithubId && row.githubid === currentGithubId);
                const maintainer = Boolean(isMaintainer(row.githubid) || row.isMentor);

                return (
                  <ContributorHoverCard
                    row={row}
                    currentGithubId={currentGithubId}
                    isOpencode={isOpencode}
                  >
                    <Flex align="center" gap="8px">
                      <Link
                        href={`/user/profile/${row.githubid}`}
                        fontSize="13.5px"
                        fontWeight="500"
                        color="var(--muted)"
                        _hover={{ color: "var(--accent)", textDecoration: "none" }}
                        transition="color 0.2s ease"
                      >
                        {row.githubid}
                      </Link>
                      {maintainer && (
                        <Box
                          bg="var(--secondary)"
                          color="#0C1C2C"
                          fontSize="9px"
                          fontWeight="900"
                          px="6px"
                          py="1px"
                          borderRadius="full"
                          letterSpacing="0.05em"
                        >
                          MENTOR
                        </Box>
                      )}
                      {isYou && (
                        <Box
                          bg="var(--accent)"
                          color="var(--accent-ink)"
                          fontSize="9.5px"
                          fontWeight="900"
                          px="6px"
                          py="1px"
                          borderRadius="full"
                          letterSpacing="0.06em"
                        >
                          YOU
                        </Box>
                      )}
                    </Flex>
                  </ContributorHoverCard>
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
                  <Text
                    fontFamily="var(--f-mono), monospace"
                    fontWeight="600"
                    fontSize="13.5px"
                    color="var(--fg)"
                  >
                    {info.getValue() ?? 0}
                  </Text>
                </Flex>
              ),
            }),
          ]
        : []),

      ...(isOpencode || hasPoints
        ? [
            columnHelper.accessor("points", {
              header: () => (
                <Flex justify="flex-end">
                  <Text letterSpacing="0.14em">POINTS</Text>
                </Flex>
              ),
              cell: (info) => {
                const val = Number(info.getValue() || 0);
                return (
                  <Flex justify="flex-end" align="baseline" gap="4px">
                    <Text
                      fontFamily="var(--f-display), 'Cormorant Garamond', Georgia, serif"
                      fontWeight="700"
                      fontSize="18px"
                      color="var(--secondary)"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {val.toLocaleString()}
                    </Text>
                    <Text
                      fontSize="11.5px"
                      color="var(--muted)"
                      fontFamily="var(--f-body)"
                    >
                      pts
                    </Text>
                  </Flex>
                );
              },
            }),
          ]
        : []),
    ],
    [currentGithubId, isOpencode, hasPoints]
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

  // Keep logged in user prominently at top if present (applicable for OpenCode)
  const reorderedData = useMemo(() => {
    const baseData = isOpencode
      ? tableData.filter((u) => !u.githubid || (!isMaintainer(u.githubid) && !u.isMentor))
      : tableData;

    if (!currentGithubId || !isOpencode) return baseData;
    // Mentors themselves are not competitors and should not be pinned to the leaderboard
    if (isMaintainer(currentGithubId)) return baseData;

    const currentUser = baseData.find((u) => u.githubid === currentGithubId);
    if (!currentUser) return baseData;

    return [currentUser, ...baseData.filter((u) => u.githubid !== currentGithubId)];
  }, [tableData, currentGithubId, isOpencode]);

  const table = useReactTable({
    data: reorderedData,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row, index) => row.githubid || `${row.name}-${row.position}-${index}`,
  });

  const isCurrentUser = (row: any) =>
    Boolean(isOpencode && currentGithubId && row.original.githubid === currentGithubId);

  const currentRows = table.getPaginationRowModel().rows;
  const totalCount = reorderedData.length;
  const startCount = currentRows.length > 0 ? pagination.pageIndex * pagination.pageSize + 1 : 0;
  const endCount = currentRows.length > 0 ? Math.min(startCount + currentRows.length - 1, totalCount) : 0;
  const totalLabel = totalCount > 0
    ? `Showing ${startCount}-${endCount} of ${totalCount.toLocaleString()} contributors`
    : `Showing 0 contributors`;

  return (
    <Box
      w="100%"
      px={{ base: "16px", md: "24px" }}
      py={{ base: "20px", md: "26px" }}
      borderRadius="20px"
      bg="var(--surface)"
      border="1px solid var(--border)"
      backdropFilter="blur(20px)"
      boxShadow="var(--shadow)"
      zIndex={1}
    >
      {/* Header */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        gap="16px"
        mb="20px"
        pb="16px"
        borderBottom="1px solid var(--line)"
      >
        <Box>
          <Text
            fontFamily="var(--f-display), 'Cormorant Garamond', Georgia, serif"
            fontSize={{ base: "22px", md: "26px" }}
            fontWeight="600"
            color="var(--fg)"
            letterSpacing="0.02em"
            lineHeight="1.2"
          >
            {isOpencode ? "Contributor Rankings" : `${cleanEventName} Leaderboard`}
          </Text>
          <Text fontSize="13px" color="var(--muted)" mt="4px" fontWeight="400">
            {isOpencode
              ? "Every merged PR shapes the season. Find your standing among open source creators."
              : `Official participant standings and scores for ${cleanEventName}.`}
          </Text>
        </Box>

        {/* View Toggle: Rankings vs Points Graph (OpenCode only) */}
        {isOpencode && (
          <Flex align="center" gap="6px" alignSelf={{ base: "flex-start", sm: "center" }}>
            <button
              type="button"
              onClick={() => setShowRankings(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "7px 14px",
                fontSize: "13px",
                fontWeight: showRankings ? "600" : "500",
                fontFamily: "var(--f-body)",
                borderRadius: "8px",
                background: showRankings ? "var(--surface-2)" : "transparent",
                border: showRankings ? "1px solid var(--border)" : "1px solid transparent",
                color: showRankings ? "var(--fg)" : "var(--muted)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <List size={14} color={showRankings ? "var(--accent)" : "currentColor"} />
              Rankings
            </button>
            <button
              type="button"
              onClick={() => setShowRankings(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "7px 14px",
                fontSize: "13px",
                fontWeight: !showRankings ? "600" : "500",
                fontFamily: "var(--f-body)",
                borderRadius: "8px",
                background: !showRankings ? "var(--surface-2)" : "transparent",
                border: !showRankings ? "1px solid var(--border)" : "1px solid transparent",
                color: !showRankings ? "var(--fg)" : "var(--muted)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <LineChart size={14} color={!showRankings ? "var(--accent)" : "currentColor"} />
              Points Graph
            </button>
          </Flex>
        )}
      </Flex>

      {/* Main Table or Analytics View */}
      {showRankings || !isOpencode ? (
        isMobile ? (
          <MobileLeaderboard
            table={table}
            isOpencode={isOpencode}
            hasPoints={hasPoints}
            currentGithubId={currentGithubId}
          />
        ) : (
          <Box overflowX="auto">
            <Table variant="unstyled" minW="720px">
              <Thead borderBottom="1px solid var(--border)">
                {table.getHeaderGroups().map((hg) => (
                  <Tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <Th
                        key={header.id}
                        py="12px"
                        px="16px"
                        fontFamily="var(--f-mono), monospace"
                        fontSize="11.5px"
                        letterSpacing="0.14em"
                        fontWeight="600"
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
                    className="group"
                    bg={
                      isCurrentUser(row)
                        ? "rgba(88, 185, 154, 0.08)"
                        : "transparent"
                    }
                    color="var(--fg)"
                    _hover={{
                      bg: isCurrentUser(row)
                        ? "rgba(88, 185, 154, 0.14)"
                        : "rgba(255, 255, 255, 0.02)",
                    }}
                    borderBottom="1px solid"
                    borderColor="var(--line)"
                    transition="background 0.15s ease"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Td key={cell.id} py="14px" px="16px">
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
              totalLabel={totalLabel}
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
    </Box>
  );
}

export default React.memo(ColumnTable);