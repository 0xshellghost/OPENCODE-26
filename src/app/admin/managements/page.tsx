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
} from '@chakra-ui/react';
import { MdAdd, MdDelete, MdEdit, MdPersonAdd } from 'react-icons/md';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { FetchedEvents } from 'api/events/events';
import { addRepo, deleteRepo, renameRepo, addMentor } from 'api/admin/admin';
import { useRouter } from 'next/navigation';
import { RingLoader } from 'react-spinners';

// Helper to decode JWT payload
function parseJwt(token: string | null): any {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function ManagementPage() {
  const router = useRouter();
  const toast = useToast();
  const [isMounted, setIsMounted] = useState(false);
  
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const token = localStorage.getItem('token');
    const payload = parseJwt(token);

    if (!payload?.roles?.isAdmin) {
      console.error('Only admin can view management page');
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
              <Button colorScheme="blue" w="100%" leftIcon={<Icon as={MdEdit} />} onClick={handleRenameRepo}>Rename</Button>
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
