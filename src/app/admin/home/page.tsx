'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Select,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { X } from 'lucide-react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getUserPRDetails } from 'api/admin/admin';
import { FetchedEvents } from 'api/events/events';
import { useAuth } from 'contexts/AuthContext';
import { useEffect, useState } from 'react';
import { RingLoader } from 'react-spinners';
import { useRouter } from 'next/navigation';

import { useToast } from '@chakra-ui/react';
import { EditPRPoints } from 'api/admin/admin';
import { fetchLoggedInBasicDetails } from 'api/profile/profile';
import { isAdminUser } from 'utils/jwt';

export default function Dashboard() {
  const router = useRouter();
  const toast = useToast();
  const [githubId, setGithubId] = useState('');
  const [eventName, setEventName] = useState('');
  const [selectedPrDetails, setSelectedPrDetails] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incrementPoints, setIncrementPoints] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const handleIncrementPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncrementPoints(e.target.value);
  };

  const handleOpenModal = (prDetails: any) => {
    setSelectedPrDetails(prDetails);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPrDetails(null);
    setIncrementPoints('');
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const [userPrDetails, setUserPrDetails] = useState<any[]>([]);
  const auth = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const querystring = window.location.search;
    const urlParam = new URLSearchParams(querystring);
    const token = urlParam.get('token');
    if (token === null) {
      auth.check_login();
    } else {
      localStorage.setItem('token', token);
      fetchLoggedInBasicDetails();
    }
  }, [auth]);

  // Admin-only guard: Redirect non-admin users away from admin page
  useEffect(() => {
    if (!isMounted) return;
    if (!isAdminUser()) {
      router.push('/user/events');
    }
  }, [isMounted, router]);

  const pointUpdate = useMutation({
    mutationFn: EditPRPoints,
    onSuccess: () => {
      toast({
        title: 'Points Updated',
        description: 'PR points were successfully updated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error?.message || 'Could not update PR points.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    },
  });

  const handleChangePoints = () => {
    if (incrementPoints === '') {
      toast({
        title: 'Enter a point to increment!',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (selectedPrDetails) {
      const { repoName, prNumber, issueNumber } = selectedPrDetails;
      const incrementPointsAsNumber = parseInt(incrementPoints, 10);

      const prUpdateData = {
        repoName,
        prNumber,
        issueNumber,
        pointIncrement: incrementPointsAsNumber,
        githubId,
        eventName,
      };

      // console.log(prUpdateData);

      pointUpdate.mutate(prUpdateData);
    }
  };

  const { data: eventData } = useQuery<{ data: Array<{ name: string }> }>({
    queryKey: ['EventInfo'],
    queryFn: FetchedEvents,
  });

  const { data: userPrDeatils, refetch } = useQuery({
    queryKey: ['userPrDeatilsInfo'],
    queryFn: () => getUserPRDetails(githubId, eventName),
    enabled: false,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RingLoader color="#36d7b7" />
      </div>
    );
  }

  const handlePrClick = async () => {
    try {
      setIsLoading(true);
      const res = await refetch();
      setUserPrDetails(res.data || []);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching PR details:', error);
    }
  };

  if (!eventData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RingLoader color="var(--accent)" />
      </div>
    );
  }

  return (
    <>
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Box
          bg="var(--surface)"
          border="1px solid var(--border)"
          p={{ base: '20px', md: '28px' }}
          borderRadius="20px"
          boxShadow="var(--shadow)"
          mb="24px"
        >
          <Text color="var(--fg)" fontSize="2xl" fontWeight="700" mb="6px">
            Change Points
          </Text>
          <Text fontSize="sm" color="var(--fg-muted)" mb="20px">
            Search contributor pull requests by GitHub username and event to adjust scores.
          </Text>

          <Flex
            mb="20px"
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'stretch', md: 'flex-end' }}
            gap="16px"
          >
            <FormControl isRequired flex="1">
              <FormLabel fontSize="sm" fontWeight="600" color="var(--fg)">Github ID</FormLabel>
              <Input
                variant="auth"
                placeholder="e.g. torvalds"
                value={githubId}
                onChange={(e) => setGithubId(e.target.value)}
              />
            </FormControl>

            <FormControl flex="1">
              <FormLabel fontSize="sm" fontWeight="600" color="var(--fg)">All Events</FormLabel>
              <Select
                variant="auth"
                placeholder="Select Event"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              >
                {eventData.data.map((e) => (
                  <option key={e.name} value={e.name}>
                    {e.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <Button
              onClick={handlePrClick}
              variant="brand"
              isLoading={isLoading}
              minW={{ base: '100%', md: '140px' }}
            >
              View PRs
            </Button>
          </Flex>
        </Box>

        <TableContainer
          bg="var(--surface)"
          border="1px solid var(--border)"
          borderRadius="16px"
          p="12px"
        >
          <Table variant="simple">
            <TableCaption color="var(--fg-muted)">All PR Details</TableCaption>
            <Thead>
              <Tr>
                <Th color="var(--fg-muted)" borderColor="var(--border)">PR Title</Th>
                <Th color="var(--fg-muted)" borderColor="var(--border)">PR Number</Th>
                <Th color="var(--fg-muted)" borderColor="var(--border)">Issue Number</Th>
                <Th color="var(--fg-muted)" borderColor="var(--border)">Points</Th>
                <Th color="var(--fg-muted)" borderColor="var(--border)">RepoName</Th>
                <Th color="var(--fg-muted)" borderColor="var(--border)">Status</Th>
                <Th color="var(--fg-muted)" borderColor="var(--border)">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {userPrDetails && userPrDetails.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py="36px" borderColor="var(--border)">
                    <Text color="var(--fg-muted)" fontSize="sm">
                      No pull requests to display. Enter a GitHub ID and click View PRs.
                    </Text>
                  </Td>
                </Tr>
              ) : (
                userPrDetails?.map((pr, index) => (
                  <Tr key={index} _hover={{ bg: 'var(--surface-2)' }}>
                    <Td borderColor="var(--border)">{pr.prTitle}</Td>
                    <Td borderColor="var(--border)">{pr.prNumber}</Td>
                    <Td borderColor="var(--border)">{pr.issueNumber}</Td>
                    <Td borderColor="var(--border)">{pr.points}</Td>
                    <Td borderColor="var(--border)">{pr.repoName}</Td>
                    <Td borderColor="var(--border)">{pr.status}</Td>
                    <Td borderColor="var(--border)">
                      <Button size="sm" variant="outline" onClick={() => handleOpenModal(pr)}>
                        View Details
                      </Button>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>

        {isModalOpen && (
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.700"
            backdropFilter="blur(4px)"
            zIndex={9999}
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={handleCloseModal}
          >
            <Box
              bg="var(--surface)"
              border="1px solid var(--border)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.45)"
              borderRadius="16px"
              p={6}
              maxW="500px"
              w="90%"
              onClick={(e) => e.stopPropagation()}
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="lg" fontWeight="bold" color="var(--fg)">
                  PR Details
                </Text>
                <IconButton
                  aria-label="Close modal"
                  size="sm"
                  variant="ghost"
                  icon={<X size={18} />}
                  onClick={handleCloseModal}
                />
              </Flex>
              <form>
                <FormControl mb={4}>
                  <FormLabel color="var(--fg)">PR Title</FormLabel>
                  <Input
                    type="text"
                    value={selectedPrDetails?.prTitle || ''}
                    isReadOnly
                  />
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel color="var(--fg)">PR Number</FormLabel>
                  <Input
                    type="text"
                    value={selectedPrDetails?.prNumber || ''}
                    isReadOnly
                  />
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel color="var(--fg)">Increment Points</FormLabel>
                  <Input
                    type="number"
                    placeholder="Enter Point to Increment"
                    onChange={handleIncrementPointsChange}
                    required
                  />
                </FormControl>
              </form>
              <Flex justify="flex-end" gap={3}>
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  Close
                </Button>
                <Button
                  variant="brand"
                  onClick={handleChangePoints}
                >
                  Change Points
                </Button>
              </Flex>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}
