'use client';

import {
  Avatar,
  Box,
  Flex,
  Icon,
  Progress,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { MdEmojiEvents, MdStar } from 'react-icons/md';
import { AutoCarousel } from '../../../../components/ui/AutoCarousel';

interface Event {
  eventName: string;
  winners: Record<number, any[]>;
  eventImage?: string;
}

export function EventWinnersCard({ events }: { events: Event[] }) {
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const cardBg = useColorModeValue('white', '#312C34'); // Dark Plum
  const borderColor = useColorModeValue('gray.100', '#3E3843'); // Charcoal Plum
  const surfaceBg = useColorModeValue('white', 'whiteAlpha.50');
  const surfaceBorder = useColorModeValue('gray.100', 'whiteAlpha.200');
  const mutedText = useColorModeValue('gray.600', 'gray.400');
  const labelText = useColorModeValue('#9D767E', '#CF9690'); // Dusty Rose / Soft Peach
  const headerBorder = useColorModeValue('gray.200', 'whiteAlpha.300');

  const cardShadow = useColorModeValue(
    '0 20px 55px rgba(15,23,42,0.12)',
    '0 30px 70px rgba(0,0,0,0.45)',
  );

  const rankStyles = {
    1: {
      bg: useColorModeValue('yellow.50', 'rgba(234,201,75,0.12)'),
      border: useColorModeValue('yellow.200', 'rgba(234,201,75,0.4)'),
      icon: 'yellow.400',
      label: 'Gold',
      badgeBg: useColorModeValue('yellow.100', 'rgba(234,201,75,0.2)'),
    },
    2: {
      bg: useColorModeValue('gray.50', 'rgba(160,174,192,0.12)'),
      border: useColorModeValue('gray.200', 'rgba(160,174,192,0.4)'),
      icon: 'gray.400',
      label: 'Silver',
      badgeBg: useColorModeValue('gray.100', 'rgba(160,174,192,0.2)'),
    },
    3: {
      bg: useColorModeValue('orange.50', 'rgba(237,137,54,0.12)'),
      border: useColorModeValue('orange.200', 'rgba(237,137,54,0.4)'),
      icon: 'orange.400',
      label: 'Bronze',
      badgeBg: useColorModeValue('orange.100', 'rgba(237,137,54,0.2)'),
    },
    default: {
      bg: useColorModeValue('#FEF3ED', 'rgba(157, 118, 126, 0.12)'),
      border: useColorModeValue('#E8C0BB', 'rgba(157, 118, 126, 0.35)'),
      icon: '#CF9690',
      label: 'Winner',
      badgeBg: useColorModeValue('#E8C0BB', 'rgba(157, 118, 126, 0.2)'),
    },
  };

  const getRankStyle = (rank: number) =>
    rankStyles[rank as 1 | 2 | 3] ?? rankStyles.default;

  const renderCard = (event: Event, idx: number) => (
    <Box
      key={`${event.eventName}-${idx}`}
      bg={cardBg}
      p={{ base: '18px', md: '22px' }}
      borderRadius="28px"
      boxShadow={cardShadow}
      border="1px solid"
      borderColor={borderColor}
      minH="500px"
      minW={{ md: '420px' }}
      display="flex"
      flexDirection="column"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-6px)', boxShadow: 'xl' }}
    >
      {/* Header */}
      <Flex
        align="center"
        mb="18px"
        pb="14px"
        borderBottom="1px dashed"
        borderColor={headerBorder}
      >
        <Flex
          w="42px"
          h="42px"
          bg={useColorModeValue('#E8C0BB', 'whiteAlpha.200')}
          borderRadius="14px"
          align="center"
          justify="center"
          mr="14px"
        >
          <Icon as={MdEmojiEvents} color={labelText} boxSize={6} />
        </Flex>
        <Box overflow="hidden">
          <Text fontSize="10px" fontWeight="800" color={labelText} letterSpacing="1px">
            EVENT CHAMPION
          </Text>
          <Text fontSize="20px" fontWeight="800" noOfLines={1}>
            {event.eventName}
          </Text>
        </Box>
      </Flex>

      {/* Winners */}
      <Box flex="1" overflowY="auto" pr="4px">
        {Object.entries(event.winners).map(([rank, users]) => {
          const styles = getRankStyle(Number(rank));

          return (
            <Box
              key={rank}
              mb="16px"
              p="12px"
              borderRadius="18px"
              bg={styles.bg}
              border="1px solid"
              borderColor={styles.border}
            >
              <Flex align="center" gap="8px" mb="10px">
                <Icon as={MdStar} color={styles.icon} />
                <Text fontSize="12px" fontWeight="700" textTransform="uppercase">
                  {styles.label}
                </Text>
              </Flex>

              {users.map((u: any, i: number) => (
                <Box
                  key={`${u.userId ?? 'user'}-${i}`}
                  p="12px"
                  mb="8px"
                  borderRadius="16px"
                  bg={surfaceBg}
                  border="1px solid"
                  borderColor={surfaceBorder}
                  cursor="pointer"
                  transition="all 0.25s"
                  _hover={{
                    transform: 'translateY(-3px)',
                    boxShadow: 'md',
                    borderColor: styles.border,
                  }}
                  onClick={() =>
                    u.userId && router.push(`/user/profile/${u.userId}`)
                  }
                >
                  <Flex align="center" gap="10px">
                    <Avatar
                      size="sm"
                      src={u.avatar}
                      name={u.name}
                      border="2px solid"
                      borderColor={styles.border}
                    />

                    <Box flex="1" overflow="hidden">
                      <Text fontSize="14px" fontWeight="700" noOfLines={1}>
                        {u.name}
                      </Text>
                      <Text fontSize="12px" color={mutedText} noOfLines={1}>
                        {u.college ?? `@${u.username}`}
                      </Text>
                    </Box>

                    {u.score && (
                      <Box
                        px="12px"
                        py="6px"
                        borderRadius="999px"
                        bg={styles.badgeBg}
                        fontSize="13px"
                        fontWeight="800"
                        border="1px solid"
                        borderColor={styles.border}
                        boxShadow={
                          Number(rank) === 1
                            ? '0 0 0 2px rgba(234,201,75,0.25)'
                            : 'sm'
                        }
                      >
                        {u.score} pts
                      </Box>
                    )}
                  </Flex>

                  {!isMobile && u.score && Number(rank) <= 3 && (
                    <Progress
                      mt="8px"
                      value={Math.min((u.score % 100) + 40, 100)}
                      size="xs"
                      borderRadius="999px"
                      colorScheme={
                        Number(rank) === 1
                          ? 'yellow'
                          : Number(rank) === 2
                            ? 'gray'
                            : 'orange'
                      }
                      bg="blackAlpha.100"
                    />
                  )}
                </Box>
              ))}
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  if (isMobile) {
    return <Flex direction="column" gap="16px">{events.map(renderCard)}</Flex>;
  }

  return <AutoCarousel>{events.map(renderCard)}</AutoCarousel>;
}
