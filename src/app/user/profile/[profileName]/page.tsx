'use client';

import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
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
import DiscordBanner from 'views/admin/profile/components/DiscordBanner';
import EditProfileModal from 'views/admin/profile/components/EditProfileModal';
import General from 'views/admin/profile/components/General';
import Projects from 'views/admin/profile/components/Projects';
import { getRoleTags, RoleBadgesGroup } from 'views/admin/profile/components/RoleBadge';
import { ProfileData } from '../page';
import { opencodeTokens } from '../../../../theme/opencode-tokens';
import PageHeading from 'components/japanese/PageHeading';
import { getEligibleBadges, BadgeDefinition } from 'constants/badges';
import { Icon } from '@chakra-ui/react';

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

  const profile = data?.data;

  const isOwnProfile = true; // FORCED TRUE FOR LOCAL UI TESTING

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

  const pageBg = 'transparent';
  const cardBg = opencodeTokens.colors.background.glassDark;
  const muted = opencodeTokens.colors.text.secondary;

  const shadowHero = opencodeTokens.shadows.glass;
  const shadowSoft = opencodeTokens.shadows.glass;

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={pageBg}>
        <RingLoader color={opencodeTokens.colors.accent.sakura} size={52} />
      </Flex>
    );
  }

  return (
    <Box
      minH="100vh"
      bg={pageBg}
      pt="0"
      px="0"
      pb="40px"
      maxW="1400px"
      mx="auto"
    >

    

      <PageHeading eyebrow="THE PEOPLE BEHIND THE PROGRESS" title="Contributor profile" description="A story of curiosity, collaboration, and contributions. Get to know the person behind the pull requests." />

      {/* 2. Use the Component here */}
      <DiscordBanner />

      {!isDesktop && (
        <>
          <Box
            className="glass-panel"
            borderRadius="22px"
            p="18px"
            boxShadow={shadowHero}
            mb="22px"
          >
            <Flex direction="column" align="center">
              <Avatar src={profile?.avatarUrl || `https://github.com/${profile?.githubId || profileName}.png`} size="xl" mb="10px" />

              <Text fontSize="20px" fontWeight="800">
                {profile?.name || profileName}
              </Text>
              <Text fontSize="13px" color={muted}>
                @{profile?.githubId || profileName}
              </Text>

              {roleTags.length > 0 && (
                <RoleBadgesGroup tags={roleTags} mt="10px" />
              )}

              {isOwnProfile && (
                <Button
                  leftIcon={<Pencil size={14} />}
                  size="sm"
                  colorScheme="purple"
                  variant="outline"
                  borderRadius="12px"
                  mt="12px"
                  onClick={onOpen}
                >
                  Edit Profile
                </Button>
              )}

              <Flex gap="12px" mt="16px">
                <StatPill label="PRs Merged" value={profile?.prMerged ?? 0} />
                <StatPill label="Points" value={profile?.points ?? 0} />
              </Flex>
            </Flex>
          </Box>

          <Box
            className="glass-panel"
            borderRadius="20px"
            p="16px"
            boxShadow={shadowSoft}
            mb="22px"
          >
            <Text fontWeight="800" mb="14px" color={opencodeTokens.colors.text.primary}>
              General Information
            </Text>

            <Grid templateColumns="1fr" gap="12px">
              <Info label="College" value={profile?.college} />
              {roleLabel && (
                <Info label="Role & Affiliation" value={roleLabel} />
              )}
              <Info label="Email" value={profile?.email} />
              <Info label="Discord ID" value={profile?.discordId} />
              <Info label="GitHub" value={`@${profile?.githubId || profileName}`} />
              <Info
                label="Gender"
                value={
                  profile?.gender?.toLowerCase() === 'male'
                    ? 'Male'
                    : profile?.gender?.toLowerCase() === 'female'
                      ? 'Female'
                      : profile?.gender?.toLowerCase() === 'other'
                        ? 'Other'
                        : profile?.gender
                }
              />
              <Info label="Year" value={profile?.year} />
            </Grid>
          </Box>

          {getEligibleBadges(profile?.prMerged || 0, profile?.PR).length > 0 && (
            <Box className="glass-panel" borderRadius="20px" p="16px" boxShadow={shadowSoft} mb="22px">
              <Text fontWeight="800" mb="14px" color={opencodeTokens.colors.text.primary}>
                Badges
              </Text>
              <Grid templateColumns="1fr" gap="12px">
                {getEligibleBadges(profile?.prMerged || 0, profile?.PR).map((badge, idx) => (
                  <BadgeCard key={idx} badge={badge} />
                ))}
              </Grid>
            </Box>
          )}

          <Box className="glass-panel" borderRadius="20px" p="16px" boxShadow={shadowSoft}>
            <Projects PRs={profile?.PR || []} />
          </Box>
        </>
      )}

      {isDesktop && (
        <>
          <Grid templateColumns="1.3fr 1fr" gap="24px" mb="24px">
            <Box
              className="glass-panel"
              borderRadius="20px"
              p="24px"
              boxShadow={shadowHero}
            >
              <Banner
                banner={profile?.avatarUrl}
                avatar={profile?.avatarUrl || `https://github.com/${profile?.githubId || profileName}.png`}
                name={profile?.name || profileName}
                githubUrl={profile?.githubId || profileName}
                prMerged={profile?.prMerged || 0}
                prContributed={profile?.PR?.length || 0}
                pointsEarned={profile?.points || 0}
                tags={roleTags}
                showEdit={isOwnProfile}
                onEdit={onOpen}
              />
            </Box>

            <Box
              className="glass-panel"
              borderRadius="20px"
              p="24px"
              boxShadow={shadowSoft}
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

          {getEligibleBadges(profile?.prMerged || 0, profile?.PR).length > 0 && (
            <Box className="glass-panel" borderRadius="20px" p="24px" boxShadow={shadowSoft} mb="24px">
              <Text fontSize="18px" fontWeight="800" mb="16px" color={opencodeTokens.colors.text.primary}>
                Unlocked Badges
              </Text>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap="16px">
                {getEligibleBadges(profile?.prMerged || 0, profile?.PR).map((badge, idx) => (
                  <BadgeCard key={idx} badge={badge} />
                ))}
              </Grid>
            </Box>
          )}

          <Box className="glass-panel" borderRadius="20px" p="24px" boxShadow={shadowSoft}>
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

function StatPill({ label, value }: { label: string; value: number }) {
  const bg = opencodeTokens.colors.background.glassDark;
  const borderColor = opencodeTokens.colors.border.light;
  const valueColor = opencodeTokens.colors.accent.sakura;
  const labelColor = opencodeTokens.colors.text.secondary;

  return (
    <Box
      px="16px"
      py="10px"
      borderRadius="16px"
      minW="110px"
      textAlign="center"
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-2px)',
        borderColor: opencodeTokens.colors.accent.sakura,
        boxShadow: `0 6px 14px ${opencodeTokens.colors.accent.sakura}40`,
      }}
    >
      <Text fontSize="18px" fontWeight="900" lineHeight="1" color={valueColor}>
        {value}
      </Text>
      <Text fontSize="11px" mt="4px" color={labelColor}>
        {label}
      </Text>
    </Box>
  );
}



