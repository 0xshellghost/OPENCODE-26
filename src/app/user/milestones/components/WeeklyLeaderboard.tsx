'use client';

import {
  Avatar,
  Badge,
  Box,
  Flex,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaCrown, FaTrophy } from 'react-icons/fa';
import { AutoCarousel } from '../../../../components/ui/AutoCarousel';
import { opencodeTokens } from '../../../../theme/opencode-tokens';

const MotionBox = motion(Box);

interface LeaderboardUser {
  rank: number;
  name: string;
  score: number;
  avatar: string;
  username: string;
  userId: string;
}

interface WeeklyLeaderboardCardProps {
  weeks: {
    week: number;
    data: LeaderboardUser[];
  }[];
}

export function WeeklyLeaderboardCard({ weeks }: WeeklyLeaderboardCardProps) {
  const router = useRouter();

  const cardBg = useColorModeValue('white', 'gray.800');
  const podiumBg = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const muted = useColorModeValue('gray.500', 'gray.400');

  const sortedWeeks = [...weeks].sort((a, b) => b.week - a.week);
  const isSingleWeek = sortedWeeks.length === 1;

  const podiumStyle = (rank: number) => {
    if (rank === 1) return { bg: opencodeTokens.colors.rank.gold, h: '110px' };
    if (rank === 2) return { bg: opencodeTokens.colors.rank.silver, h: '82px' };
    if (rank === 3) return { bg: opencodeTokens.colors.rank.bronze, h: '68px' };
    return { bg: opencodeTokens.colors.accent.sakura, h: '60px' };
  };

  return (
    <AutoCarousel>
      {sortedWeeks.map((week) => {
        if (!week?.data?.length) return null;

        const podiumGroups: Record<number, LeaderboardUser[]> = {
          1: week.data.filter((u) => u.rank === 1),
          2: week.data.filter((u) => u.rank === 2),
          3: week.data.filter((u) => u.rank === 3),
        };

        const rest = week.data.filter((u) => u.rank > 3);

        return (
          <Box
            key={week.week}
            bg={cardBg}
            borderRadius="26px"
            boxShadow="xl"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
            h={isSingleWeek ? '620px' : '540px'}
            maxW={isSingleWeek ? '620px' : '100%'}
            mx="auto"
            display="flex"
            flexDirection="column"
          >
            {/* Header */}
            <Flex
              bg={opencodeTokens.colors.accent.sakura}
              px="22px"
              py="14px"
              align="center"
              justify="space-between"
              color="gray.900"
            >
              <Box>
                <Text fontSize="10px" letterSpacing="0.14em" opacity={0.85} fontWeight="700">
                  WEEKLY LEADERBOARD
                </Text>
                <Text fontSize="20px" fontWeight="900">
                  Week {week.week}
                </Text>
              </Box>
              <Icon as={FaTrophy} color="yellow.400" />
            </Flex>

          
            <Box bg={podiumBg} px="16px" pt="28px" pb="20px">
              <Flex justify="center" align="flex-end" gap="12px">
                {[2, 1, 3].map((rank) => {
                  const users = podiumGroups[rank];
                  if (!users.length) return null;

                  const style = podiumStyle(rank);
                  const isFirst = rank === 1;

                  return (
                    <VStack key={`${week.week}-rank-${rank}`} spacing={1} w="32%" zIndex={isFirst ? 2 : 1}>
                      {/* Avatars */}
                      <Box position="relative" mb="-10px">
                        <Flex justify="center">
                          {users.slice(0, 3).map((user, i) => (
                            <Avatar
                              key={user.username}
                              src={user.avatar}
                              size={isFirst ? 'md' : 'md'}
                              ml={i === 0 ? 0 : -3}
                              border="3px solid white"
                              zIndex={0}
                              cursor="pointer"
                              onClick={() =>
                                router.push(`/user/profile/${user.username}`)
                              }
                            />
                          ))}
                        </Flex>

                        {isFirst && (
                          <MotionBox
                            animate={{ y: [-2, 2, -2] }}
                            transition={{ repeat: Infinity, duration: 1.6 }}
                            position="absolute"
                            top="-22px"
                            left="39%"
                            transform="translateX(-50%)"
                          >
                            <Icon as={FaCrown} color="yellow.400" w={4} h={4} />
                          </MotionBox>
                        )}

                        <Badge
                          position="absolute"
                          bottom="-4px"
                          left="50%"
                          transform="translateX(-50%)"
                          borderRadius="full"
                          fontSize="10px"
                          bg="white"
                          color="gray.700"
                          px={2}
                          zIndex={1}
                        >
                          #{rank}
                        </Badge>
                      </Box>

                      {/* Podium Block */}
                      <Flex
                        w="100%"
                        h={style.h}
                        bg={style.bg}
                        borderRadius="12px"
                        align="center"
                        justify="center"
                        direction="column"
                        pt="14px"
                        boxShadow="md"
                      >
                        {users.map((user) => (
                          <Text
                            key={user.username}
                            color="gray.900"
                            fontWeight="800"
                            fontSize="13px"
                            noOfLines={1}
                          >
                            {user.name.split(' ')[0]}
                          </Text>
                        ))}
                        {users.length > 3 && (
                          <Text fontSize="11px" color="gray.800">
                            +{users.length - 3} more
                          </Text>
                        )}
                      </Flex>
                    </VStack>
                  );
                })}
              </Flex>
            </Box>

            {/* Rest List */}
            <Box
  flex="1"
  overflowY="auto"
  px="14px"
  py="12px"
  sx={{
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}}

>

              <VStack spacing="8px">
                {rest.map((user) => (
                  <Flex
                    key={user.username}
                    w="full"
                    align="center"
                    p="10px"
                    borderRadius="12px"
                    bg={useColorModeValue('gray.50', 'whiteAlpha.100')}
                    _hover={{ bg: opencodeTokens.colors.accent.sakura, color: 'gray.900' }}
                  >
                    <Text w="26px" fontWeight="800" fontSize="12px" color={muted}>
                      #{user.rank}
                    </Text>
                    <Avatar src={user.avatar} size="xs" mr="10px" />
                    <Text flex="1" fontWeight="700" fontSize="13px" noOfLines={1}>
                      {user.name}
                    </Text>
                    <Text fontWeight="800" fontSize="13px">
                      {user.score}
                    </Text>
                  </Flex>
                ))}
              </VStack>
            </Box>
          </Box>
        );
      })}
    </AutoCarousel>
  );
}

