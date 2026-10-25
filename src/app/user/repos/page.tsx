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
  Tooltip,
} from '@chakra-ui/react';
import { FaGithub, FaDiscord } from 'react-icons/fa';
import {
  FolderGit2,
  ExternalLink,
  GitBranch,
} from 'lucide-react';
import SearchProfileBanner from 'views/admin/profile/components/SearchProfileBanner';
import { useState, useMemo } from 'react';
import { FetchedRepos, FetchedEvents } from 'api/events/events';
import { useQuery } from '@tanstack/react-query';
import { RingLoader } from 'react-spinners';
import AnimatedContent from 'components/reactbits/AnimatedContent';

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Kotlin: '#A97BFF',
  Dart: '#02569B',
  Flutter: '#02569B',
  'C++': '#f34b7d',
  'C#': '#178600',
  Java: '#b07219',
  Solidity: '#aa66cc',
  Design: '#ea4c89',
  Security: '#e53e3e',
};

function detectPrimaryLanguage(repo: any): { name: string; color: string } {
  const tags = repo.tags || [];
  for (const tag of tags) {
    if (LANGUAGE_COLORS[tag]) {
      return { name: tag, color: LANGUAGE_COLORS[tag] };
    }
  }
  const name = repo.name?.toLowerCase() || '';
  if (name.includes('rust') || name.includes('ding')) return { name: 'Rust', color: '#dea584' };
  if (name.includes('go')) return { name: 'Go', color: '#00ADD8' };
  if (name.includes('python') || name.includes('vision') || name.includes('planet'))
    return { name: 'Python', color: '#3572A5' };
  if (name.includes('compose') || name.includes('frontend') && name.includes('alum'))
    return { name: 'Kotlin', color: '#A97BFF' };
  if (name.includes('cp') || name.includes('chronicles')) return { name: 'C++', color: '#f34b7d' };
  if (name.includes('nommetric')) return { name: 'Dart', color: '#02569B' };
  if (name.includes('loktantra') || name.includes('eventchain')) return { name: 'Solidity', color: '#aa66cc' };
  return { name: 'TypeScript', color: '#3178c6' };
}

