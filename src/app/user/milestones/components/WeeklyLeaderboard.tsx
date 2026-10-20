'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
} from '@chakra-ui/react';
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaCrown, FaTrophy, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MdLeaderboard, MdPlayArrow, MdPause } from 'react-icons/md';
import {
  coverflowSpring,
  getCoverflowCardStyle,
  podiumContentContainerVariants,
  podiumBlock1ItemVariants,
  podiumBlock2ItemVariants,
  podiumBlock3ItemVariants,
  avatar1ItemVariants,
  avatar2ItemVariants,
  avatar3ItemVariants,
  crownItemVariants,
  crownFloatVariants,
  rankRowsListVariants,
  rankRowSingleItemVariants,
  petalVariants,
  SAKURA_PETALS,
} from './leaderboardMotion';

export interface LeaderboardUser {
  rank: number;
  name: string;
  score: number;
  avatar: string;
  username: string;
  userId: string;
}

export interface WeeklyLeaderboardCardProps {
  weeks: {
    week: number;
    data: LeaderboardUser[];
  }[];
}

/**
 * Format names to consistent Title Case
 */
function formatName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Retrieve current logged-in user handle to highlight "You"
 */
function getCurrentGithubUser(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return (user.githubId || user.username || user.userId || user.name || '').toLowerCase() || null;
  } catch {
    return null;
  }
}

/**
 * Numbers count up from 0 over ~0.8s (800ms) with tabular numbers
 */
