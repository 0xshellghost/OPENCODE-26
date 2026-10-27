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
import SpotlightCard from 'components/reactbits/SpotlightCard';
import PageHeading from 'components/japanese/PageHeading';

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

function getRepoMentors(repo: any): string[] {
  if (Array.isArray(repo.mentors) && repo.mentors.length > 0) {
    return repo.mentors.filter(Boolean);
  }
  if (Array.isArray(repo.maintainers) && repo.maintainers.length > 0) {
    return repo.maintainers.map((m: any) => (typeof m === 'string' ? m : m.name)).filter(Boolean);
  }
  return [];
}


function getRepoDomains(repo: any): string[] {
  // Domain tags strictly from the database
  if (Array.isArray(repo.tags) && repo.tags.length > 0) {
    const list = [...repo.tags];
    if (repo.isFirstYrOnly && !list.includes('Freshers only')) {
      list.push('Freshers only');
    }
    return list;
  }
  if (repo.isFirstYrOnly) {
    return ['Freshers only'];
  }
  return [];
}

function detectPrimaryLanguage(repo: any): { name: string; color: string } {
  // 1. Prioritize language stored in DB or GitHub API
  if (repo.language && LANGUAGE_COLORS[repo.language]) {
    return { name: repo.language, color: LANGUAGE_COLORS[repo.language] };
  }
  const tags = repo.tags || [];
  for (const tag of tags) {
    if (LANGUAGE_COLORS[tag]) {
      return { name: tag, color: LANGUAGE_COLORS[tag] };
    }
  }
  const name = repo.name?.toLowerCase() || '';
  const desc = repo.description?.toLowerCase() || '';
  const text = `${name} ${desc}`;

  if (text.includes('rust')) return { name: 'Rust', color: '#dea584' };
  if (name.includes('gogit') || text.includes('golang') || text.includes('written in go'))
    return { name: 'Go', color: '#00ADD8' };
  if (text.includes('python') || text.includes('vision') || text.includes('planet') || text.includes('django') || text.includes('flask'))
    return { name: 'Python', color: '#3572A5' };
  if (text.includes('dart') || text.includes('flutter') || name.includes('nommetric') || name.includes('appcosmos'))
    return { name: 'Dart', color: '#02569B' };
  if (text.includes('kotlin') || text.includes('compose') || name.includes('alum-x'))
    return { name: 'Kotlin', color: '#A97BFF' };
  if (text.includes('cp-') || text.includes('chronicles') || text.includes('c++'))
    return { name: 'C++', color: '#f34b7d' };
  if (text.includes('loktantra') || text.includes('eventchain') || text.includes('solidity'))
    return { name: 'Solidity', color: '#aa66cc' };
  return { name: 'TypeScript', color: '#3178c6' };
}

