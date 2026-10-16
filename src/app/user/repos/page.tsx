'use client';

import {
  Box,
  Flex,
  Text,
  SimpleGrid,
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
import PageHeading from 'components/japanese/PageHeading';
import { opencodeTokens } from '../../../theme/opencode-tokens';
import { useState, useMemo } from 'react';
import SearchProfileBanner from 'views/admin/profile/components/SearchProfileBanner';
import { FetchedRepos, FetchedEvents } from 'api/events/events';
import { useQuery } from '@tanstack/react-query';
import { RingLoader } from 'react-spinners';

export default function ReposPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const textColor = opencodeTokens.colors.text.primary;
  const mutedText = opencodeTokens.colors.text.secondary;
  const glassBg = opencodeTokens.colors.background.glassDark;
  const cardBorder = opencodeTokens.colors.border.light;
  const cardHoverBg = opencodeTokens.colors.background.glassLight;

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

  const filteredRepos = useMemo(() => repositories.filter((repo: any) => 
    (repo.name && repo.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (repo.tags && repo.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  ), [repositories, searchQuery]);

  if (isLoading || isLoadingEvents) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <RingLoader color={opencodeTokens.colors.accent.sakura} />
      </Flex>
    );
  }

  return (
    <Box pt="0" px="0" maxW="1400px" mx="auto">
      <Flex direction="column" mb={{ base: '20px', md: '40px' }}>
        <PageHeading eyebrow="IDEAS INTO IMPACT" title="Built in the open." description="Explore this season’s repositories. Find a project that sparks your curiosity, meet its maintainers, and make your first contribution." />
        
        <Flex justify="space-between" align="center" flexWrap="wrap" gap="16px">
          <Text color={mutedText} fontSize="16px" maxW="600px">
            {filteredRepos.length} repositories to explore
          </Text>
          <Box w={{ base: "100%", md: "340px" }}>
            <SearchProfileBanner
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by Repo name or Keywords"
              w="100%"
            />
          </Box>
        </Flex>
      </Flex>

      {filteredRepos.length === 0 ? (
        <Flex direction="column" align="center" justify="center" py="80px" className="glass-panel" borderRadius="24px" boxShadow={opencodeTokens.shadows.glass}>
          <Icon as={MdFolder} color={opencodeTokens.colors.accent.sakura} mb="16px" w="48px" h="48px" />
          <Text fontSize="xl" fontWeight="700" color={textColor}>No repositories found</Text>
          <Text color={mutedText} mt="8px">Try adjusting your search query.</Text>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="24px" mb="40px">
          {filteredRepos.map((repo: any, idx: number) => (
            <Card
              key={idx}
              className="glass-panel"
              border={`1px solid ${cardBorder}`}
              p="24px"
              borderRadius="20px"
              transition="all 0.3s ease"
              _hover={{ transform: 'translateY(-5px)', boxShadow: `0 15px 30px ${opencodeTokens.colors.accent.sakura}40`, bg: cardHoverBg, borderColor: opencodeTokens.colors.accent.sakura }}
              display="flex"
              flexDirection="column"
              h="100%"
            >
              <Flex justify="space-between" align="start" mb="16px">
                <Flex align="center" gap="12px">
                  <Box p="10px" bg={opencodeTokens.colors.background.glassLight} color={opencodeTokens.colors.accent.sakura} borderRadius="12px">
                    <Icon as={MdFolder} w="24px" h="24px" />
                  </Box>
                  <Text fontSize="xl" fontWeight="800" color={textColor} wordBreak="break-word">
                    {repo.name}
                  </Text>
                </Flex>
                <Link href={repo.githubLink} isExternal aria-label={`View ${repo.name} on GitHub`}>
                  <Box p="8px" bg={opencodeTokens.colors.background.glassDark} borderRadius="full" transition="all 0.2s" _hover={{ bg: opencodeTokens.colors.accent.sakura, color: 'white' }}>
                    <Icon as={FaGithub} w="18px" h="18px" />
                  </Box>
                </Link>
              </Flex>

              <Text color={mutedText} fontSize="14px" mb="20px" flex="1" lineHeight="1.6">
                {repo.description}
              </Text>

              <Flex flexWrap="wrap" gap="8px" mb="24px">
                {repo.tags?.map((tag: string) => (
                  <Badge key={tag} bg={opencodeTokens.colors.background.glassLight} color={opencodeTokens.colors.text.primary} px="10px" py="4px" borderRadius="8px" textTransform="none" fontSize="11px" fontWeight="600">
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
                  <Flex align="center" gap="6px" color={opencodeTokens.colors.accent.sakura} fontSize="13px" fontWeight="600">
                    <Icon as={FaDiscord} />
                    <Link href="https://discord.com/channels/885149696249708635/885151791329722448" isExternal>Ask on Discord</Link>
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
