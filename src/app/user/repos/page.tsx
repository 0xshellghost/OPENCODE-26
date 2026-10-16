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
  Code2,
  GitBranch,
  Star,
  Sparkles,
  Terminal,
  Cpu,
  Smartphone,
  Globe,
  Search,
  Filter,
} from 'lucide-react';
import PageHeading from 'components/japanese/PageHeading';
import { opencodeTokens } from '../../../theme/opencode-tokens';
import { useState, useMemo } from 'react';
import { FetchedRepos, FetchedEvents } from 'api/events/events';
import { useQuery } from '@tanstack/react-query';
import { RingLoader } from 'react-spinners';
import CountUp from 'components/reactbits/CountUp';
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

function getDifficultyBadge(idx: number): { label: string; color: string; border: string; bg: string } {
  const cycle = idx % 4;
  if (cycle === 0) {
    return {
      label: '★ Good First Issues',
      color: '#45c07f',
      border: 'rgba(69, 192, 127, 0.35)',
      bg: 'rgba(69, 192, 127, 0.12)',
    };
  }
  if (cycle === 1) {
    return {
      label: '⚡ Active Architecture',
      color: '#63B3ED',
      border: 'rgba(99, 179, 237, 0.35)',
      bg: 'rgba(99, 179, 237, 0.12)',
    };
  }
  if (cycle === 2) {
    return {
      label: '❖ Production App',
      color: '#f0a8b8',
      border: 'rgba(240, 168, 184, 0.35)',
      bg: 'rgba(240, 168, 184, 0.12)',
    };
  }
  return {
    label: '✦ High Impact',
    color: '#f5c542',
    border: 'rgba(245, 197, 66, 0.35)',
    bg: 'rgba(245, 197, 66, 0.12)',
  };
}

