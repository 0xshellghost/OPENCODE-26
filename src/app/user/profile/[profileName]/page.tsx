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
import { useEffect, useState, useMemo } from 'react';
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
import { isMaintainer } from 'constants/Maintainers';

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

  const eventName = process.env.NEXT_PUBLIC_EVENT_NAME || 'Opencode';
  const isOpencode = eventName.toLowerCase().includes('opencode');

  const { data, isLoading } = useQuery<{ data: ProfileData }>({
    queryKey: ['profileInfo', profileName],
    queryFn: () => getUserProfileByName(profileName),
    enabled: !!profileName,
  });

  const { data: leadData } = useQuery({
    queryKey: ['LeadInfo', eventName],
    queryFn: () => FetchedLeaderboard(eventName),
  });

  const profile = data?.data;

  // Determine if user is a maintainer or mentor (staff)
  const isStaffOrMentor = useMemo(() => {
    if (!profileName) return false;
    return (
      isMaintainer(profileName) ||
      Boolean(profile?.isMentor || profile?.isAdmin)
    );
  }, [profileName, profile?.isMentor, profile?.isAdmin]);

  // Derive rank & total eligible participants dynamically matching Leaderboard page
  const { resolvedRank, totalParticipants } = useMemo(() => {
    if (isStaffOrMentor) {
      const eligibleList = leadData
        ? isOpencode
          ? leadData.filter((item) => !item.isMentor && (!item.githubid || !isMaintainer(item.githubid)))
          : leadData
        : [];
      return { resolvedRank: null, totalParticipants: eligibleList.length };
    }

    if (!leadData || !Array.isArray(leadData) || leadData.length === 0) {
      const backendRank = typeof profile?.rank === 'number' && profile.rank > 0 ? profile.rank : null;
      return { resolvedRank: backendRank, totalParticipants: 0 };
    }

    const eligibleList = isOpencode
      ? leadData.filter((item) => !item.isMentor && (!item.githubid || !isMaintainer(item.githubid)))
      : leadData;

    const total = eligibleList.length;

    const userIndex = eligibleList.findIndex(
      (u) => u.githubid?.toLowerCase() === profileName?.toLowerCase()
    );

    if (userIndex !== -1) {
      return { resolvedRank: userIndex + 1, totalParticipants: total };
    }

    // If user has points > 0 and backend computed rank
    if (typeof profile?.rank === 'number' && profile.rank > 0 && (profile.points || 0) > 0) {
      return { resolvedRank: profile.rank, totalParticipants: total };
    }

    return { resolvedRank: null, totalParticipants: total };
  }, [leadData, isOpencode, profileName, profile?.rank, profile?.points, isStaffOrMentor]);

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
  const roleLabel = roleTags.map((t) => t.label).join(' • ') || 'Contributor';

  const earnedBadges = useMemo(() => {
    return getEligibleBadges(profile?.prMerged || 0, profile?.PR || []);
  }, [profile?.prMerged, profile?.PR]);

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

      {/* Main Profile Sections with Spacious, Balanced Layout */}
      <AnimatedContent distance={20} duration={0.5} delay={0.1}>
        {/* Row 1: User Identity (Hero Left) + Community Metrics (Spacious Right) */}
        <Grid
          templateColumns={{ base: '1fr', lg: '380px 1fr' }}
          gap={{ base: '20px', md: '24px' }}
          mb={{ base: '20px', md: '24px' }}
          alignItems="stretch"
        >
          {/* User Identity */}
          <Box
            {...glassPanel}
            borderRadius="24px"
            p={{ base: '22px', md: '28px 30px' }}
            display="flex"
            flexDirection="column"
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
            borderRadius="24px"
            p={{ base: '22px', md: '28px 30px' }}
            display="flex"
            flexDirection="column"
          >
            <CommunityMetrics
              prMerged={profile?.prMerged ?? 0}
              pointsEarned={profile?.points ?? 0}
              rank={resolvedRank}
              totalParticipants={totalParticipants}
              totalPRsSubmitted={profile?.totalPRs ?? profile?.PR?.length ?? profile?.prMerged ?? 0}
              isStaffOrMentor={isStaffOrMentor}
            />
          </Box>
        </Grid>

        {/* Row 2: General Information (Full Width, Spacious Multi-Column) */}
        <Box
          {...glassPanel}
          borderRadius="24px"
          p={{ base: '22px', md: '28px 32px' }}
          mb={{ base: '20px', md: '24px' }}
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
      </AnimatedContent>

      {/* Badges Row (if any) */}
      {earnedBadges.length > 0 && (
        <Box {...glassPanel} borderRadius="22px" p={{ base: '20px', md: '24px' }} mb="20px">
          <Flex justify="space-between" align="center" mb="16px">
            <Text fontSize="18px" fontWeight="800" color="var(--fg)">
              Unlocked Badges
            </Text>
            <Text fontSize="12px" color="var(--muted)" fontFamily="var(--f-mono)">
              {earnedBadges.length} Earned
            </Text>
          </Flex>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap="16px">
            {earnedBadges.map((badge, idx) => (
              <BadgeCard key={badge.id || idx} badge={badge} />
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
