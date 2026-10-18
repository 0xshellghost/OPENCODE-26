'use client';

import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Icon,
  Input,
  Select,
  Text,
  useColorModeValue,
  useToast,
  IconButton
} from '@chakra-ui/react';
import { Lock, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchColleges } from 'api/profile/profile';

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    name?: string;
    githubId?: string;
    email?: string;
    college?: string;
    discordId?: string;
    gender?: string;
    year?: string;
  };
  onSave: (updated: {
    name: string;
    college: string;
    discordId: string;
    gender: string;
    year: string;
  }) => Promise<void> | void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(profile?.name || '');
  const [discordId, setDiscordId] = useState(profile?.discordId || '');
  const [gender, setGender] = useState(profile?.gender || 'male');
  const [year, setYear] = useState(profile?.year || '1st Year');
  const [collegeType, setCollegeType] = useState('IIIT Allahabad');
  const [otherCollege, setOtherCollege] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();

  const { data: colleges = [] } = useQuery({
    queryKey: ['colleges'],
    queryFn: fetchColleges,
  });

  const modalBg = 'var(--card-strong)';
  const titleColor = 'var(--fg)';
  const labelColor = 'var(--muted)';
  const lockedBg = 'var(--card-soft)';
  const lockedBorder = 'var(--border)';
  const lockedText = 'var(--subtle)';
  const brandStars = 'var(--accent)';

  useEffect(() => {
    if (isOpen && profile) {
      setName(profile.name || '');
      setDiscordId(profile.discordId || '');

      const normalizedGender = (profile.gender || 'male').toLowerCase();
      setGender(
        ['male', 'female', 'other'].includes(normalizedGender)
          ? normalizedGender
          : 'male',
      );
      setYear(profile.year || '1st Year');

      const col = (profile.college || '').trim();
      const normalized = col.toLowerCase();
      const isIIITA =
        !col ||
        normalized === 'iiit allahabad' ||
        normalized === 'iiita' ||
        normalized === 'iiit-a';

      if (isIIITA) {
        setCollegeType('IIIT Allahabad');
        setOtherCollege('');
      } else {
        setCollegeType('Other');
        setOtherCollege(col);
      }
    }
  }, [isOpen, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Name is required',
        description: 'Please enter your name.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (collegeType === 'Other' && !otherCollege.trim()) {
      toast({
        title: 'College Name is required',
        description: 'Please enter your college name.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!discordId.trim()) {
      toast({
        title: 'Discord ID is required',
        description: 'Please enter your Discord ID.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const resolvedCollege =
      collegeType === 'IIIT Allahabad'
        ? 'IIIT Allahabad'
        : otherCollege.trim();

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        college: resolvedCollege,
        discordId: discordId.trim(),
        gender,
        year,
      });
      toast({
        title: 'Profile Updated',
        description: 'Your profile changes have been saved successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to update profile.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        bg="blackAlpha.600"
        backdropFilter="blur(4px)"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <Box
        position="relative"
        bg={modalBg}
        borderRadius="22px"
        border="1px solid var(--border)"
        backdropFilter="blur(24px)"
        p={{ base: '20px', md: '26px' }}
        boxShadow="var(--shadow)"
        w="90%"
        maxW="600px"
        maxH="90vh"
        overflowY="auto"
        zIndex={10000}
      >
        <Flex justify="space-between" align="center" mb="20px">
          <Box>
            <Text fontSize="xl" fontWeight="800" color={titleColor}>
              Edit Profile
            </Text>
            <Text fontSize="xs" color={labelColor} fontWeight="400" mt="2px">
              Update your personal and academic details
            </Text>
          </Box>
          <IconButton
            aria-label="Close modal"
            icon={<X size={20} />}
            variant="ghost"
            borderRadius="full"
            onClick={onClose}
            size="sm"
          />
        </Flex>

        <form onSubmit={handleSubmit}>
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
            gap={{ base: 4, md: 5 }}
            mb="24px"
          >
            {/* Name */}
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <FormControl isRequired>
                <FormLabel
                  fontSize="xs"
                  fontWeight="700"
                  textTransform="uppercase"
                  letterSpacing="0.6px"
                  color={labelColor}
                  mb="6px"
                >
                  Name<Text as="span" color={brandStars}>*</Text>
                </FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  borderRadius="12px"
                  size="md"
                  fontSize="sm"
                  fontWeight="500"
                />
              </FormControl>
            </GridItem>

            {/* College Selection */}
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <FormControl isRequired>
                <FormLabel
                  fontSize="xs"
                  fontWeight="700"
                  textTransform="uppercase"
                  letterSpacing="0.6px"
                  color={labelColor}
                  mb="6px"
                >
                  College<Text as="span" color={brandStars}>*</Text>
                </FormLabel>
                <Select
                  value={collegeType}
                  onChange={(e) => setCollegeType(e.target.value)}
                  borderRadius="12px"
                  size="md"
                  fontSize="sm"
                  fontWeight="500"
                >
                  <option value="IIIT Allahabad">IIIT Allahabad</option>
                  <option value="Other">Other</option>
                </Select>
              </FormControl>

              {collegeType === 'Other' && (
                <FormControl isRequired mt="12px">
                  <FormLabel
                    fontSize="xs"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="0.6px"
                    color={labelColor}
                    mb="6px"
                  >
                    Enter College Name<Text as="span" color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    value={otherCollege}
                    onChange={(e) => setOtherCollege(e.target.value)}
                    placeholder="Enter your college name"
                    borderRadius="12px"
                    size="md"
                    fontSize="sm"
                    fontWeight="500"
                    list="colleges-list"
                  />
                  <datalist id="colleges-list">
                    {colleges.map((c: string) => <option key={c} value={c} />)}
                  </datalist>
                </FormControl>
              )}
            </GridItem>

            {/* Discord ID */}
            <GridItem>
              <FormControl isRequired>
                <FormLabel
                  fontSize="xs"
                  fontWeight="700"
                  textTransform="uppercase"
                  letterSpacing="0.6px"
                  color={labelColor}
                  mb="6px"
                >
                  Discord ID<Text as="span" color={brandStars}>*</Text>
                </FormLabel>
                <Input
                  value={discordId}
                  onChange={(e) => setDiscordId(e.target.value)}
                  placeholder="e.g. username"
                  borderRadius="12px"
                  size="md"
                  fontSize="sm"
                  fontWeight="500"
                />
              </FormControl>
            </GridItem>

            {/* Gender */}
            <GridItem>
              <FormControl isRequired>
                <FormLabel
                  fontSize="xs"
                  fontWeight="700"
                  textTransform="uppercase"
                  letterSpacing="0.6px"
                  color={labelColor}
                  mb="6px"
                >
                  Gender<Text as="span" color={brandStars}>*</Text>
                </FormLabel>
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  borderRadius="12px"
                  size="md"
                  fontSize="sm"
                  fontWeight="500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
            </GridItem>

            {/* Year */}
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <FormControl isRequired>
                <FormLabel
                  fontSize="xs"
                  fontWeight="700"
                  textTransform="uppercase"
                  letterSpacing="0.6px"
                  color={labelColor}
                  mb="6px"
                >
                  Year<Text as="span" color={brandStars}>*</Text>
                </FormLabel>
                <Select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  borderRadius="12px"
                  size="md"
                  fontSize="sm"
                  fontWeight="500"
                >
                  <option value="School">School</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Passout">Passout</option>
                  {year &&
                    ![
                      'School',
                      '1st Year',
                      '2nd Year',
                      '3rd Year',
                      '4th Year',
                      'Passout',
                    ].includes(year) && <option value={year}>{year}</option>}
                </Select>
              </FormControl>
            </GridItem>

            {/* GitHub ID (LOCKED - READ ONLY) */}
            <GridItem>
              <FormControl isReadOnly isDisabled>
                <Flex align="center" justify="space-between" mb="6px">
                  <FormLabel
                    fontSize="xs"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="0.6px"
                    color={lockedText}
                    m="0"
                    display="flex"
                    alignItems="center"
                    gap="4px"
                  >
                    <Icon as={Lock} size="12px" />
                    GitHub ID
                  </FormLabel>
                  <Badge colorScheme="gray" fontSize="9px" px="6px" borderRadius="full">
                    Locked
                  </Badge>
                </Flex>
                <Input
                  value={profile?.githubId ? `@${profile.githubId}` : '—'}
                  isReadOnly
                  isDisabled
                  bg={lockedBg}
                  borderColor={lockedBorder}
                  color={lockedText}
                  cursor="not-allowed"
                  borderRadius="12px"
                  size="md"
                  fontSize="sm"
                />
                <FormHelperText fontSize="10px" color="gray.500" mt="4px">
                  GitHub ID cannot be modified.
                </FormHelperText>
              </FormControl>
            </GridItem>

            {/* Email (LOCKED - READ ONLY) */}
            <GridItem>
              <FormControl isReadOnly isDisabled>
                <Flex align="center" justify="space-between" mb="6px">
                  <FormLabel
                    fontSize="xs"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="0.6px"
                    color={lockedText}
                    m="0"
                    display="flex"
                    alignItems="center"
                    gap="4px"
                  >
                    <Icon as={Lock} size="12px" />
                    Email Address
                  </FormLabel>
                  <Badge colorScheme="gray" fontSize="9px" px="6px" borderRadius="full">
                    Locked
                  </Badge>
                </Flex>
                <Input
                  value={profile?.email || '—'}
                  isReadOnly
                  isDisabled
                  bg={lockedBg}
                  borderColor={lockedBorder}
                  color={lockedText}
                  cursor="not-allowed"
                  borderRadius="12px"
                  size="md"
                  fontSize="sm"
                />
                <FormHelperText fontSize="10px" color="gray.500" mt="4px">
                  Email address cannot be modified.
                </FormHelperText>
              </FormControl>
            </GridItem>
          </Grid>

          <Flex justify="flex-end" gap="12px">
            <Button
              variant="ghost"
              onClick={onClose}
              borderRadius="full"
              size="sm"
              type="button"
              color="var(--muted)"
              _hover={{ bg: 'var(--accent-soft)', color: 'var(--fg)' }}
            >
              Cancel
            </Button>
            <Button
              bg="var(--accent)"
              color="var(--accent-ink)"
              _hover={{
                bg: 'var(--accent-hover)',
                transform: 'scale(1.02)',
                boxShadow: 'var(--shadow)',
              }}
              type="submit"
              isLoading={isSubmitting}
              borderRadius="full"
              size="sm"
              px="24px"
              fontWeight="700"
              transition="all 0.2s ease"
            >
              Save Changes
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
}
