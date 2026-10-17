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
import { MdEmojiEvents, MdStar, MdPlayArrow, MdPause } from 'react-icons/md';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import {
  coverflowSpring,
  getCoverflowCardStyle,
  rankRowsListVariants,
  rankRowSingleItemVariants,
} from './leaderboardMotion';

export interface EventWinner {
  name: string;
  avatar: string;
  username: string;
  userId?: string;
  score?: number;
  college?: string;
  date?: string;
}

export interface Event {
  eventName: string;
  winners: Record<number, EventWinner[]>;
  eventImage?: string;
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
 * Soft pastel rank accents with dark ink text
 */
const rankStyles: Record<
  number,
  {
    bg: string;
    border: string;
    label: string;
    accentColor: string;
    text: string;
  }
> = {
  1: {
    bg: 'linear-gradient(180deg, #f7e7b4 0%, #ecd599 100%)',
    border: 'rgba(212, 175, 55, 0.45)',
    label: '1st Place · Gold',
    accentColor: '#d4af37',
    text: '#2a1420',
  },
  2: {
    bg: 'linear-gradient(180deg, #e8ecf1 0%, #d5dbe3 100%)',
    border: 'rgba(160, 174, 192, 0.45)',
    label: '2nd Place · Silver',
    accentColor: '#a0aec0',
    text: '#2a1420',
  },
  3: {
    bg: 'linear-gradient(180deg, #eddcd2 0%, #ddc4b5 100%)',
    border: 'rgba(205, 127, 50, 0.4)',
    label: '3rd Place · Bronze',
    accentColor: '#cd7f32',
    text: '#2a1420',
  },
};

export function EventWinnersCard({ events }: { events: Event[] }) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

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

  useEffect(() => {
    setCurrentUsername(getCurrentGithubUser());
  }, []);

  // Safe active index never undefined or -1
  const safeActiveIndex = events.length > 0
    ? Math.min(Math.max(0, activeIndex), events.length - 1)
    : 0;