export default function ReposPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'web' | 'mobile' | 'ai' | 'systems'>('all');

  const textColor = '#fff1ec';
  const mutedText = '#dfced5';

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

  const filterChips = [
    { id: 'all', label: 'All Projects', icon: FolderGit2 },
    { id: 'web', label: 'Web & Fullstack', icon: Globe },
    { id: 'mobile', label: 'Mobile Apps', icon: Smartphone },
    { id: 'ai', label: 'AI & Data', icon: Sparkles },
    { id: 'systems', label: 'Systems & Security', icon: Cpu },
  ];

  const filteredRepos = useMemo(() => {
    return repositories.filter((repo: any) => {
      const matchSearch =
        (repo.name && repo.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (repo.tags && repo.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())));

      if (!matchSearch) return false;

      const tagsStr = (repo.tags || []).join(' ').toLowerCase();
      const descStr = (repo.description || '').toLowerCase();
      const combined = `${tagsStr} ${descStr} ${repo.name.toLowerCase()}`;

      if (activeFilter === 'web') {
        return combined.includes('react') || combined.includes('next') || combined.includes('web') || combined.includes('node');
      }
      if (activeFilter === 'mobile') {
        return combined.includes('mobile') || combined.includes('flutter') || combined.includes('native') || combined.includes('kotlin') || combined.includes('android');
      }
      if (activeFilter === 'ai') {
        return combined.includes('python') || combined.includes('ai') || combined.includes('ml') || combined.includes('vision') || combined.includes('astronomy');
      }
      if (activeFilter === 'systems') {
        return combined.includes('rust') || combined.includes('go') || combined.includes('security') || combined.includes('c++') || combined.includes('solidity');
      }

      return true;
    });
  }, [repositories, searchQuery, activeFilter]);

  if (isLoading || isLoadingEvents) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <RingLoader color="#f0a8b8" />
      </Flex>
    );
  }

  return (
    <Box pt="0" px="0" maxW="1400px" mx="auto">
      {/* Page Heading */}
      <Flex direction="column" mb={{ base: '24px', md: '36px' }}>
        <PageHeading
          eyebrow="IDEAS INTO IMPACT"
          title="Built in the open."
          description="Explore this season’s open-source codebases. Find a project that matches your language of choice, connect with maintainers, and make verified contributions."
        />

        {/* Developer Toolbar: Category Pills + Search */}
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          justify="space-between"
          align={{ base: 'stretch', lg: 'center' }}
          gap="16px"
          mt="12px"
        >
          {/* Filter Pills */}
          <Flex wrap="wrap" gap="8px" align="center">
            {filterChips.map((chip) => {
              const IconComp = chip.icon;
              const isActive = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setActiveFilter(chip.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-[#f0a8b8] text-[#1b1420] shadow-[0_4px_16px_rgba(240,168,184,0.35)]'
                      : 'bg-[rgba(32,20,38,0.7)] text-[#dfced5] border border-[rgba(240,168,184,0.2)] hover:border-[#f0a8b8] hover:text-[#fff1ec]'
                  }`}
                >
                  <IconComp size={13} />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </Flex>

          {/* Search Box */}
          <Box position="relative" minW={{ base: '100%', md: '320px' }}>
            <Flex
              align="center"
              gap="10px"
              px="16px"
              py="10px"
              borderRadius="full"
              bg="rgba(32, 20, 38, 0.75)"
              border="1px solid rgba(240, 168, 184, 0.25)"
              _focusWithin={{ borderColor: '#f0a8b8', boxShadow: '0 0 16px rgba(240,168,184,0.25)' }}
              transition="all 0.25s ease"
            >
              <Search size={15} color="#f0a8b8" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search repository or tech stack…"
                style={{
                  background: 'transparent',
                  outline: 'none',
                  border: 'none',
                  color: '#fff1ec',
                  fontSize: '13px',
                  width: '100%',
                }}
              />
            </Flex>
          </Box>
        </Flex>

        {/* Result Counter */}
        <Flex justify="space-between" align="center" mt="16px" fontSize="12px" fontFamily="var(--f-mono)" color={mutedText}>
          <Text>
            Displaying{' '}
            <Text as="span" color="#f0a8b8" fontWeight="800">
              <CountUp to={filteredRepos.length} duration={0.8} />
            </Text>{' '}
            open-source repositories
          </Text>
          {activeFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="text-[#f0a8b8] hover:underline cursor-pointer"
            >
              Show all ({repositories.length})
            </button>
          )}
        </Flex>
      </Flex>

      {/* Empty State */}
      {filteredRepos.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py="70px"
          borderRadius="24px"
          bg="rgba(32, 20, 38, 0.6)"
          border="1px solid rgba(240, 168, 184, 0.2)"
        >
          <Icon as={FolderGit2} color="#f0a8b8" mb="16px" w="42px" h="42px" />
          <Text fontSize="xl" fontWeight="700" color={textColor}>
            No repositories matched your filters
          </Text>
          <Text color={mutedText} mt="8px" fontSize="14px">
            Try adjusting your search keyword or switching categories.
          </Text>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            className="mt-4 px-4 py-2 rounded-full text-xs font-bold bg-[rgba(240,168,184,0.15)] text-[#f0a8b8] border border-[rgba(240,168,184,0.3)] hover:bg-[#f0a8b8] hover:text-[#1b1420] transition-all"
          >
            Reset search & filters
          </button>
        </Flex>
      ) : (
        /* Human-Crafted Developer Repository Grid */
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="24px" mb="40px">
          {filteredRepos.map((repo: any, idx: number) => {
            const lang = detectPrimaryLanguage(repo);
            const difficulty = getDifficultyBadge(idx);

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
                  bg="linear-gradient(145deg, rgba(32, 19, 41, 0.88) 0%, rgba(45, 26, 56, 0.82) 100%)"
                  backdropFilter="blur(20px)"
                  border="1px solid rgba(240, 168, 184, 0.2)"
                  boxShadow="0 10px 28px rgba(0, 0, 0, 0.45)"
                  transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                  _hover={{
                    transform: 'translateY(-4px)',
                    borderColor: '#f0a8b8',
                    boxShadow: '0 16px 36px rgba(0, 0, 0, 0.55), 0 0 20px rgba(240, 168, 184, 0.2)',
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
                          color="#a38e98"
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
                          className="group-hover:text-[#f0a8b8] transition-colors"
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
                        className="p-2 rounded-xl bg-[rgba(20,12,24,0.6)] border border-[rgba(240,168,184,0.2)] text-[#dfced5] hover:bg-[#f0a8b8] hover:text-[#1b1420] hover:border-[#f0a8b8] transition-all ml-2"
                      >
                        <FaGithub size={16} />
                      </a>
                    </Flex>

                    {/* Developer Meta: Language Dot + Difficulty Badge */}
                    <Flex align="center" gap="10px" mb="14px" flexWrap="wrap">
                      {/* Language Dot */}
                      <Flex align="center" gap="5px" fontSize="12px" fontFamily="var(--f-mono)" color="#fff1ec" fontWeight="700">
                        <Box w="8px" h="8px" borderRadius="full" bg={lang.color} boxShadow={`0 0 8px ${lang.color}88`} />
                        <span>{lang.name}</span>
                      </Flex>

                      {/* Difficulty Badge */}
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          color: difficulty.color,
                          backgroundColor: difficulty.bg,
                          border: `1px solid ${difficulty.border}`,
                        }}
                      >
                        {difficulty.label}
                      </span>
                    </Flex>

                    {/* Project Description */}
                    <Text
                      color={mutedText}
                      fontSize="13px"
                      mb="18px"
                      lineHeight="1.65"
                      opacity={0.88}
                      noOfLines={3}
                    >
                      {repo.description}
                    </Text>

                    {/* Tech Stack Pills */}
                    <Flex flexWrap="wrap" gap="6px" mb="20px">
                      {repo.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[rgba(20,12,25,0.55)] border border-[rgba(240,168,184,0.18)] text-[#dfced5] hover:border-[rgba(240,168,184,0.4)] transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </Flex>
                  </div>

                  {/* Footer: Maintainers & Community Discord Action */}
                  <Box pt="14px" borderTop="1px solid rgba(240, 168, 184, 0.14)">
                    <Flex justify="space-between" align="center" gap="10px">
                      {/* Maintainers Avatars */}
                      <Flex align="center" gap="6px">
                        <Text fontSize="11px" fontWeight="700" color="#a38e98" textTransform="uppercase" letterSpacing="0.05em">
                          Team:
                        </Text>
                        <AvatarGroup size="xs" max={3}>
                          {repo.maintainers?.map((m: any) => (
                            <Tooltip key={m.name} label={`Maintainer: @${m.name}`} placement="top">
                              <Avatar
                                name={m.name}
                                src={`https://github.com/${m.name}.png`}
                                border="1.5px solid #2a1832"
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
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#f0a8b8] hover:text-[#fff1ec] transition-colors"
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
                      className="mt-3.5 w-full py-2 px-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 bg-[rgba(240,168,184,0.1)] text-[#fff1ec] border border-[rgba(240,168,184,0.25)] hover:bg-[#f0a8b8] hover:text-[#1b1420] hover:border-[#f0a8b8] transition-all"
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