function AnimatedScore({
  value,
  duration = 800,
  disabled = false,
}: {
  value: number;
  duration?: number;
  disabled?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(disabled ? value : 0);

  useEffect(() => {
    if (disabled) {
      setDisplayValue(value);
      return;
    }
    let startTime: number | null = null;
    let animId: number;
    const startVal = 0;
    const endVal = value;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * easeOut);
      setDisplayValue(current);
      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [value, duration, disabled]);

  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{displayValue.toLocaleString()}</span>;
}

/**
 * Weekly Leaderboard Carousel Component
 */
export function WeeklyLeaderboardCard({ weeks }: WeeklyLeaderboardCardProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  // Sort weeks chronologically ascending: Week 1, Week 2, ... Week N
  const sortedWeeks = React.useMemo(() => {
    return [...weeks].sort((a, b) => a.week - b.week);
  }, [weeks]);

  // Default to the latest week, safe on first render
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  // Responsive peek detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync activeIndex if weeks change and ensure it's in bounds
  useEffect(() => {
    if (sortedWeeks.length > 0) {
      setActiveIndex((prev) => Math.min(Math.max(0, prev), sortedWeeks.length - 1));
    }
  }, [sortedWeeks.length]);

  // Fetch current user handle on mount
  useEffect(() => {
    setCurrentUsername(getCurrentGithubUser());
  }, []);

  // Safe active index never undefined or -1
  const safeActiveIndex = sortedWeeks.length > 0
    ? Math.min(Math.max(0, activeIndex), sortedWeeks.length - 1)
    : 0;

  // Autoplay handler (pauses on hover and focus)
  useEffect(() => {
    if (!isAutoplay || isPaused || prefersReducedMotion || sortedWeeks.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sortedWeeks.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isAutoplay, isPaused, prefersReducedMotion, sortedWeeks.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => Math.min(sortedWeeks.length - 1, prev + 1));
  }, [sortedWeeks.length]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  if (!sortedWeeks.length) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        h="320px"
        className="glass-panel"
        p="24px"
        textAlign="center"
      >
        <Box
          w="52px"
          h="52px"
          borderRadius="16px"
          bg="var(--accent-soft)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="var(--accent)"
          mb="16px"
        >
          <Icon as={MdLeaderboard} boxSize="28px" />
        </Box>
        <Text fontFamily="Georgia, serif" fontSize="22px" color="var(--text)" mb="6px">
          No Weekly Champions Yet
        </Text>
        <Text fontSize="14px" color="var(--muted)">
          The weekly competition will begin soon.
        </Text>
      </Flex>
    );
  }

  return (
    <Box
      w="full"
      position="relative"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      tabIndex={0}
      aria-label="Weekly Leaderboard coverflow carousel"
      _focus={{ outline: 'none' }}
      _focusVisible={{ outline: '2px solid var(--accent)', outlineOffset: '4px', borderRadius: '16px' }}
    >
      {/* Carousel Area: Viewport + Prev/Next buttons placed just outside the active card */}
      <Flex
        align="center"
        justify="center"
        position="relative"
        w="full"
        minH={{ base: '560px', md: '580px' }}
      >
        {/* Prev Button: sits just outside the active card (active card width is 420px, so half is 210px) */}
        <IconButton
          aria-label="Previous week"
          icon={<FaChevronLeft />}
          onClick={handlePrev}
          isDisabled={safeActiveIndex === 0}
          display={{ base: 'none', md: 'inline-flex' }}
          position="absolute"
          left={{
            md: 'calc(50% - 210px - 54px)',
            lg: 'calc(50% - 210px - 58px)',
          }}
          top="50%"
          transform="translateY(-50%)"
          zIndex={25}
          size="md"
          isRound
          className="oc-button-secondary"
          _hover={{
            borderColor: 'var(--accent)',
            color: 'var(--accent)',
            bg: 'var(--accent-soft)',
          }}
          _focusVisible={{
            outline: '2px solid var(--accent)',
            outlineOffset: '2px',
          }}
        />

        {/* Coverflow Viewport */}
        <Box
          w="full"
          maxW="1100px"
          h={{ base: '560px', md: '580px' }}
          position="relative"
          overflow="hidden"
          style={{ perspective: 1200 }}
        >
          {sortedWeeks.map((weekData, index) => {
            const offset = index - safeActiveIndex;
            const style = getCoverflowCardStyle(offset, isMobile);
            const isActive = offset === 0;

            const podium1 = weekData.data.filter((u) => u.rank === 1);
            const podium2 = weekData.data.filter((u) => u.rank === 2);
            const podium3 = weekData.data.filter((u) => u.rank === 3);
            const rest = weekData.data.filter((u) => u.rank > 3);
            const hasData = weekData.data.length > 0;

            return (
              <motion.div
                key={`week-card-${weekData.week}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  margin: '0 auto',
                  width: isMobile ? 'calc(100% - 44px)' : '420px',
                  maxWidth: '430px',
                  height: 'auto',
                  maxHeight: '580px',
                  transformStyle: 'preserve-3d',
                  cursor: offset !== 0 ? 'pointer' : 'default',
                  zIndex: style.zIndex,
                }}
                animate={{
                  x: style.x,
                  scale: style.scale,
                  rotateY: style.rotateY,
                  opacity: style.opacity,
                  visibility: style.visibility,
                }}
                transition={prefersReducedMotion ? { duration: 0.01 } : coverflowSpring}
                onClick={() => {
                  if (offset !== 0) {
                    setActiveIndex(index);
                  }
                }}
              >
                {/* Active Card interactive drag layer */}
                <motion.div
                  drag={isActive ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -45 || info.velocity.x < -220) {
                      handleNext();
                    } else if (info.offset.x > 45 || info.velocity.x > 220) {
                      handlePrev();
                    }
                  }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <Box
                    className="glass-panel"
                    h="auto"
                    maxH="580px"
                    borderRadius="24px"
                    overflow="hidden"
                    display="flex"
                    flexDirection="column"
                    position="relative"
                    boxShadow="var(--shadow)"
                  >
                    {/* Drifting Sakura Petals (inside active card only) */}
                    {isActive && !prefersReducedMotion && (
                      <Box
                        position="absolute"
                        inset={0}
                        pointerEvents="none"
                        overflow="hidden"
                        zIndex={1}
                        aria-hidden="true"
                      >
                        {SAKURA_PETALS.map((petal, i) => (
                          <motion.div
                            key={`petal-${weekData.week}-${i}`}
                            custom={petal}
                            variants={petalVariants}
                            initial="initial"
                            animate="animate"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: `${petal.x}%`,
                              width: `${petal.size}px`,
                              height: `${petal.size}px`,
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="var(--accent)" width="100%" height="100%">
                              <path d="M12 2C8 6 4 10 4 14a8 8 0 0 0 16 0c0-4-4-8-8-12z" />
                            </svg>
                          </motion.div>
                        ))}
                      </Box>
                    )}

                    {/* Card Header: accent-soft with thin accent top border, Georgia title */}
                    <Flex
                      bg="var(--accent-soft)"
                      borderTop="2px solid var(--accent)"
                      borderBottom="1px solid var(--border)"
                      px="20px"
                      py="14px"
                      align="center"
                      justify="space-between"
                      position="relative"
                      zIndex={2}
                      flexShrink={0}
                    >
                      <Box>
                        <Text
                          fontSize="10.5px"
                          letterSpacing="0.16em"
                          color="var(--accent)"
                          fontWeight="700"
                          fontFamily="var(--f-body)"
                          textTransform="uppercase"
                        >
                          Weekly Leaderboard
                        </Text>
                        <Text
                          as="h3"
                          aria-live="polite"
                          fontFamily="Georgia, serif"
                          fontSize="21px"
                          fontWeight="400"
                          color="var(--text)"
                          lineHeight="1.2"
                          mt="2px"
                        >
                          Week {weekData.week}
                        </Text>
                      </Box>
                      <Flex
                        w="36px"
                        h="36px"
                        borderRadius="12px"
                        bg="var(--card-soft)"
                        border="1px solid var(--border)"
                        align="center"
                        justify="center"
                        color="var(--accent)"
                      >
                        <Icon as={FaTrophy} boxSize="17px" />
                      </Flex>
                    </Flex>

                    {/* Card Body */}
                    {!hasData ? (
                      /* Empty State inside card */
                      <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        flex="1"
                        p="28px"
                        textAlign="center"
                        position="relative"
                        zIndex={2}
                      >
                        <Box
                          w="46px"
                          h="46px"
                          borderRadius="14px"
                          bg="var(--accent-soft)"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="var(--accent)"
                          mb="14px"
                        >
                          <Icon as={MdLeaderboard} boxSize="24px" />
                        </Box>
                        <Text fontFamily="Georgia, serif" fontSize="20px" color="var(--text)" mb="6px">
                          No Standings Yet
                        </Text>
                        <Text fontSize="13px" color="var(--muted)" maxW="240px" lineHeight="1.6">
                          Contributions for Week {weekData.week} are being compiled.
                        </Text>
                      </Flex>
                    ) : (
                      /* Animated Container gets variants={podiumContentContainerVariants} initial="hidden" animate="show" and key equal to week id */
                      <motion.div
                        key={`week-content-${weekData.week}`}
                        variants={podiumContentContainerVariants}
                        initial="hidden"
                        animate="show"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          width: '100%',
                        }}
                      >
                        {/* Podium Section */}
                        <Box
                          px="14px"
                          pt="20px"
                          pb="14px"
                          borderBottom="1px solid var(--border)"
                          position="relative"
                          zIndex={2}
                          flexShrink={0}
                        >
                          <Flex justify="center" align="flex-end" gap={{ base: '8px', sm: '10px' }}>
                            {/* 2nd Place */}
                            {podium2.length > 0 && (
                              <VStack spacing={1} w="31%" zIndex={1}>
                                {/* Avatar: only variants={avatar2ItemVariants}, NO own initial/animate */}
                                <motion.div
                                  variants={avatar2ItemVariants}
                                  style={{ position: 'relative', marginBottom: '-8px', zIndex: 1 }}
                                >
                                  <Flex justify="center" align="center">
                                    {podium2.slice(0, 2).map((user, i) => (
                                      <Avatar
                                        key={user.username || i}
                                        src={user.avatar}
                                        name={user.name}
                                        size="md"
                                        ml={i === 0 ? 0 : -3}
                                        border="2px solid rgba(160, 174, 192, 0.6)"
                                        cursor="pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          router.push(`/user/profile/${user.username || user.userId}`);
                                        }}
                                      />
                                    ))}
                                  </Flex>
                                  <Badge
                                    position="absolute"
                                    bottom="-4px"
                                    left="50%"
                                    transform="translateX(-50%)"
                                    borderRadius="full"
                                    fontSize="10px"
                                    fontWeight="700"
                                    bg="#e8ecf1"
                                    color="#0C1C2C"
                                    px="6px"
                                    boxShadow="sm"
                                  >
                                    #2
                                  </Badge>
                                </motion.div>

                                {/* Podium Block: only variants={podiumBlock2ItemVariants} */}
                                <motion.div
                                  variants={podiumBlock2ItemVariants}
                                  style={{ width: '100%' }}
                                >
                                  <Flex
                                    w="100%"
                                    h="88px"
                                    bg="linear-gradient(180deg, #e8ecf1 0%, #d5dbe3 100%)"
                                    border="1px solid rgba(160, 174, 192, 0.45)"
                                    boxShadow="0 6px 18px -6px rgba(160, 174, 192, 0.25)"
                                    borderRadius="14px"
                                    direction="column"
                                    align="center"
                                    justify="center"
                                    p="6px"
                                  >
                                    <Text
                                      color="#0C1C2C"
                                      fontWeight="700"
                                      fontSize="13px"
                                      noOfLines={1}
                                      textAlign="center"
                                    >
                                      {formatName(podium2[0].name.split(' ')[0])}
                                    </Text>
                                    <Text color="#0C1C2C" fontSize="12px" fontWeight="600" opacity={0.85}>
                                      <AnimatedScore
                                        value={podium2[0].score}
                                        disabled={Boolean(prefersReducedMotion)}
                                      />{' '}
                                      pts
                                    </Text>
                                  </Flex>
                                </motion.div>
                              </VStack>
                            )}

                            {/* 1st Place */}
                            {podium1.length > 0 && (
                              <VStack spacing={1} w="34%" zIndex={3}>
                                {/* Avatar: only variants={avatar1ItemVariants} */}
                                <motion.div
                                  variants={avatar1ItemVariants}
                                  style={{ position: 'relative', marginBottom: '-8px', zIndex: 3 }}
                                >
                                  {/* Soft Pink Glow behind #1 avatar */}
                                  <Box
                                    position="absolute"
                                    inset="-10px"
                                    borderRadius="full"
                                    bg="radial-gradient(circle, var(--accent-soft) 30%, transparent 75%)"
                                    filter="blur(8px)"
                                    pointerEvents="none"
                                    zIndex={0}
                                    opacity={0.9}
                                  />

                                  {/* Crown: only variants={crownItemVariants} */}
                                  <motion.div
                                    variants={crownItemVariants}
                                    style={{
                                      position: 'absolute',
                                      top: '-20px',
                                      left: '50%',
                                      transform: 'translateX(-50%)',
                                      zIndex: 4,
                                    }}
                                  >
                                    <motion.div
                                      variants={crownFloatVariants}
                                      animate={prefersReducedMotion ? undefined : 'animate'}
                                    >
                                      <Icon
                                        as={FaCrown}
                                        color="#f6c445"
                                        w="18px"
                                        h="18px"
                                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"
                                      />
                                    </motion.div>
                                  </motion.div>

                                  <Flex justify="center" align="center" position="relative" zIndex={2}>
                                    {podium1.slice(0, 2).map((user, i) => (
                                      <Avatar
                                        key={user.username || i}
                                        src={user.avatar}
                                        name={user.name}
                                        size="lg"
                                        ml={i === 0 ? 0 : -3}
                                        border="3px solid #f7e7b4"
                                        cursor="pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          router.push(`/user/profile/${user.username || user.userId}`);
                                        }}
                                      />
                                    ))}
                                  </Flex>
                                  <Badge
                                    position="absolute"
                                    bottom="-4px"
                                    left="50%"
                                    transform="translateX(-50%)"
                                    borderRadius="full"
                                    fontSize="10.5px"
                                    fontWeight="800"
                                    bg="#f7e7b4"
                                    color="#0C1C2C"
                                    px="8px"
                                    boxShadow="md"
                                    zIndex={3}
                                  >
                                    #1
                                  </Badge>
                                </motion.div>

                                {/* 1st Place Podium Block: only variants={podiumBlock1ItemVariants} */}
                                <motion.div
                                  variants={podiumBlock1ItemVariants}
                                  style={{ width: '100%' }}
                                >
                                  <Flex
                                    w="100%"
                                    h="116px"
                                    bg="linear-gradient(180deg, #f7e7b4 0%, #ecd599 100%)"
                                    border="1px solid rgba(212, 175, 55, 0.45)"
                                    boxShadow="0 8px 24px -6px rgba(212, 175, 55, 0.25)"
                                    borderRadius="14px"
                                    direction="column"
                                    align="center"
                                    justify="center"
                                    p="6px"
                                  >
                                    <Text
                                      color="#0C1C2C"
                                      fontWeight="800"
                                      fontSize="14px"
                                      noOfLines={1}
                                      textAlign="center"
                                    >
                                      {formatName(podium1[0].name.split(' ')[0])}
                                    </Text>
                                    <Text color="#0C1C2C" fontSize="13px" fontWeight="700" opacity={0.9}>
                                      <AnimatedScore
                                        value={podium1[0].score}
                                        disabled={Boolean(prefersReducedMotion)}
                                      />{' '}
                                      pts
                                    </Text>
                                  </Flex>
                                </motion.div>
                              </VStack>
                            )}

                            {/* 3rd Place */}
                            {podium3.length > 0 && (
                              <VStack spacing={1} w="31%" zIndex={1}>
                                {/* Avatar: only variants={avatar3ItemVariants} */}
                                <motion.div
                                  variants={avatar3ItemVariants}
                                  style={{ position: 'relative', marginBottom: '-8px', zIndex: 1 }}
                                >
                                  <Flex justify="center" align="center">
                                    {podium3.slice(0, 2).map((user, i) => (
                                      <Avatar
                                        key={user.username || i}
                                        src={user.avatar}
                                        name={user.name}
                                        size="md"
                                        ml={i === 0 ? 0 : -3}
                                        border="2px solid rgba(205, 127, 50, 0.4)"
                                        cursor="pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          router.push(`/user/profile/${user.username || user.userId}`);
                                        }}
                                      />
                                    ))}
                                  </Flex>
                                  <Badge
                                    position="absolute"
                                    bottom="-4px"
                                    left="50%"
                                    transform="translateX(-50%)"
                                    borderRadius="full"
                                    fontSize="10px"
                                    fontWeight="700"
                                    bg="#eddcd2"
                                    color="#0C1C2C"
                                    px="6px"
                                    boxShadow="sm"
                                  >
                                    #3
                                  </Badge>
                                </motion.div>

                                {/* 3rd Place Podium Block: only variants={podiumBlock3ItemVariants} */}
                                <motion.div
                                  variants={podiumBlock3ItemVariants}
                                  style={{ width: '100%' }}
                                >
                                  <Flex
                                    w="100%"
                                    h="72px"
                                    bg="linear-gradient(180deg, #eddcd2 0%, #ddc4b5 100%)"
                                    border="1px solid rgba(205, 127, 50, 0.4)"
                                    boxShadow="0 6px 18px -6px rgba(205, 127, 50, 0.2)"
                                    borderRadius="14px"
                                    direction="column"
                                    align="center"
                                    justify="center"
                                    p="6px"
                                  >
                                    <Text
                                      color="#0C1C2C"
                                      fontWeight="700"
                                      fontSize="13px"
                                      noOfLines={1}
                                      textAlign="center"
                                    >
                                      {formatName(podium3[0].name.split(' ')[0])}
                                    </Text>
                                    <Text color="#0C1C2C" fontSize="12px" fontWeight="600" opacity={0.85}>
                                      <AnimatedScore
                                        value={podium3[0].score}
                                        disabled={Boolean(prefersReducedMotion)}
                                      />{' '}
                                      pts
                                    </Text>
                                  </Flex>
                                </motion.div>
                              </VStack>
                            )}
                          </Flex>
                        </Box>

                        {/* Rank rows area: use max-height instead of fixed height */}
                        <Box
                          maxH="240px"
                          overflowY="auto"
                          px="12px"
                          py="8px"
                          position="relative"
                          zIndex={2}
                          css={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'var(--border) transparent',
                            '&::-webkit-scrollbar': { width: '4px' },
                            '&::-webkit-scrollbar-thumb': { background: 'var(--border)', borderRadius: '4px' },
                          }}
                        >
                          {/* List container: only variants={rankRowsListVariants} */}
                          <motion.div
                            variants={rankRowsListVariants}
                            style={{ display: 'flex', flexDirection: 'column' }}
                          >
                            {rest.map((user, idx) => {
                              const isCurrentUser = Boolean(
                                currentUsername &&
                                  (user.username?.toLowerCase() === currentUsername ||
                                    user.userId?.toLowerCase() === currentUsername ||
                                    user.name?.toLowerCase() === currentUsername),
                              );

                              return (
                                <motion.div
                                  key={`row-${weekData.week}-${user.username || user.userId || idx}`}
                                  variants={rankRowSingleItemVariants}
                                >
                                  <Flex
                                    align="center"
                                    px="12px"
                                    py="8px"
                                    my="4px"
                                    borderRadius="12px"
                                    bg={isCurrentUser ? 'var(--accent-soft)' : 'var(--card-soft)'}
                                    border="1px solid"
                                    borderColor={isCurrentUser ? 'var(--accent)' : 'transparent'}
                                    transition="background 0.2s, border-color 0.2s"
                                    _hover={{ bg: 'var(--accent-soft)' }}
                                    cursor="pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/user/profile/${user.username || user.userId}`);
                                    }}
                                  >
                                    <Text
                                      w="32px"
                                      fontWeight="700"
                                      fontSize="12px"
                                      color="var(--muted)"
                                      fontFamily="var(--f-mono)"
                                    >
                                      #{user.rank}
                                    </Text>
                                    <Avatar
                                      src={user.avatar}
                                      name={user.name}
                                      size="xs"
                                      mr="10px"
                                      border="1px solid var(--border)"
                                    />
                                    <Flex align="center" flex="1" minW="0" mr="8px">
                                      <Text
                                        fontSize="13.5px"
                                        fontWeight="600"
                                        color="var(--text)"
                                        noOfLines={1}
                                      >
                                        {formatName(user.name)}
                                      </Text>
                                      {isCurrentUser && (
                                        <Badge
                                          ml="8px"
                                          bg="var(--accent)"
                                          color="var(--accent-ink)"
                                          fontSize="10px"
                                          fontWeight="700"
                                          borderRadius="full"
                                          px="6px"
                                          py="1px"
                                        >
                                          You
                                        </Badge>
                                      )}
                                    </Flex>
                                    <Text
                                      fontSize="13px"
                                      fontWeight="600"
                                      color="var(--accent)"
                                      fontFamily="var(--f-mono)"
                                      style={{ fontVariantNumeric: 'tabular-nums' }}
                                    >
                                      <AnimatedScore
                                        value={user.score}
                                        disabled={Boolean(prefersReducedMotion)}
                                      />
                                      <Text as="span" fontSize="11px" color="var(--muted)" ml="4px">
                                        pts
                                      </Text>
                                    </Text>
                                  </Flex>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        </Box>
                      </motion.div>
                    )}
                  </Box>
                </motion.div>
              </motion.div>
            );
          })}
        </Box>

        {/* Next Button: sits just outside the active card */}
        <IconButton
          aria-label="Next week"
          icon={<FaChevronRight />}
          onClick={handleNext}
          isDisabled={safeActiveIndex === sortedWeeks.length - 1}
          display={{ base: 'none', md: 'inline-flex' }}
          position="absolute"
          right={{
            md: 'calc(50% - 210px - 54px)',
            lg: 'calc(50% - 210px - 58px)',
          }}
          top="50%"
          transform="translateY(-50%)"
          zIndex={25}
          size="md"
          isRound
          className="oc-button-secondary"
          _hover={{
            borderColor: 'var(--accent)',
            color: 'var(--accent)',
            bg: 'var(--accent-soft)',
          }}
          _focusVisible={{
            outline: '2px solid var(--accent)',
            outlineOffset: '2px',
          }}
        />
      </Flex>

      {/* Week Selector Row + Mobile Navigation */}
      <Flex
        justify="center"
        align="center"
        gap={{ base: '8px', sm: '12px' }}
        mt="24px"
        wrap="wrap"
      >
        {/* Mobile Prev Button */}
        <IconButton
          aria-label="Previous week"
          icon={<FaChevronLeft size={13} />}
          onClick={handlePrev}
          isDisabled={safeActiveIndex === 0}
          display={{ base: 'inline-flex', md: 'none' }}
          size="sm"
          isRound
          className="oc-button-secondary"
        />

        {/* Week Pills (Week 1 ... Week N) */}
        <HStack spacing="6px" wrap="wrap" justify="center">
          {sortedWeeks.map((week, idx) => {
            const isPillActive = safeActiveIndex === idx;
            return (
              <Button
                key={`pill-${week.week}`}
                size="sm"
                borderRadius="999px"
                px={{ base: '12px', sm: '16px' }}
                py="6px"
                fontSize="12.5px"
                fontWeight={isPillActive ? 700 : 500}
                bg={isPillActive ? 'var(--accent)' : 'var(--card-soft)'}
                color={isPillActive ? 'var(--accent-ink)' : 'var(--muted)'}
                border="1px solid"
                borderColor={isPillActive ? 'var(--accent)' : 'var(--border)'}
                boxShadow={isPillActive ? '0 4px 14px -3px var(--accent)' : 'none'}
                _hover={{
                  bg: isPillActive ? 'var(--accent-hover)' : 'var(--accent-soft)',
                  color: isPillActive ? 'var(--accent-ink)' : 'var(--fg)',
                  borderColor: isPillActive ? 'var(--accent-hover)' : 'var(--border-strong)',
                }}
                _focusVisible={{
                  outline: '2px solid var(--accent)',
                  outlineOffset: '2px',
                }}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Jump to Week ${week.week}`}
                aria-pressed={isPillActive}
              >
                Week {week.week}
              </Button>
            );
          })}
        </HStack>

        {/* Mobile Next Button */}
        <IconButton
          aria-label="Next week"
          icon={<FaChevronRight size={13} />}
          onClick={handleNext}
          isDisabled={safeActiveIndex === sortedWeeks.length - 1}
          display={{ base: 'inline-flex', md: 'none' }}
          size="sm"
          isRound
          className="oc-button-secondary"
        />

        {/* Autoplay Toggle Button (off by default) */}
        <Button
          size="sm"
          borderRadius="999px"
          px="10px"
          py="6px"
          fontSize="11.5px"
          variant="ghost"
          color="var(--subtle)"
          _hover={{ color: 'var(--fg)', bg: 'var(--card-soft)' }}
          onClick={() => setIsAutoplay((prev) => !prev)}
          leftIcon={<Icon as={isAutoplay ? MdPause : MdPlayArrow} />}
          aria-label={isAutoplay ? 'Pause carousel autoplay' : 'Start carousel autoplay'}
        >
          {isAutoplay ? 'Autoplay On' : 'Autoplay'}
        </Button>
      </Flex>
    </Box>
  );
}
