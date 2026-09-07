'use client';

import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  Text,
  useBreakpointValue,
  useColorModeValue,
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
  console.log(profile);

  const isOwnProfile = Boolean(
    loggedInGithubId &&
      (loggedInGithubId.toLowerCase() === String(profileName || '').toLowerCase() ||
        loggedInGithubId.toLowerCase() ===
          String(profile?.githubId || '').toLowerCase()),
  );

  const handleSaveProfile = async (updated: {
    name: string;
    college: string;
    discordId: string;
    gender: string;
    year: string;
  }) => {
    await updateUserProfile(updated);
    await queryClient.invalidateQueries({ queryKey: ['profileInfo', profileName] });
  };

  const roleTags = getRoleTags(profile, profileName);
  const roleLabel = roleTags.map((t) => t.label).join(' • ');

  const isDesktop = useBreakpointValue({ base: false, lg: true });

  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const muted = useColorModeValue('gray.500', 'gray.400');

  const shadowHero = useColorModeValue(
    '0 18px 40px rgba(0,0,0,0.12)',
    '0 18px 40px rgba(0,0,0,0.45)',
  );
  const shadowSoft = useColorModeValue(
    '0 10px 24px rgba(0,0,0,0.08)',
    '0 10px 24px rgba(0,0,0,0.35)',
  );

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={pageBg}>
        <RingLoader color="#755FFF" size={52} />
      </Flex>
    );
  }

  return (
    <Box
      minH="100vh"
      bg={pageBg}
      pt={{ base: '62px', md: '74px' }}
      px={{ base: '14px', md: '28px' }}
      pb="40px"
      maxW="1400px"
      mx="auto"
    >

    

      {/* 2. Use the Component here */}
      <DiscordBanner />

      {!isDesktop && (
        <>
          <Box
            bg={cardBg}
            borderRadius="22px"
            p="18px"
            boxShadow={shadowHero}
            mb="22px"
          >
            <Flex direction="column" align="center">
              <Avatar src={profile?.avatarUrl} size="xl" mb="10px" />

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
            bg={cardBg}
            borderRadius="20px"
            p="16px"
            boxShadow={shadowSoft}
            mb="22px"
          >
            <Text fontWeight="800" mb="14px">
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

          <Box bg={cardBg} borderRadius="20px" p="16px" boxShadow={shadowSoft}>
            <Projects PRs={profile?.PR || []} />
          </Box>
        </>
      )}

      {isDesktop && (
        <>
          <Grid templateColumns="1.3fr 1fr" gap="24px" mb="24px">
            <Box
              bg={cardBg}
              borderRadius="20px"
              p="24px"
              boxShadow={shadowHero}
            >
              <Banner
                banner={profile?.avatarUrl}
                avatar={profile?.avatarUrl}
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
              bg={cardBg}
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

          <Box bg={cardBg} borderRadius="20px" p="24px" boxShadow={shadowSoft}>
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
  const bg = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const valueColor = useColorModeValue('purple.600', 'white');
  const labelColor = useColorModeValue('gray.600', 'gray.400');

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
      transition="all 0.2s ease"
      _hover={{
        transform: 'translateY(-1px)',
        borderColor: 'purple.300',
        boxShadow: '0 6px 14px rgba(0,0,0,0.08)',
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
  const bg = useColorModeValue('gray.50', 'transparent');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const valueColor = useColorModeValue('gray.800', 'white');

  return (
    <Box
      borderRadius="12px"
      p="12px"
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      transition="all 0.2s ease"
      _hover={{
        borderColor: 'purple.300',
        bg: useColorModeValue('white', 'transparent'),
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