export default function ReposPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const textColor = 'var(--fg)';
  const mutedText = 'var(--muted)';

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

  const filteredRepos = useMemo(() => {
    return repositories.filter((repo: any) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const matchSearch =
        (repo.name && repo.name.toLowerCase().includes(query)) ||
        (repo.description && repo.description.toLowerCase().includes(query)) ||
        (repo.tags && repo.tags.some((tag: string) => tag.toLowerCase().includes(query)));

      return matchSearch;
    });
  }, [repositories, searchQuery]);

  if (isLoading || isLoadingEvents) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <RingLoader color="var(--accent)" />
      </Flex>
    );
  }

  return (
    <Box pt="0" px="0" maxW="1400px" mx="auto">
      {/* Search Toolbar matching Leaderboard design */}
      <Box mb={{ base: '24px', md: '32px' }}>
        <SearchProfileBanner
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search repository or tech stack…"
          w={{ base: '100%', sm: '320px', md: '360px' }}
        />
      </Box>

      {/* Empty State */}
      {filteredRepos.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py="70px"
          borderRadius="24px"
          bg="var(--surface)"
          border="1px solid var(--border)"
        >
          <Icon as={FolderGit2} color="var(--accent)" mb="16px" w="42px" h="42px" />
          <Text fontSize="xl" fontWeight="700" color={textColor}>
            No repositories matched your search
          </Text>
          <Text color={mutedText} mt="8px" fontSize="14px">
            Try adjusting your search keyword.
          </Text>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-4 px-4 py-2 rounded-full text-xs font-bold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)] transition-all"
          >
            Clear search
          </button>
        </Flex>
      ) : (
        /* Human-Crafted Developer Repository Grid */
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="24px" mb="40px">
          {filteredRepos.map((repo: any, idx: number) => {
            const lang = detectPrimaryLanguage(repo);

            return (
              <AnimatedContent key={repo.name || idx} delay={idx * 0.03}>
                <Box
                  position="relative"
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  h="100%"
                  p="22px"
                  borderRadius="20px"
                  bg="var(--surface)"
                  backdropFilter="blur(20px)"
                  border="1px solid var(--border)"
                  boxShadow="var(--shadow)"
                  transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                  _hover={{
                    transform: 'translateY(-4px)',
                    borderColor: 'var(--accent)',
                    boxShadow: 'var(--shadow), 0 0 20px var(--accent-soft)',
                  }}
                  className="group"
                >
                  {/* Top Header: GitHub Org + Project Title + External Icon */}
                  <div>
                    <Flex justify="space-between" align="start" mb="12px">
                      <Box minW="0" flex="1">
                        {/* Org handle */}
                        <Text
                          fontSize="11px"
                          fontFamily="var(--f-mono)"
                          color="var(--subtle)"
                          fontWeight="600"
                          letterSpacing="0.04em"
                          mb="2px"
                        >
                          opencodeiiita /
                        </Text>
                        {/* Repo Name */}
                        <Text
                          fontSize="19px"
                          fontWeight="800"
                          color={textColor}
                          wordBreak="break-word"
                          lineHeight="1.2"
                          className="group-hover:text-[var(--accent)] transition-colors"
                        >
                          {repo.name}
                        </Text>
                      </Box>

                      {/* GitHub direct link button */}
                      <a
                        href={repo.githubLink || `https://github.com/opencodeiiita/${repo.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${repo.name} on GitHub`}
                        className="p-2 rounded-xl bg-[var(--card-soft)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)] hover:border-[var(--accent)] transition-all ml-2"
                      >
                        <FaGithub size={16} />
                      </a>
                    </Flex>

                    {/* Developer Meta: Language Dot */}
                    <Flex align="center" gap="10px" mb="14px" flexWrap="wrap">
                      <Flex
                        align="center"
                        gap="6px"
                        px="2.5"
                        py="1"
                        borderRadius="md"
                        bg="var(--surface-2)"
                        border="1px solid var(--border)"
                        fontSize="11px"
                        fontFamily="var(--f-mono)"
                        color="var(--fg)"
                        fontWeight="600"
                      >
                        <Box w="7px" h="7px" borderRadius="full" bg={lang.color} />
                        <span>{lang.name}</span>
                      </Flex>
                    </Flex>

                    {/* Project Description */}
                    <Text
                      color={mutedText}
                      fontSize="13px"
                      mb="18px"
                      lineHeight="1.65"
                      noOfLines={3}
                    >
                      {repo.description}
                    </Text>

                    {/* Tech Stack Pills */}
                    <Flex flexWrap="wrap" gap="6px" mb="20px">
                      {repo.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--card-soft)] border border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)] transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </Flex>
                  </div>

                  {/* Footer: Maintainers & Community Discord Action */}
                  <Box pt="14px" borderTop="1px solid var(--line)">
                    <Flex justify="space-between" align="center" gap="10px">
                      {/* Maintainers Avatars */}
                      <Flex align="center" gap="6px">
                        <Text fontSize="11px" fontWeight="700" color="var(--subtle)" textTransform="uppercase" letterSpacing="0.05em">
                          Team:
                        </Text>
                        <AvatarGroup size="xs" max={3}>
                          {repo.maintainers?.map((m: any) => (
                            <Tooltip key={m.name} label={`Maintainer: @${m.name}`} placement="top">
                              <Avatar
                                name={m.name}
                                src={`https://github.com/${m.name}.png`}
                                border="1.5px solid var(--border)"
                              />
                            </Tooltip>
                          ))}
                        </AvatarGroup>
                      </Flex>

                      {/* Community Discord Link */}
                      <a
                        href="https://discord.com/channels/885149696249708635/885151791329722448"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:text-[var(--fg)] transition-colors"
                      >
                        <FaDiscord size={14} className="text-[#5865F2]" />
                        <span>Discord</span>
                        <ExternalLink size={11} className="opacity-70" />
                      </a>
                    </Flex>

                    {/* Quick Action Button */}
                    <a
                      href={repo.githubLink || `https://github.com/opencodeiiita/${repo.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3.5 w-full py-2 px-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 bg-[var(--accent-soft)] text-[var(--fg)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)] hover:border-[var(--accent)] transition-all"
                    >
                      <GitBranch size={13} />
                      <span>Browse Code & Issues</span>
                    </a>
                  </Box>
                </Box>
              </AnimatedContent>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}