  // Autoplay handler
  useEffect(() => {
    if (!isAutoplay || isPaused || prefersReducedMotion || events.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % events.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isAutoplay, isPaused, prefersReducedMotion, events.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => Math.min(events.length - 1, prev + 1));
  }, [events.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  if (!events.length) {
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
          <Icon as={MdEmojiEvents} boxSize="28px" />
        </Box>
        <Text fontFamily="Georgia, serif" fontSize="22px" color="var(--text)" mb="6px">
          No Event Winners Yet
        </Text>
        <Text fontSize="14px" color="var(--muted)">
          Event results will appear here as sub-events conclude.
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
      aria-label="Event Winners coverflow carousel"
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
        {/* Prev Button: sits just outside the active card */}
        <IconButton
          aria-label="Previous event"
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
          {events.map((event, index) => {
            const offset = index - safeActiveIndex;
            const style = getCoverflowCardStyle(offset, isMobile);
            const isActive = offset === 0;

            const sortedRanks = Object.keys(event.winners)
              .map(Number)
              .sort((a, b) => a - b);

            const hasWinners = sortedRanks.length > 0;

            return (
              <motion.div
                key={`event-card-${event.eventName}-${index}`}
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
                      <Box overflow="hidden" mr="12px">
                        <Text
                          fontSize="10.5px"
                          letterSpacing="0.16em"
                          color="var(--accent)"
                          fontWeight="700"
                          fontFamily="var(--f-body)"
                          textTransform="uppercase"
                        >
                          Sub Event Champions
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
                          noOfLines={1}
                        >
                          {event.eventName}
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
                        flexShrink={0}
                      >
                        <Icon as={MdEmojiEvents} boxSize="18px" />
                      </Flex>
                    </Flex>

                    {/* Card Body */}
                    {!hasWinners ? (
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
                          <Icon as={MdEmojiEvents} boxSize="24px" />
                        </Box>
                        <Text fontFamily="Georgia, serif" fontSize="20px" color="var(--text)" mb="6px">
                          Winners In Progress
                        </Text>
                        <Text fontSize="13px" color="var(--muted)" maxW="240px" lineHeight="1.6">
                          Results for {event.eventName} will be published shortly.
                        </Text>
                      </Flex>
                    ) : (
                      /* Rank rows area with max-height instead of fixed height */
                      <Box
                        maxH="340px"
                        overflowY="auto"
                        p="14px"
                        position="relative"
                        zIndex={2}
                        css={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: 'var(--border) transparent',
                          '&::-webkit-scrollbar': { width: '4px' },
                          '&::-webkit-scrollbar-thumb': { background: 'var(--border)', borderRadius: '4px' },
                        }}
                      >
                        {/* Container gets variants={rankRowsListVariants} initial="hidden" animate="show" and key equal to eventName */}
                        <motion.div
                          key={`event-winners-${event.eventName}`}
                          variants={rankRowsListVariants}
                          initial="hidden"
                          animate="show"
                          style={{ display: 'flex', flexDirection: 'column' }}
                        >
                          {sortedRanks.map((rank) => {
                            const users = event.winners[rank] || [];
                            const rStyle = rankStyles[rank] || {
                              bg: 'var(--card-soft)',
                              border: 'var(--border)',
                              label: `Rank ${rank}`,
                              accentColor: 'var(--accent)',
                              text: 'var(--text)',
                            };

                            return (
                              <Box key={`rank-group-${event.eventName}-${rank}`} mb="16px">
                                {/* Rank Pill Header */}
                                <Flex
                                  align="center"
                                  gap="8px"
                                  px="10px"
                                  py="5px"
                                  borderRadius="999px"
                                  bg={rStyle.bg}
                                  border="1px solid"
                                  borderColor={rStyle.border}
                                  w="fit-content"
                                  mb="8px"
                                >
                                  <Icon as={MdStar} color={rStyle.text} boxSize="13px" />
                                  <Text
                                    fontSize="11.5px"
                                    fontWeight="700"
                                    color={rStyle.text}
                                    letterSpacing="0.04em"
                                    textTransform="uppercase"
                                  >
                                    {rStyle.label}
                                  </Text>
                                </Flex>

                                {/* Winner Entries: each only gets variants={rankRowSingleItemVariants}, no initial or animate */}
                                <VStack spacing="6px" align="stretch">
                                  {users.map((u, i) => {
                                    const isCurrentUser = Boolean(
                                      currentUsername &&
                                        (u.username?.toLowerCase() === currentUsername ||
                                          u.userId?.toLowerCase() === currentUsername ||
                                          u.name?.toLowerCase() === currentUsername),
                                    );

                                    return (
                                      <motion.div
                                        key={`winner-${event.eventName}-${rank}-${u.userId || u.username || i}`}
                                        variants={rankRowSingleItemVariants}
                                      >
                                        <Flex
                                          align="center"
                                          p="10px 12px"
                                          borderRadius="14px"
                                          bg={isCurrentUser ? 'var(--accent-soft)' : 'var(--card-soft)'}
                                          border="1px solid"
                                          borderColor={isCurrentUser ? 'var(--accent)' : 'var(--border)'}
                                          transition="background 0.2s, border-color 0.2s"
                                          _hover={{ bg: 'var(--accent-soft)' }}
                                          cursor="pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const target = u.userId || u.username;
                                            if (target) router.push(`/user/profile/${target}`);
                                          }}
                                        >
                                          <Avatar
                                            size="sm"
                                            src={u.avatar}
                                            name={u.name}
                                            mr="10px"
                                            border="2px solid"
                                            borderColor={rStyle.border}
                                          />

                                          <Box flex="1" minW="0" mr="8px">
                                            <Flex align="center">
                                              <Text
                                                fontSize="13.5px"
                                                fontWeight="600"
                                                color="var(--text)"
                                                noOfLines={1}
                                              >
                                                {formatName(u.name)}
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
                                              fontSize="11.5px"
                                              color="var(--muted)"
                                              noOfLines={1}
                                              mt="1px"
                                            >
                                              {u.college || (u.username ? `@${u.username}` : '')}
                                            </Text>
                                          </Box>

                                          {u.score !== undefined && (
                                            <Badge
                                              px="8px"
                                              py="3px"
                                              borderRadius="999px"
                                              bg="var(--card-strong)"
                                              color="var(--accent)"
                                              fontSize="12px"
                                              fontWeight="700"
                                              border="1px solid"
                                              borderColor="var(--border)"
                                              fontFamily="var(--f-mono)"
                                              style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                              {u.score.toLocaleString()} pts
                                            </Badge>
                                          )}
                                        </Flex>
                                      </motion.div>
                                    );
                                  })}
                                </VStack>
                              </Box>
                            );
                          })}
                        </motion.div>
                      </Box>
                    )}
                  </Box>
                </motion.div>
              </motion.div>
            );
          })}
        </Box>

        {/* Next Button: sits just outside the active card */}
        <IconButton
          aria-label="Next event"
          icon={<FaChevronRight />}
          onClick={handleNext}
          isDisabled={safeActiveIndex === events.length - 1}
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

      {/* Event Selector Row + Mobile Navigation */}
      <Flex
        justify="center"
        align="center"
        gap={{ base: '8px', sm: '12px' }}
        mt="24px"
        wrap="wrap"
      >
        {/* Mobile Prev Button */}
        <IconButton
          aria-label="Previous event"
          icon={<FaChevronLeft size={13} />}
          onClick={handlePrev}
          isDisabled={safeActiveIndex === 0}
          display={{ base: 'inline-flex', md: 'none' }}
          size="sm"
          isRound
          className="oc-button-secondary"
        />

        {/* Event Pills */}
        <HStack spacing="6px" wrap="wrap" justify="center">
          {events.map((ev, idx) => {
            const isPillActive = safeActiveIndex === idx;
            return (
              <Button
                key={`event-pill-${ev.eventName}-${idx}`}
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
                aria-label={`Jump to ${ev.eventName}`}
                aria-pressed={isPillActive}
              >
                {ev.eventName}
              </Button>
            );
          })}
        </HStack>

        {/* Mobile Next Button */}
        <IconButton
          aria-label="Next event"
          icon={<FaChevronRight size={13} />}
          onClick={handleNext}
          isDisabled={safeActiveIndex === events.length - 1}
          display={{ base: 'inline-flex', md: 'none' }}
          size="sm"
          isRound
          className="oc-button-secondary"
        />

        {/* Autoplay Toggle Button */}
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