function Info({ label, value }: { label: string; value?: string }) {
  const bg = opencodeTokens.colors.background.glassDark;
  const borderColor = opencodeTokens.colors.border.light;
  const labelColor = opencodeTokens.colors.text.secondary;
  const valueColor = opencodeTokens.colors.text.primary;

  return (
    <Box
      borderRadius="12px"
      p="12px"
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      transition="all 0.3s ease"
      _hover={{
        borderColor: opencodeTokens.colors.accent.sakura,
        bg: opencodeTokens.colors.background.glassLight,
      }}
    >
      <Text
        fontSize="10px"
        fontWeight="700"
        color={labelColor}
        mb="4px"
        textTransform="uppercase"
        letterSpacing="0.6px"
      >
        {label}
      </Text>
      <Text
        fontSize="14px"
        fontWeight="600"
        color={valueColor}
        noOfLines={2}
      >
        {value || '—'}
      </Text>
    </Box>
  );
}

function BadgeCard({ badge }: { badge: BadgeDefinition }) {
  const bg = opencodeTokens.colors.background.glassDark;
  const borderColor = opencodeTokens.colors.border.light;
  const textColor = opencodeTokens.colors.text.primary;
  const descColor = opencodeTokens.colors.text.secondary;

  return (
    <Flex
      direction="row"
      align="center"
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="12px"
      p="12px"
      gap="16px"
      transition="all 0.3s ease"
      _hover={{
        borderColor: opencodeTokens.colors.accent.sakura,
        transform: 'translateY(-2px)'
      }}
    >
      <Flex
        align="center"
        justify="center"
        w="44px"
        h="44px"
        borderRadius="full"
        bg={`${badge.color}.900`}
        color={`${badge.color}.300`}
        border="1px solid"
        borderColor={`${badge.color}.600`}
        boxShadow={`0 0 10px var(--chakra-colors-${badge.color}-800)`}
      >
        <Icon as={badge.icon} boxSize={5} />
      </Flex>
      <Box>
        <Text fontSize="15px" fontWeight="800" color={textColor}>
          {badge.title}
        </Text>
        <Text fontSize="13px" color={descColor} mt="2px">
          {badge.description}
        </Text>
      </Box>
    </Flex>
  );
}

