'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  useColorModeValue,
  useToast,
  VStack,
  Heading,
  Divider,
  Grid,
  GridItem,
  Icon,
  Badge,
  HStack,
  Switch,
} from '@chakra-ui/react';
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdPersonAdd,
  MdUploadFile,
  MdFileDownload,
  MdCloudUpload,
  MdTableChart,
  MdCheckCircle,
  MdStar,
} from 'react-icons/md';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { FetchedEvents } from 'api/events/events';
import { addRepo, deleteRepo, renameRepo, addMentor, uploadEventLeaderboard } from 'api/admin/admin';
import { useRouter } from 'next/navigation';
import { RingLoader } from 'react-spinners';
import { isAdminUser } from 'utils/jwt';
import { useFeatures } from 'contexts/FeaturesContext';

export default function ManagementPage() {
  const router = useRouter();
  const toast = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const { features, toggleFeature, setFlagshipEvent } = useFeatures();
  
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'gray.800');
  const shadowSoft = useColorModeValue('0 10px 24px rgba(0,0,0,0.08)', '0 10px 24px rgba(0,0,0,0.35)');

  // State
  const [selectedEvent, setSelectedEvent] = useState('');
  const [addRepoName, setAddRepoName] = useState('');
  const [deleteRepoName, setDeleteRepoName] = useState('');
  const [renameTargetRepo, setRenameTargetRepo] = useState('');
  const [renameNewRepo, setRenameNewRepo] = useState('');
  const [mentorGithubId, setMentorGithubId] = useState('');

  // Leaderboard SQL Upload State
  const [uploadEvent, setUploadEvent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Flagship Event State
  const [selectedFlagship, setSelectedFlagship] = useState(features.flagshipEvent || '');

  useEffect(() => {
    setSelectedFlagship(features.flagshipEvent || '');
  }, [features.flagshipEvent]);

  const handleSetFlagship = async () => {
    if (!selectedFlagship) {
      toast({ title: 'Please select an event to make flagship.', status: 'warning', isClosable: true });
      return;
    }
    const success = await setFlagshipEvent(selectedFlagship);
    if (success) {
      toast({
        title: 'Flagship Event Updated',
        description: `"${selectedFlagship}" is now set as the Flagship Event.`,
        status: 'success',
        isClosable: true,
      });
    } else {
      toast({ title: 'Failed to update flagship event', status: 'error', isClosable: true });
    }
  };

  const handleRemoveFlagship = async () => {
    const success = await setFlagshipEvent(null);
    if (success) {
      setSelectedFlagship('');
      toast({
        title: 'Flagship Event Removed',
        description: 'No event is currently set as flagship.',
        status: 'info',
        isClosable: true,
      });
    } else {
      toast({ title: 'Failed to remove flagship event', status: 'error', isClosable: true });
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!isAdminUser()) {
      router.push('/user/home');
    }
  }, [isMounted, router]);

  const { data: eventData, isLoading } = useQuery<{ data: Array<{ name: string }> }>({
    queryKey: ['EventInfo'],
    queryFn: FetchedEvents,
  });

  const handleAddRepo = async () => {
    if (!selectedEvent || !addRepoName) {
      toast({ title: 'Event and Repo Name are required.', status: 'warning', isClosable: true });
      return;
    }
    try {
      await addRepo(selectedEvent, addRepoName);
      toast({ title: 'Repo Added!', status: 'success', isClosable: true });
      setAddRepoName('');
    } catch (error: any) {
      toast({ title: 'Error adding repo', description: error.message, status: 'error', isClosable: true });
    }
  };

  const handleDeleteRepo = async () => {
    if (!selectedEvent || !deleteRepoName) {
      toast({ title: 'Event and Repo Name are required.', status: 'warning', isClosable: true });
      return;
    }
    try {
      await deleteRepo(selectedEvent, deleteRepoName);
      toast({ title: 'Repo Deleted!', status: 'success', isClosable: true });
      setDeleteRepoName('');
    } catch (error: any) {
      toast({ title: 'Error deleting repo', description: error.message, status: 'error', isClosable: true });
    }
  };

  const handleRenameRepo = async () => {
    if (!selectedEvent || !renameTargetRepo || !renameNewRepo) {
      toast({ title: 'Event, Target Repo, and New Name are required.', status: 'warning', isClosable: true });
      return;
    }
    try {
      await renameRepo(selectedEvent, renameTargetRepo, renameNewRepo);
      toast({ title: 'Repo Renamed!', status: 'success', isClosable: true });
      setRenameTargetRepo('');
      setRenameNewRepo('');
    } catch (error: any) {
      toast({ title: 'Error renaming repo', description: error.message, status: 'error', isClosable: true });
    }
  };

  const handleAddMentor = async () => {
    if (!mentorGithubId) {
      toast({ title: 'GitHub ID is required.', status: 'warning', isClosable: true });
      return;
    }
    try {
      await addMentor(mentorGithubId);
      toast({ title: 'Mentor added successfully!', status: 'success', isClosable: true });
      setMentorGithubId('');
    } catch (error: any) {
      toast({ title: 'Error adding mentor', description: error.message, status: 'error', isClosable: true });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validExtensions = ['.sql'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a SQL script (.sql) file.',
          status: 'error',
          isClosable: true,
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDownloadTemplate = () => {
    const targetEvent = uploadEvent || 'EVENT_NAME';
    const sqlContent = `-- SQL Leaderboard Template for event: ${targetEvent}
-- Replace '${targetEvent}' with your actual event name if not already set.
-- Note: Opencode leaderboard is live and automated; this template is for other events.

-- 1. Insert or update User profiles
INSERT INTO \`User\` (\`id\`, \`name\`, \`email\`, \`avatarUrl\`, \`college\`, \`graduationYear\`, \`branch\`, \`degree\`, \`githubId\`, \`year\`, \`createdAt\`, \`updatedAt\`)
VALUES
  (UUID(), 'Ada Lovelace', 'adalovelace@users.noreply.github.com', 'https://avatars.githubusercontent.com/adalovelace', 'IIIT Allahabad', 2026, 'IT', 'B.Tech', 'adalovelace', '4th', NOW(), NOW()),
  (UUID(), 'Alan Turing', 'aturing@users.noreply.github.com', 'https://avatars.githubusercontent.com/aturing', 'IIIT Allahabad', 2027, 'ECE', 'B.Tech', 'aturing', '3rd', NOW(), NOW()),
  (UUID(), 'Margaret Hamilton', 'mhamilton@users.noreply.github.com', 'https://avatars.githubusercontent.com/mhamilton', 'IIT Delhi', 2026, 'CSE', 'B.Tech', 'mhamilton', '4th', NOW(), NOW()),
  (UUID(), 'Grace Hopper', 'ghopper@users.noreply.github.com', 'https://avatars.githubusercontent.com/ghopper', 'NIT Trichy', 2028, 'ECE', 'B.Tech', 'ghopper', '2nd', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  \`name\` = VALUES(\`name\`),
  \`college\` = VALUES(\`college\`),
  \`graduationYear\` = VALUES(\`graduationYear\`),
  \`avatarUrl\` = VALUES(\`avatarUrl\`),
  \`updatedAt\` = NOW();

-- 2. Insert or update Participants
INSERT INTO \`Participant\` (\`id\`, \`participantId\`)
VALUES
  (UUID(), 'adalovelace'),
  (UUID(), 'aturing'),
  (UUID(), 'mhamilton'),
  (UUID(), 'ghopper')
ON DUPLICATE KEY UPDATE
  \`participantId\` = VALUES(\`participantId\`);

-- 3. Insert or update Leaderboard Entries
INSERT INTO \`LeaderboardEntry\` (\`id\`, \`participantId\`, \`eventName\`, \`points\`, \`PRmerged\`)
VALUES
  (UUID(), 'adalovelace', '${targetEvent}', 500, 0),
  (UUID(), 'aturing', '${targetEvent}', 450, 0),
  (UUID(), 'mhamilton', '${targetEvent}', 420, 0),
  (UUID(), 'ghopper', '${targetEvent}', 380, 0)
ON DUPLICATE KEY UPDATE
  \`points\` = VALUES(\`points\`),
  \`PRmerged\` = VALUES(\`PRmerged\`);
`;

    const blob = new Blob([sqlContent], { type: 'application/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const filename = `${uploadEvent ? uploadEvent.replace(/\s+/g, '_') : 'event'}_leaderboard_template.sql`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUploadLeaderboard = async () => {
    if (!uploadEvent) {
      toast({ title: 'Please select an event first.', status: 'warning', isClosable: true });
      return;
    }
    if (uploadEvent.toLowerCase().includes('opencode')) {
      toast({
        title: 'Action Not Allowed',
        description: 'Opencode leaderboard is live and automated. SQL upload is only permitted for other events.',
        status: 'error',
        isClosable: true,
      });
      return;
    }
    if (!selectedFile) {
      toast({ title: 'Please select a SQL script file (.sql) to upload.', status: 'warning', isClosable: true });
      return;
    }

    setIsUploading(true);
    try {
      await uploadEventLeaderboard(uploadEvent, selectedFile);
      toast({
        title: 'Leaderboard Uploaded Successfully!',
        description: `SQL script executed. Rankings for "${uploadEvent}" have been updated and are now live.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error?.message || 'Failed to upload and execute leaderboard SQL.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading || !isMounted) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <RingLoader color="#755FFF" size={52} />
      </Flex>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} px="20px">
      <Text color={textColor} fontSize="2xl" mb="24px" fontWeight="700">
        Management Tools
      </Text>

      <Box bg={cardBg} p="30px" borderRadius="20px" boxShadow={shadowSoft} mb="24px">
        <Heading size="md" mb="16px" color={textColor}>Tab Visibility</Heading>
        <Text fontSize="sm" mb="20px" color="gray.500">
          Toggle visibility of community tabs in the navigation.
        </Text>

        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="20px">
          <Flex
            p="20px"
            borderRadius="16px"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            bg={useColorModeValue('gray.50', 'whiteAlpha.50')}
            align="center"
            justify="space-between"
          >
            <Box>
              <HStack spacing="8px" mb="4px">
                <Text fontWeight="600" color={textColor}>Winners</Text>
                <Badge colorScheme={features.showWinners ? 'green' : 'gray'}>
                  {features.showWinners ? 'Visible' : 'Hidden'}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500">Show or hide the Winners tab in navigation.</Text>
            </Box>
            <Switch
              colorScheme="brand"
              size="lg"
              isChecked={features.showWinners}
              onChange={async (e) => {
                const val = e.target.checked;
                await toggleFeature('showWinners', val);
                toast({
                  title: `Winners tab ${val ? 'enabled' : 'hidden'}`,
                  status: 'info',
                  duration: 2000,
                  isClosable: true,
                });
              }}
            />
          </Flex>

          <Flex
            p="20px"
            borderRadius="16px"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            bg={useColorModeValue('gray.50', 'whiteAlpha.50')}
            align="center"
            justify="space-between"
          >
            <Box>
              <HStack spacing="8px" mb="4px">
                <Text fontWeight="600" color={textColor}>Milestones</Text>
                <Badge colorScheme={features.showMilestones ? 'green' : 'gray'}>
                  {features.showMilestones ? 'Visible' : 'Hidden'}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500">Show or hide the Milestones tab in navigation.</Text>
            </Box>
            <Switch
              colorScheme="brand"
              size="lg"
              isChecked={features.showMilestones}
              onChange={async (e) => {
                const val = e.target.checked;
                await toggleFeature('showMilestones', val);
                toast({
                  title: `Milestones tab ${val ? 'enabled' : 'hidden'}`,
                  status: 'info',
                  duration: 2000,
                  isClosable: true,
                });
              }}
            />
          </Flex>
          <Flex
            p="20px"
            borderRadius="16px"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            bg={useColorModeValue('gray.50', 'whiteAlpha.50')}
            align="center"
            justify="space-between"
          >
            <Box>
              <HStack spacing="8px" mb="4px">
                <Text fontWeight="600" color={textColor}>RPlace</Text>
                <Badge colorScheme={features.showRPlace ? 'green' : 'gray'}>
                  {features.showRPlace ? 'Visible' : 'Hidden'}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500">Show or hide the RPlace tab in navigation.</Text>
            </Box>
            <Switch
              colorScheme="brand"
              size="lg"
              isChecked={features.showRPlace}
              onChange={async (e) => {
                const val = e.target.checked;
                await toggleFeature('showRPlace', val);
                toast({
                  title: `RPlace tab ${val ? 'enabled' : 'hidden'}`,
                  status: 'info',
                  duration: 2000,
                  isClosable: true,
                });
              }}
            />
          </Flex>
          <Flex
            p="20px"
            borderRadius="16px"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            bg={useColorModeValue('gray.50', 'whiteAlpha.50')}
            align="center"
            justify="space-between"
          >
            <Box>
              <HStack spacing="8px" mb="4px">
                <Text fontWeight="600" color={textColor}>Repositories</Text>
                <Badge colorScheme={features.showRepositories ? 'green' : 'gray'}>
                  {features.showRepositories ? 'Visible' : 'Hidden'}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500">Show or hide the Repositories tab in navigation.</Text>
            </Box>
            <Switch
              colorScheme="brand"
              size="lg"
              isChecked={features.showRepositories}
              onChange={async (e) => {
                const val = e.target.checked;
                await toggleFeature('showRepositories', val);
                toast({
                  title: `Repositories tab ${val ? 'enabled' : 'hidden'}`,
                  status: 'info',
                  duration: 2000,
                  isClosable: true,
                });
              }}
            />
          </Flex>
          <Flex
            p="20px"
            borderRadius="16px"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            bg={useColorModeValue('gray.50', 'whiteAlpha.50')}
            align="center"
            justify="space-between"
          >
            <Box>
              <HStack spacing="8px" mb="4px">
                <Text fontWeight="600" color={textColor}>Leaderboard</Text>
                <Badge colorScheme={features.showLeaderboard ? 'green' : 'gray'}>
                  {features.showLeaderboard ? 'Visible' : 'Hidden'}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500">Show or hide the Leaderboard tab in navigation.</Text>
            </Box>
            <Switch
              colorScheme="brand"
              size="lg"
              isChecked={features.showLeaderboard}
              onChange={async (e) => {
                const val = e.target.checked;
                await toggleFeature('showLeaderboard', val);
                toast({
                  title: `Leaderboard tab ${val ? 'enabled' : 'hidden'}`,
                  status: 'info',
                  duration: 2000,
                  isClosable: true,
                });
              }}
            />
          </Flex>
        </Grid>
      </Box>

      {/* ─── FLAGSHIP EVENT CONTROL ─── */}
      <Box bg={cardBg} p="30px" borderRadius="20px" boxShadow={shadowSoft} mb="24px">
        <Flex justify="space-between" align={{ base: 'flex-start', sm: 'center' }} mb="8px" flexWrap="wrap" gap="10px">
          <Flex align="center" gap="10px">
            <Box p="8px" borderRadius="10px" bg="yellow.50" color="yellow.600">
              <Icon as={MdStar} boxSize={6} />
            </Box>
            <Heading size="md" color={textColor}>Flagship Event</Heading>
          </Flex>
          {features.flagshipEvent ? (
            <Badge colorScheme="green" px="10px" py="4px" borderRadius="full" fontSize="12px">
              Active: {features.flagshipEvent}
            </Badge>
          ) : (
            <Badge colorScheme="gray" px="10px" py="4px" borderRadius="full" fontSize="12px">
              No Flagship Event
            </Badge>
          )}
        </Flex>

        <Text fontSize="sm" mb="20px" color="gray.500">
          The flagship event is highlighted with the prominent &ldquo;Featured Flagship Arena&rdquo; banner at the top of the user events page. You can change it or remove it entirely.
        </Text>

        <Grid templateColumns={{ base: '1fr', md: '3fr 1fr 1fr' }} gap="15px" alignItems="center">
          <Select
            placeholder="Select an Event..."
            variant="auth"
            value={selectedFlagship}
            onChange={(e) => setSelectedFlagship(e.target.value)}
          >
            {eventData?.data?.map((e) => (
              <option key={e.name} value={e.name}>
                {e.name} {e.name.toLowerCase() === features.flagshipEvent?.toLowerCase() ? '(Current Flagship)' : ''}
              </option>
            ))}
          </Select>

          <Button
            colorScheme="brand"
            w="100%"
            leftIcon={<Icon as={MdStar} />}
            isDisabled={!selectedFlagship || selectedFlagship === features.flagshipEvent}
            onClick={handleSetFlagship}
          >
            Set Flagship
          </Button>

          <Button
            variant="outline"
            colorScheme="red"
            w="100%"
            isDisabled={!features.flagshipEvent}
            onClick={handleRemoveFlagship}
          >
            Remove Flagship
          </Button>
        </Grid>
      </Box>

      {/* ─── EVENT LEADERBOARD UPLOAD (SQL) ─── */}
      <Box bg={cardBg} p="30px" borderRadius="20px" boxShadow={shadowSoft} mb="24px">
        <Flex justify="space-between" align={{ base: 'flex-start', sm: 'center' }} mb="8px" flexWrap="wrap" gap="10px">
          <Flex align="center" gap="10px">
            <Box p="8px" borderRadius="10px" bg="purple.50" color="purple.600">
              <Icon as={MdTableChart} boxSize={6} />
            </Box>
            <Heading size="md" color={textColor}>Upload Event Leaderboard</Heading>
          </Flex>
          <Badge colorScheme="purple" px="10px" py="4px" borderRadius="full" fontSize="12px">
            SQL
          </Badge>
        </Flex>
        
        <Text fontSize="sm" mb="20px" color="gray.500">
          Upload official rankings and scores via SQL for non-OpenCode events (Hackathons, Contests, Design Sprints).
          Rankings uploaded via SQL script will be executed and displayed to users when selecting this event in the Leaderboard.
        </Text>

        <FormControl mb="20px">
          <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Select Target Event</FormLabel>
          <Select
            placeholder="Select an Event..."
            variant="auth"
            value={uploadEvent}
            onChange={(e) => setUploadEvent(e.target.value)}
          >
            {eventData?.data?.map((e) => {
              const isOpencode = e.name.toLowerCase().includes('opencode');
              return (
                <option key={e.name} value={e.name} disabled={isOpencode}>
                  {e.name} {isOpencode ? '(Live Automated - Disabled)' : '(SQL Managed)'}
                </option>
              );
            })}
          </Select>
        </FormControl>

        <Divider mb="20px" />

        {/* File Dropzone / Upload area */}
        <VStack align="stretch" spacing="18px">
          <Box
            border="2px dashed"
            borderColor={selectedFile ? "purple.400" : "gray.300"}
            borderRadius="16px"
            p="24px"
            textAlign="center"
            bg={selectedFile ? "purple.50" : "transparent"}
            transition="all 0.2s ease"
            cursor="pointer"
            onClick={() => fileInputRef.current?.click()}
            _hover={{
              borderColor: "purple.400",
              bg: "purple.50",
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".sql"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <Flex direction="column" align="center" gap="10px">
              <Icon
                as={selectedFile ? MdCheckCircle : MdCloudUpload}
                boxSize={10}
                color={selectedFile ? "green.500" : "purple.500"}
              />
              {selectedFile ? (
                <Box>
                  <Text fontWeight="700" color={textColor} fontSize="15px">
                    {selectedFile.name}
                  </Text>
                  <Text fontSize="12px" color="gray.500" mt="2px">
                    {(selectedFile.size / 1024).toFixed(1)} KB · Ready to execute & upload
                  </Text>
                </Box>
              ) : (
                <Box>
                  <Text fontWeight="600" color={textColor} fontSize="14px">
                    Click to browse or drag and drop SQL script
                  </Text>
                  <Text fontSize="12px" color="gray.500" mt="4px">
                    Supports SQL scripts (.sql) containing LeaderboardEntry / User records
                  </Text>
                </Box>
              )}
            </Flex>
          </Box>

          {/* Action buttons */}
          <Flex justify="space-between" align="center" gap="12px" flexWrap="wrap">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Icon as={MdFileDownload} />}
              onClick={handleDownloadTemplate}
              colorScheme="gray"
            >
              Download Template (.sql)
            </Button>

            <HStack spacing="10px">
              {selectedFile && (
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  leftIcon={<Icon as={MdDelete} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Remove
                </Button>
              )}
              <Button
                colorScheme="purple"
                leftIcon={<Icon as={MdUploadFile} />}
                onClick={handleUploadLeaderboard}
                isLoading={isUploading}
                loadingText="Executing SQL..."
                isDisabled={!selectedFile || !uploadEvent}
              >
                Upload Leaderboard
              </Button>
            </HStack>
          </Flex>
        </VStack>
      </Box>

      {/* ─── REPOSITORY MANAGEMENT ─── */}
      <Box bg={cardBg} p="30px" borderRadius="20px" boxShadow={shadowSoft} mb="24px">
        <Heading size="md" mb="16px" color={textColor}>Repository Management</Heading>
        <Text fontSize="sm" mb="20px" color="gray.500">
          Manage repositories associated with specific events.
        </Text>
        
        <FormControl mb="24px">
          <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Select Event</FormLabel>
          <Select placeholder="Select an Event..." variant="auth" value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
            {eventData?.data.map((e) => (
              <option key={e.name} value={e.name}>{e.name}</option>
            ))}
          </Select>
        </FormControl>

        <Divider mb="24px" />

        <VStack align="stretch" spacing="24px">
          <Box>
            <Text fontSize="sm" fontWeight="600" mb="8px" color={textColor}>Add Repository</Text>
            <Grid templateColumns={{ base: '1fr', md: '3fr 1fr' }} gap="15px">
              <Input placeholder="Repository Name" variant="auth" value={addRepoName} onChange={(e) => setAddRepoName(e.target.value)} />
              <Button colorScheme="brand" w="100%" leftIcon={<Icon as={MdAdd} />} onClick={handleAddRepo}>Add Repo</Button>
            </Grid>
          </Box>
          
          <Box>
            <Text fontSize="sm" fontWeight="600" mb="8px" color={textColor}>Delete Repository</Text>
            <Grid templateColumns={{ base: '1fr', md: '3fr 1fr' }} gap="15px">
              <Input placeholder="Repository Name to Delete" variant="auth" value={deleteRepoName} onChange={(e) => setDeleteRepoName(e.target.value)} />
              <Button colorScheme="red" w="100%" leftIcon={<Icon as={MdDelete} />} onClick={handleDeleteRepo}>Delete Repo</Button>
            </Grid>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="600" mb="8px" color={textColor}>Rename Repository</Text>
            <Grid templateColumns={{ base: '1fr', md: '1.5fr 1.5fr 1fr' }} gap="15px">
              <Input placeholder="Current Name" variant="auth" value={renameTargetRepo} onChange={(e) => setRenameTargetRepo(e.target.value)} />
              <Input placeholder="New Name" variant="auth" value={renameNewRepo} onChange={(e) => setRenameNewRepo(e.target.value)} />
              <Button bg="#9D767E" _hover={{ bg: "#785255" }} color="#FEF3ED" w="100%" leftIcon={<Icon as={MdEdit} />} onClick={handleRenameRepo}>Rename</Button>
            </Grid>
          </Box>
        </VStack>
      </Box>

      <Box bg={cardBg} p="30px" borderRadius="20px" boxShadow={shadowSoft}>
        <Heading size="md" mb="16px" color={textColor}>Mentor Management</Heading>
        <Text fontSize="sm" mb="20px" color="gray.500">
          Promote a user to Mentor role so they can review PRs and access this panel.
        </Text>
        <Grid templateColumns={{ base: '1fr', md: '3fr 1fr' }} gap="15px">
          <Input placeholder="User's GitHub ID" variant="auth" value={mentorGithubId} onChange={(e) => setMentorGithubId(e.target.value)} />
          <Button colorScheme="purple" w="100%" leftIcon={<Icon as={MdPersonAdd} />} onClick={handleAddMentor}>Add Mentor</Button>
        </Grid>
      </Box>
    </Box>
  );
}
