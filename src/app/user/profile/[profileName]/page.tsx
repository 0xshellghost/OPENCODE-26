'use client';

import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  Text,
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
import AnimatedContent from 'components/reactbits/AnimatedContent';
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

  // Panel styling matching the Kyoto cherry blossom & dusk plum theme
  const glassPanel = {
    bg: "var(--surface)",
    backdropFilter: "blur(24px)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
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

      {/* Row 1: 3-column responsive grid */}
      <AnimatedContent distance={20} duration={0.5} delay={0.1}>
        <Grid
          templateColumns={{ base: '1fr', lg: '1fr 1.15fr 1.45fr' }}
          gap="20px"
          mb="20px"
        >
          {/* User Identity */}
          <Box
            {...glassPanel}
            borderRadius="22px"
            p={{ base: '20px', md: '24px' }}
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
            p={{ base: '20px', md: '24px' }}
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
            p={{ base: '20px', md: '24px' }}
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
      </AnimatedContent>

      {/* Badges Row (if any) */}
      {getEligibleBadges(profile?.prMerged || 0, profile?.PR).length > 0 && (
        <Box {...glassPanel} borderRadius="22px" p={{ base: '20px', md: '24px' }} mb="20px">
          <Flex justify="space-between" align="center" mb="16px">
            <Text fontSize="18px" fontWeight="800" color="var(--fg)">
              Unlocked Badges
            </Text>
            <Text fontSize="12px" color="var(--muted)" fontFamily="var(--f-mono)">
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
        p={{ base: '20px', md: '24px' }}
      >
        <Projects PRs={profile?.PR || []} />
      </Box>

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
      bg="var(--card-soft)"
      border="1px solid var(--border)"
      borderRadius="16px"
      p="14px"
      gap="16px"
      transition="all 0.3s ease"
      _hover={{
        borderColor: 'var(--accent)',
        transform: 'translateY(-2px)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <Flex
        align="center"
        justify="center"
        w="46px"
        h="46px"
        borderRadius="full"
        bg="var(--accent-soft)"
        color="var(--accent)"
        border="1px solid var(--border-strong)"
        boxShadow="var(--shadow)"
      >
        <Icon as={badge.icon} boxSize={5} />
      </Flex>
      <Box>
        <Text fontSize="15px" fontWeight="800" color="var(--fg)">
          {badge.title}
        </Text>
        <Text fontSize="13px" color="var(--muted)" mt="2px">
          {badge.description}
        </Text>
      </Box>
    </Flex>
  );
}
