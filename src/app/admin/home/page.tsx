'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
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
  useColorModeValue,
} from '@chakra-ui/react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getUserPRDetails } from 'api/admin/admin';
import { FetchedEvents } from 'api/events/events';
import { useAuth } from 'contexts/AuthContext';
import { useEffect, useState } from 'react';
import { RingLoader } from 'react-spinners';
import { useRouter } from 'next/navigation';

import {
  useToast,
} from '@chakra-ui/react';
import { EditPRPoints } from 'api/admin/admin';
import { fetchLoggedInBasicDetails } from 'api/profile/profile';

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

  // Define the shape of the JWT payload
  interface JWTPayload {
    roles?: {
      isAdmin: boolean;
    };
    [key: string]: any;
  }

  // Helper to decode JWT payload
  function parseJwt(token: string | null): JWTPayload | null {
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

  const handleIncrementPointsChange = (e: any) => {
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

  const [userPrDetails, setuserPrDetails] = useState<any[]>([]);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
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
    const token = localStorage.getItem('token');
    const payload = parseJwt(token);

    if (!payload?.roles?.isAdmin) {
      console.error('Only admin can view events');
      router.push('/user/home');
    }
  }, [isMounted, router]);

  const pointUpdate = useMutation({
    mutationFn: EditPRPoints,
    onSuccess: () => {
      // console.log('Success');

      toast({
        title: 'Points Updated',
        description: 'PR points were successfully updated.',
        status: 'success',
        duration: 10000,
        isClosable: true,
      });

      setIsModalOpen(false);
    },
    onError: () => {
      // console.log('Error');
      toast({
        title: 'Points not Updated',
        description: 'PR points were successfully updated.',
        status: 'error',
        duration: 3000,
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
      setuserPrDetails(res.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching data:', error);
    }
  };

  if (!eventData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RingLoader color="#36d7b7" />
      </div>
    );
  }

  return (
    <>
    
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Text color={textColor} fontSize="2xl" ms="24px" fontWeight="700">
          Change Points
        </Text>

        <Flex
          mt="25px"
          mb="20px"
          justifyContent="space-between"
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'start', md: 'center' }}
        >
          <FormControl isRequired>
            <FormLabel color={textColor}>Github ID</FormLabel>
            <Input
              placeholder="First name"
              color={textColor}
              value={githubId}
              onChange={(e) => setGithubId(e.target.value)}
            />
          </FormControl>

          <FormControl marginLeft="10px">
            <FormLabel>All Events</FormLabel>
            <Select
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
        </Flex>
        <Button onClick={handlePrClick}>View PRS</Button>

        <TableContainer>
          <Table variant="simple">
            <TableCaption>All PR Details</TableCaption>
            <Thead>
              <Tr>
                <Th>PR Title</Th>
                <Th>PR Number</Th>
                <Th>Issue Number</Th>
                <Th>Points</Th>
                <Th>RepoName</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {userPrDetails?.map((pr, index) => (
                <Tr key={index}>
                  <Td>{pr.prTitle}</Td>
                  <Td>{pr.prNumber}</Td>
                  <Td>{pr.issueNumber}</Td>
                  <Td>{pr.points}</Td>
                  <Td>{pr.repoName}</Td>
                  <Td>{pr.status}</Td>
                  <Td>
                    <Button onClick={() => handleOpenModal(pr)}>
                      View Details
                    </Button>
                  </Td>
                </Tr>
              ))}
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
            bg="blackAlpha.600"
            zIndex={9999}
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={handleCloseModal}
          >
            <Box
              bg="gray.800"
              borderRadius="md"
              p={6}
              maxW="500px"
              w="90%"
              onClick={(e) => e.stopPropagation()}
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  PR Details
                </Text>
                <Button size="sm" variant="ghost" onClick={handleCloseModal}>
                  ✕
                </Button>
              </Flex>
              <form>
                <FormControl mb={4}>
                  <FormLabel>PR Title</FormLabel>
                  <Input
                    type="text"
                    value={selectedPrDetails?.prTitle || ''}
                    color={textColor}
                    isReadOnly
                  />
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel>PR Number</FormLabel>
                  <Input
                    type="text"
                    value={selectedPrDetails?.prNumber || ''}
                    color={textColor}
                    isReadOnly
                  />
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel>Increment Points</FormLabel>
                  <Input
                    type="number"
                    placeholder="Enter Point to Increment"
                    color={textColor}
                    onChange={handleIncrementPointsChange}
                    required
                  />
                </FormControl>
              </form>
              <Flex justify="flex-end" gap={3}>
                <Button
                  colorScheme="blue"
                  onClick={handleCloseModal}
                >
                  Close
                </Button>
                <Button
                  colorScheme="blue"
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
