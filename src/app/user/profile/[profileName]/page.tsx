'use client';

import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  Text,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchLoggedInBasicDetails, getUserProfileByName, updateUserProfile } from 'api/profile/profile';
import { Pencil } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RingLoader } from 'react-spinners';
import Banner from 'views/admin/profile/components/Banner';
import CommunityMetrics from 'views/admin/profile/components/CommunityMetrics';
import DiscordBanner from 'views/admin/profile/components/DiscordBanner';
import EditProfileModal from 'views/admin/profile/components/EditProfileModal';
import General from 'views/admin/profile/components/General';
import Projects from 'views/admin/profile/components/Projects';
import { getRoleTags, RoleBadgesGroup } from 'views/admin/profile/components/RoleBadge';
import { ProfileData } from '../page';
import { opencodeTokens } from '../../../../theme/opencode-tokens';
import PageHeading from 'components/japanese/PageHeading';
import { getEligibleBadges, BadgeDefinition } from 'constants/badges';
import { FetchedLeaderboard } from 'api/leaderboard/leaderboard';

export default function ProfileOverviewOther() {
  const { profileName } = useParams<{ profileName: string }>();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loggedInGithubId, setLoggedInGithubId] = useState<string | null>(null);

  useEffect(() => {
    const loadLoggedInUser = async () => {
      try {
        const cached = JSON.parse(localStorage.getItem('user') ?? '{}');
        if (cached?.githubId) {
          setLoggedInGithubId(cached.githubId);
        }
      } catch {
        // ignore
      }

      try {
        const fresh = await fetchLoggedInBasicDetails();
        if (fresh?.githubId) {
          setLoggedInGithubId(fresh.githubId);
        }
      } catch {
        // ignore
      }
    };

    loadLoggedInUser();
  }, []);

  const { data, isLoading } = useQuery<{ data: ProfileData }>({
    queryKey: ['profileInfo', profileName],
    queryFn: () => getUserProfileByName(profileName),
    enabled: !!profileName,
  });

  const { data: leadData } = useQuery({
    queryKey: ['LeadInfo'],
    queryFn: () => FetchedLeaderboard(process.env.NEXT_PUBLIC_EVENT_NAME || "OPENCODE'25"),
  });

  const profile = data?.data;

  const totalParticipants = leadData?.length || 50;
  const leaderboardUser = leadData?.find(
    (u) => u.githubid?.toLowerCase() === profileName?.toLowerCase()
  );
  const resolvedRank = profile?.rank || (leaderboardUser ? Number(leaderboardUser.position) : undefined);

  const isOwnProfile = loggedInGithubId != null && loggedInGithubId === profileName;

  const handleSaveProfile = async (updated: {
    name: string;
    college: string;
    discordId: string;
    gender: string;
    year: string;
  }) => {
    await updateUserProfile(updated);
    
    // Optimistically update the UI to instantly reflect the saved changes
    queryClient.setQueryData(['profileInfo', profileName], (old: any) => {
      if (!old || !old.data) return old;
      return {
        ...old,
        data: {
          ...old.data,
          ...updated,
        },
      };
    });

    await queryClient.invalidateQueries({ queryKey: ['profileInfo', profileName] });
  };

  const roleTags = getRoleTags(profile, profileName);
  const roleLabel = roleTags.map((t) => t.label).join(' • ');

  const isDesktop = useBreakpointValue({ base: false, lg: true });

  // Panel styling matching the Kyoto cherry blossom & dusk plum theme
  const glassPanel = {
    bg: "linear-gradient(135deg, rgba(30, 18, 38, 0.85) 0%, rgba(42, 24, 50, 0.82) 100%)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(240, 168, 184, 0.22)",
    boxShadow: "0 18px 45px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(240, 168, 184, 0.08)",
  };

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="transparent">
        <RingLoader color={opencodeTokens.colors.accent.sakura} size={52} />
      </Flex>
    );
  }

  return (
    <Box
      minH="100vh"
      bg="transparent"
      pt="0"
      px="0"
      pb="40px"
      maxW="1400px"
      mx="auto"
    >

      <PageHeading
        eyebrow="THE PEOPLE BEHIND THE PROGRESS"
        title="Contributor Profile"
        description="Track your progress and community contributions"
      />

      {/* Discord Banner */}
      <DiscordBanner />

      {/* ─── MOBILE LAYOUT ─── */}
      {!isDesktop && (
        <>
          {/* User Identity Card */}
          <Box
            {...glassPanel}
            borderRadius="22px"
            p="24px"
            mb="20px"
          >
            <Flex direction="column" align="center">
              <Avatar
                src={profile?.avatarUrl || `https://github.com/${profile?.githubId || profileName}.png`}
                size="xl"
                border="3.5px solid rgba(240, 168, 184, 0.5)"
                boxShadow="0 0 24px rgba(240, 168, 184, 0.35), 0 8px 24px rgba(0, 0, 0, 0.55)"
                mb="14px"
              />
              <Text fontSize="22px" fontWeight="800" color="#fff1ec">
                {profile?.name || profileName}
              </Text>
              <Text fontSize="13px" color="#dfced5" opacity={0.85}>
                @{profile?.githubId || profileName}
              </Text>

              {roleTags.length > 0 && (
                <RoleBadgesGroup tags={roleTags} mt="10px" />
              )}

              {isOwnProfile && (
                <Button
                  leftIcon={<Pencil size={14} />}
                  size="sm"
                  w="100%"
                  maxW="260px"
                  bg="rgba(240, 168, 184, 0.12)"
                  color="#fff1ec"
                  border="1px solid rgba(240, 168, 184, 0.3)"
                  borderRadius="full"
                  fontWeight="700"
                  fontSize="13px"
                  py="18px"
                  mt="14px"
                  _hover={{
                    bg: 'rgba(240, 168, 184, 0.22)',
                    borderColor: '#f0a8b8',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(240, 168, 184, 0.25)',
                  }}
                  transition="all 0.3s ease"
                  onClick={onOpen}
                >
                  Edit Profile
                </Button>
              )}
            </Flex>
          </Box>

          {/* Community Metrics */}
          <Box
            {...glassPanel}
            borderRadius="20px"
            p="20px"
            mb="20px"
          >
            <CommunityMetrics
              prMerged={profile?.prMerged || 0}
              pointsEarned={profile?.points || 0}
              rank={resolvedRank}
              totalParticipants={totalParticipants}
              totalPRsSubmitted={profile?.PR?.length || profile?.prMerged || 0}
            />
          </Box>

          {/* General Information */}
          <Box
            {...glassPanel}
            borderRadius="20px"
            p="20px"
            mb="20px"
          >
            <General
              name={profile?.name || profileName}
              githubId={profile?.githubId || profileName}
              college={profile?.college}
              discordId={profile?.discordId}
              email={profile?.email}
              gender={profile?.gender}
              year={profile?.year}
              role={roleLabel}
            />
          </Box>

          {/* Badges */}
          {getEligibleBadges(profile?.prMerged || 0, profile?.PR).length > 0 && (
            <Box {...glassPanel} borderRadius="20px" p="20px" mb="20px">
              <Flex justify="space-between" align="center" mb="14px">
                <Text fontWeight="800" color="#fff1ec">
                  Unlocked Badges
                </Text>
                <Text fontSize="12px" color="#dfced5" opacity={0.8} fontFamily="var(--f-mono)">
                  {getEligibleBadges(profile?.prMerged || 0, profile?.PR).length} Earned
                </Text>
              </Flex>
              <Grid templateColumns="1fr" gap="12px">
                {getEligibleBadges(profile?.prMerged || 0, profile?.PR).map((badge, idx) => (
                  <BadgeCard key={idx} badge={badge} />
                ))}
              </Grid>
            </Box>
          )}

          {/* Recent Contributions */}
          <Box {...glassPanel} borderRadius="20px" p="20px">
            <Projects PRs={profile?.PR || []} />
          </Box>
        </>
      )}

      {/* ─── DESKTOP LAYOUT ─── */}
      {isDesktop && (
        <>
          {/* Row 1: 3-column grid */}
          <Grid
            templateColumns={{ base: '1fr', lg: '1fr 1.15fr 1.45fr' }}
            gap="20px"
            mb="20px"
          >
            {/* User Identity */}
            <Box
              {...glassPanel}
              borderRadius="22px"
              p="24px"
            >
              <Banner
                avatar={profile?.avatarUrl || `https://github.com/${profile?.githubId || profileName}.png`}
                name={profile?.name || profileName}
                githubUrl={profile?.githubId || profileName}
                tags={roleTags}
                showEdit={isOwnProfile}
                onEdit={onOpen}
              />
            </Box>

            {/* Community Metrics */}
            <Box
              {...glassPanel}
              borderRadius="22px"
              p="24px"
            >
              <CommunityMetrics
                prMerged={profile?.prMerged || 0}
                pointsEarned={profile?.points || 0}
                rank={resolvedRank}
                totalParticipants={totalParticipants}
                totalPRsSubmitted={profile?.PR?.length || profile?.prMerged || 0}
              />
            </Box>

            {/* General Information */}
            <Box
              {...glassPanel}
              borderRadius="22px"
              p="24px"
            >
              <General
                name={profile?.name || profileName}
                githubId={profile?.githubId || profileName}
                college={profile?.college}
                discordId={profile?.discordId}
                email={profile?.email}
                gender={profile?.gender}
                year={profile?.year}
                role={roleLabel}
              />
            </Box>
          </Grid>

          {/* Badges Row (if any) */}
          {getEligibleBadges(profile?.prMerged || 0, profile?.PR).length > 0 && (
            <Box {...glassPanel} borderRadius="22px" p="24px" mb="20px">
              <Flex justify="space-between" align="center" mb="16px">
                <Text fontSize="18px" fontWeight="800" color="#fff1ec">
                  Unlocked Badges
                </Text>
                <Text fontSize="12px" color="#dfced5" opacity={0.8} fontFamily="var(--f-mono)">
                  {getEligibleBadges(profile?.prMerged || 0, profile?.PR).length} Earned
                </Text>
              </Flex>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap="16px">
                {getEligibleBadges(profile?.prMerged || 0, profile?.PR).map((badge, idx) => (
                  <BadgeCard key={idx} badge={badge} />
                ))}
              </Grid>
            </Box>
          )}

          {/* Row 2: Recent Contributions - Full width */}
          <Box
            {...glassPanel}
            borderRadius="22px"
            p="24px"
          >
            <Projects PRs={profile?.PR || []} />
          </Box>
        </>
      )}

      {isOwnProfile && (
        <EditProfileModal
          isOpen={isOpen}
          onClose={onClose}
          profile={{
            name: profile?.name,
            githubId: profile?.githubId || profileName,
            email: profile?.email,
            college: profile?.college,
            discordId: profile?.discordId,
            gender: profile?.gender,
            year: profile?.year,
          }}
          onSave={handleSaveProfile}
        />
      )}
    </Box>
  );
}

function BadgeCard({ badge }: { badge: BadgeDefinition }) {
  return (
    <Flex
      direction="row"
      align="center"
      bg="rgba(240, 168, 184, 0.06)"
      border="1px solid rgba(240, 168, 184, 0.18)"
      borderRadius="16px"
      p="14px"
      gap="16px"
      transition="all 0.3s ease"
      _hover={{
        borderColor: '#f0a8b8',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
      }}
    >
      <Flex
        align="center"
        justify="center"
        w="46px"
        h="46px"
        borderRadius="full"
        bg="rgba(240, 168, 184, 0.15)"
        color="#f0a8b8"
        border="1px solid rgba(240, 168, 184, 0.35)"
        boxShadow="0 0 12px rgba(240, 168, 184, 0.25)"
      >
        <Icon as={badge.icon} boxSize={5} />
      </Flex>
      <Box>
        <Text fontSize="15px" fontWeight="800" color="#fff1ec">
          {badge.title}
        </Text>
        <Text fontSize="13px" color="#dfced5" opacity={0.8} mt="2px">
          {badge.description}
        </Text>
      </Box>
    </Flex>
  );
}
