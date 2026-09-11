'use client';

import {
  Box,
  Flex,
  Text,
  SimpleGrid,
  useColorModeValue,
  Badge,
  Icon,
  Avatar,
  AvatarGroup,
  Link,
  Tooltip,
} from '@chakra-ui/react';
import { FaGithub, FaDiscord } from 'react-icons/fa';
import { MdFolder } from 'react-icons/md';
import Card from 'components/card/Card';
import { useState } from 'react';
import SearchProfileBanner from 'views/admin/profile/components/SearchProfileBanner';
import { FetchedRepos, FetchedEvents } from 'api/events/events';
import { useQuery } from '@tanstack/react-query';
import { RingLoader } from 'react-spinners';

export default function ReposPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedText = useColorModeValue('gray.500', 'gray.400');
  const glassBg = useColorModeValue('rgba(255,255,255,0.7)', 'rgba(15,23,42,0.7)');
  const cardBorder = useColorModeValue('purple.100', 'whiteAlpha.200');
  const cardHoverBg = useColorModeValue('rgba(255,255,255,0.9)', 'rgba(30,41,59,0.9)');

  const { data: eventData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['EventInfo'],
    queryFn: FetchedEvents,
  });
  
  const eventName = eventData?.data?.[0]?.name || process.env.NEXT_PUBLIC_EVENT_NAME || "OPENCODE'25";

  const { data, isLoading } = useQuery({
    queryKey: ['ReposInfo', eventName],
    queryFn: () => FetchedRepos(eventName),
    enabled: !!eventName && !isLoadingEvents,
  });

  const repositories = data?.data || [];

  const filteredRepos = repositories.filter((repo: any) => 
    (repo.name && repo.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (repo.tags && repo.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  if (isLoading || isLoadingEvents) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <RingLoader color="#805AD5" />
      </Flex>
    );
  }

  return (
    <Box pt={{ base: '110px', md: '90px' }} px={{ base: '16px', md: '32px' }} maxW="1400px" mx="auto">
      <Flex direction="column" mb={{ base: '20px', md: '40px' }}>
        <Box position="relative" w="fit-content" mb="24px">
          <Text fontSize={{ base: '30px', sm: '36px', md: '44px' }} fontWeight="900" letterSpacing="-1.4px" color={textColor} lineHeight="1">
            REPOSITORIES
          </Text>
          <Flex position="absolute" right="-20px" bottom={{ base: '-4px', md: '-6px' }} align="center" gap="6px">
            <Box w={{ base: '22px', md: '28px' }} h="3px" bg="purple.500" borderRadius="full" />
            <Box w="6px" h="6px" bg="purple.500" borderRadius="full" />
          </Flex>
        </Box>
        
        <Flex justify="space-between" align="center" flexWrap="wrap" gap="16px">
          <Text color={mutedText} fontSize="16px" maxW="600px">
            Explore the active projects for this year's event. Find an interesting repository, reach out to the maintainers on Discord, and start contributing!
          </Text>
          <Box w={{ base: "100%", md: "300px" }}>
            <SearchProfileBanner value={searchQuery} onChange={setSearchQuery} />
          </Box>
        </Flex>
      </Flex>

      {filteredRepos.length === 0 ? (
        <Flex direction="column" align="center" justify="center" py="80px">
          <Icon as={MdFolder} color="purple.300" mb="16px" w="48px" h="48px" />
          <Text fontSize="xl" fontWeight="700" color={textColor}>No repositories found</Text>
          <Text color={mutedText} mt="8px">Try adjusting your search query.</Text>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="24px" mb="40px">
          {filteredRepos.map((repo, idx) => (
            <Card
              key={idx}
              bg={glassBg}
              border="1px solid"
              borderColor={cardBorder}
              backdropFilter="blur(16px)"
              p="24px"
              borderRadius="20px"
              transition="all 0.3s ease"
              _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl', bg: cardHoverBg }}
              display="flex"
              flexDirection="column"
              h="100%"
            >
              <Flex justify="space-between" align="start" mb="16px">
                <Flex align="center" gap="12px">
                  <Box p="10px" bg="purple.100" color="purple.600" borderRadius="12px">
                    <Icon as={MdFolder} w="24px" h="24px" />
                  </Box>
                  <Text fontSize="xl" fontWeight="800" color={textColor} wordBreak="break-word">
                    {repo.name}
                  </Text>
                </Flex>
                <Link href={repo.githubLink} isExternal>
                  <Box p="8px" bg="gray.100" _dark={{ bg: 'whiteAlpha.200' }} borderRadius="full" transition="all 0.2s" _hover={{ bg: 'purple.500', color: 'white' }}>
                    <Icon as={FaGithub} w="18px" h="18px" />
                  </Box>
                </Link>
              </Flex>

              <Text color={mutedText} fontSize="14px" mb="20px" flex="1" lineHeight="1.6">
                {repo.description}
              </Text>

              <Flex flexWrap="wrap" gap="8px" mb="24px">
                {repo.tags?.map((tag: string) => (
                  <Badge key={tag} colorScheme="purple" px="10px" py="4px" borderRadius="8px" textTransform="none" fontSize="11px" fontWeight="600">
                    {tag}
                  </Badge>
                ))}
              </Flex>

              <Box pt="16px" borderTop="1px solid" borderColor={cardBorder}>
                <Text fontSize="12px" fontWeight="700" color={mutedText} mb="12px" textTransform="uppercase" letterSpacing="0.5px">
                  Maintainers
                </Text>
                <Flex justify="space-between" align="center">
                  <AvatarGroup size="sm" max={3}>
                    {repo.maintainers?.map((m: any) => (
                      <Tooltip key={m.name} label={`${m.name} (${m.discord})`} placement="top">
                        <Avatar name={m.name} src={`https://github.com/${m.name}.png`} />
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                  <Flex align="center" gap="6px" color="purple.500" fontSize="13px" fontWeight="600">
                    <Icon as={FaDiscord} />
                    <Text>Ask on Discord</Text>
                  </Flex>
                </Flex>
              </Box>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