export default function ReposPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');

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

  // Dynamically compute domain filter options from repositories in DB
  const domainOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    repositories.forEach((repo: any) => {
      const domains = getRepoDomains(repo);
      domains.forEach((d: string) => {
        counts[d] = (counts[d] || 0) + 1;
      });
    });

    const standardOrder = [
      'WebD',
      'AppDev',
      'UI-UX',
      'AI-ML',
      'Blockchain',
      'GameDev',
      'Competitive Programming',
      'GitBasics',
      'Freshers only',
      'Cybersecurity',
    ];

    const sortedDomains = Object.keys(counts).sort((a, b) => {
      const idxA = standardOrder.indexOf(a);
      const idxB = standardOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return ['All', ...sortedDomains];
  }, [repositories]);

  const filteredRepos = useMemo(() => {
    return repositories.filter((repo: any) => {
      // 1. Domain Filter
      if (selectedDomain !== 'All') {
        const domains = getRepoDomains(repo);
        if (!domains.includes(selectedDomain)) {
          return false;
        }
      }

      // 2. Search Query Filter
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const matchSearch =
        (repo.name && repo.name.toLowerCase().includes(query)) ||
        (repo.description && repo.description.toLowerCase().includes(query)) ||
        (getRepoDomains(repo).some((d: string) => d.toLowerCase().includes(query))) ||
        (repo.tags && repo.tags.some((tag: string) => tag.toLowerCase().includes(query)));

      return matchSearch;
    });
  }, [repositories, searchQuery, selectedDomain]);

  if (isLoading || isLoadingEvents) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <RingLoader color="var(--accent)" />
      </Flex>
    );
  }

  return (
    <Box pt="0" px="0" maxW="1400px" mx="auto">
      <PageHeading
        eyebrow="THE PROJECTS WE BUILD TOGETHER"
        title="Open Source Repositories"
        description="Explore our community projects — browse code, find issues, and start contributing."
      />

      {/* Search Toolbar & Domain Filter Bar */}
      <Box mb={{ base: '24px', md: '32px' }}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'stretch', md: 'center' }}
          justify="space-between"
          gap="16px"
          mb="16px"
        >
          <SearchProfileBanner
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search repository, tech stack, or domain…"
            w={{ base: '100%', sm: '320px', md: '360px' }}
          />

          <Text
            fontSize="12px"
            fontFamily="var(--f-mono)"
            color="var(--muted)"
            display={{ base: 'none', md: 'block' }}
          >
            Showing {filteredRepos.length} of {repositories.length} repositories
          </Text>
        </Flex>

        {/* Domain Filter Pills matching exact mockup design */}
        <Flex
          align="center"
          gap="8px"
          overflowX="auto"
          maxW="100%"
          py="4px"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {domainOptions.map((domain) => {
            const isSelected = selectedDomain === domain;
            const count = domain === 'All'
              ? repositories.length
              : repositories.filter((r: any) => getRepoDomains(r).includes(domain)).length;

            return (
              <button
                key={domain}
                type="button"
                onClick={() => setSelectedDomain(domain)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-mono font-medium transition-all duration-200 cursor-pointer whitespace-nowrap select-none flex items-center ${
                  isSelected
                    ? 'bg-[#49dec6] text-[#09111e] font-bold shadow-[0_0_14px_rgba(73,222,198,0.35)]'
                    : 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)] hover:border-[#49dec6]/60 hover:text-[var(--fg)]'
                }`}
              >
                {domain === 'All' ? `All  (${count})` : domain}
              </button>
            );
          })}
        </Flex>
      </Box>

      {/* Empty State */}
      {filteredRepos.length === 0 ? (
        <div className="glass-panel oc-empty">
          <FolderGit2 size={36} />
          <h2>No repositories found</h2>
          <p>
            {selectedDomain !== 'All'
              ? `No repositories found in domain "${selectedDomain}"${searchQuery ? ` matching "${searchQuery}"` : ''}. Try selecting another filter or clearing your search.`
              : `We couldn't find any repositories matching your search. Try adjusting your keyword.`}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedDomain('All');
            }}
            className="oc-button oc-button-secondary mt-2"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="24px" mb="40px">
          {filteredRepos.map((repo: any, idx: number) => {
            const lang = detectPrimaryLanguage(repo);
            const repoDomains = getRepoDomains(repo);
            const description = repo.description || 'Open source project under OpenCode.';
            const mentors = getRepoMentors(repo);

            return (
              <AnimatedContent key={repo.name || idx} delay={idx * 0.03}>
                <SpotlightCard
                  className="group flex flex-col justify-between h-full p-[22px] rounded-[20px] border border-[var(--border)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[var(--shadow),0_0_20px_var(--accent-soft)]"
                  spotlightColor="rgba(88, 185, 154, 0.12)"
                  style={{
                    background: 'var(--surface)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: 'var(--shadow)',
                  }}
                >
                  <div>
                    <Flex justify="space-between" align="start" mb="12px">
                      <Box minW="0" flex="1">
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

                    {/* Tags */}
                    <Flex align="center" gap="8px" mb="14px" flexWrap="wrap">
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

                      {repoDomains.map((d: string) => (
                        <span
                          key={d}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold tracking-wide border ${
                            d === 'Freshers only'
                              ? 'bg-[#49dec6]/15 text-[#0d9488] dark:text-[#49dec6] border-[#49dec6]/30'
                              : 'bg-[var(--card-soft)] text-[var(--muted)] border-[var(--border)]'
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </Flex>

                    {/* Project Description */}
                    <Text
                      color={mutedText}
                      fontSize="13px"
                      mb="20px"
                      lineHeight="1.65"
                      noOfLines={3}
                    >
                      {description}
                    </Text>
                  </div>

                  {/* Card footer */}
                  <Box pt="14px" borderTop="1px solid var(--line)">
                    <Flex justify="space-between" align="center" gap="10px">
                      <Flex align="center" gap="8px">
                        <Text fontSize="11px" fontWeight="700" color="var(--subtle)" textTransform="uppercase" letterSpacing="0.05em">
                          Team:
                        </Text>
                        {mentors.length > 0 ? (
                          <AvatarGroup size="xs" max={4} spacing="-8px">
                            {mentors.map((rawHandle: string) => {
                              const handle = typeof rawHandle === 'string' ? rawHandle.replace(/^@/, '').trim() : '';
                              if (!handle) return null;
                              return (
                                <Tooltip key={handle} label={`Mentor: @${handle}`} placement="top" hasArrow>
                                  <Avatar
                                    name={handle}
                                    src={`https://github.com/${handle}.png`}
                                    border="1.5px solid var(--border)"
                                    w="24px"
                                    h="24px"
                                    cursor="pointer"
                                    transition="transform 0.15s ease"
                                    _hover={{ transform: 'scale(1.15)', zIndex: 10 }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      window.open(`https://github.com/${handle}`, '_blank');
                                    }}
                                  />
                                </Tooltip>
                              );
                            })}
                          </AvatarGroup>
                        ) : (
                          <Text fontSize="11px" color="var(--muted)" fontStyle="italic">
                            Open for mentors
                          </Text>
                        )}
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
                </SpotlightCard>
              </AnimatedContent>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}
