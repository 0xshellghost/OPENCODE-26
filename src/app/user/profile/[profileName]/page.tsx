'use client';

import {
  Avatar,
  Badge,
  Box,
  Flex,
  Grid,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { RingLoader } from 'react-spinners';

import { getUserProfileByName } from 'api/profile/profile';
import Banner from 'views/admin/profile/components/Banner';
import DiscordBanner from 'views/admin/profile/components/DiscordBanner';
import General from 'views/admin/profile/components/General';
import Projects from 'views/admin/profile/components/Projects';
import { ProfileData } from '../page';

export default function ProfileOverviewOther() {
  const { profileName } = useParams<{ profileName: string }>();

  const { data, isLoading } = useQuery<{ data: ProfileData }>({
    queryKey: ['profileInfo', profileName],
    queryFn: () => getUserProfileByName(profileName),
    enabled: !!profileName,
  });

  const profile = data?.data;
  console.log(profile);

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
                {profile?.name}
              </Text>
              <Text fontSize="13px" color={muted}>
                @{profile?.githubId}
              </Text>

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
              <Info label="Email" value={profile?.email} />
              <Info label="Discord ID" value={profile?.discordId} />
              <Info label="GitHub" value={`@${profile?.githubId}`} />
              <Info
                label="Gender"
                value={profile?.gender == 'male' ? 'Male' : 'Female'}
              />
              <Info label="Year" value={profile?.year} />
            </Grid>
          </Box>

          {getBadges(profile?.prMerged || 0).length > 0 && (
            <Box bg={cardBg} borderRadius="20px" p="16px" boxShadow={shadowSoft} mb="22px">
              <Text fontWeight="800" mb="14px">
                Badges
              </Text>
              <Flex gap="8px" wrap="wrap">
                {getBadges(profile?.prMerged || 0).map((badge, idx) => (
                  <Badge key={idx} colorScheme={badge.color} px="10px" py="4px" borderRadius="8px" textTransform="capitalize">
                    {badge.label}
                  </Badge>
                ))}
              </Flex>
            </Box>
          )}

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
                name={profile?.name}
                githubUrl={profile?.githubId}
                prMerged={profile?.prMerged || 0}
                prContributed={profile?.PR?.length || 0}
                pointsEarned={profile?.points || 0}
              />
            </Box>

            <Box
              bg={cardBg}
              borderRadius="20px"
              p="24px"
              boxShadow={shadowSoft}
            >
              <General
                name={profile?.name}
                githubId={profile?.githubId}
                college={profile?.college}
                discordId={profile?.discordId}
                email={profile?.email}
                gender={profile?.gender}
                year={profile?.year}
              />
            </Box>
          </Grid>

          {getBadges(profile?.prMerged || 0).length > 0 && (
            <Box bg={cardBg} borderRadius="20px" p="24px" boxShadow={shadowSoft} mb="24px">
              <Text fontSize="18px" fontWeight="800" mb="16px">
                Unlocked Badges
              </Text>
              <Flex gap="12px" wrap="wrap">
                {getBadges(profile?.prMerged || 0).map((badge, idx) => (
                  <Badge key={idx} colorScheme={badge.color} px="12px" py="6px" borderRadius="10px" fontSize="14px" textTransform="capitalize">
                    {badge.label}
                  </Badge>
                ))}
              </Flex>
            </Box>
          )}

          <Box bg={cardBg} borderRadius="20px" p="24px" boxShadow={shadowSoft}>
            <Projects PRs={profile?.PR || []} />
          </Box>
        </>
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

function getBadges(prMerged: number) {
  const allBadges = [
    { threshold: 1, label: 'First PR Merge', color: 'blue' },
    { threshold: 10, label: '10 Merges', color: 'cyan' },
    { threshold: 50, label: '50 Merges', color: 'teal' },
    { threshold: 75, label: '75 Merges', color: 'green' },
    { threshold: 100, label: '100 Merges', color: 'yellow' },
    { threshold: 150, label: '150 Merges', color: 'orange' },
    { threshold: 175, label: '175 Merges', color: 'red' },
    { threshold: 200, label: '200 Merges', color: 'purple' },
  ];
  return allBadges.filter(b => prMerged >= b.threshold);
}
