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
} from 'react-icons/md';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { FetchedEvents } from 'api/events/events';
import { addRepo, deleteRepo, renameRepo, addMentor, uploadEventLeaderboard } from 'api/admin/admin';
import { useRouter } from 'next/navigation';
import { RingLoader } from 'react-spinners';
import { isAdminUser } from 'utils/jwt';

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

  // Leaderboard Excel Upload State
  const [uploadEvent, setUploadEvent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.',
          status: 'error',
          isClosable: true,
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Position,Name,GitHub Username,Points,College,Graduation Year\n" +
      "1,Ada Lovelace,adalovelace,500,IIIT Allahabad,2026\n" +
      "2,Alan Turing,aturing,450,IIIT Allahabad,2027\n" +
      "3,Margaret Hamilton,mhamilton,420,IIT Delhi,2026\n" +
      "4,Grace Hopper,ghopper,380,NIT Trichy,2028\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "event_leaderboard_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadLeaderboard = async () => {
    if (!uploadEvent) {
      toast({ title: 'Please select an event first.', status: 'warning', isClosable: true });
      return;
    }
    if (!selectedFile) {
      toast({ title: 'Please select a spreadsheet file (.xlsx or .csv) to upload.', status: 'warning', isClosable: true });
      return;
    }

    setIsUploading(true);
    try {
      await uploadEventLeaderboard(uploadEvent, selectedFile);
      toast({
        title: 'Leaderboard Uploaded Successfully!',
        description: `Rankings for "${uploadEvent}" have been updated and are now live.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error?.message || 'Failed to upload event leaderboard.',
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

      {/* ─── EVENT LEADERBOARD UPLOAD (EXCEL / CSV) ─── */}
      <Box bg={cardBg} p="30px" borderRadius="20px" boxShadow={shadowSoft} mb="24px">
        <Flex justify="space-between" align={{ base: 'flex-start', sm: 'center' }} mb="8px" flexWrap="wrap" gap="10px">
          <Flex align="center" gap="10px">
            <Box p="8px" borderRadius="10px" bg="purple.50" color="purple.600">
              <Icon as={MdTableChart} boxSize={6} />
            </Box>
            <Heading size="md" color={textColor}>Upload Event Leaderboard</Heading>
          </Flex>
          <Badge colorScheme="purple" px="10px" py="4px" borderRadius="full" fontSize="12px">
            Excel / CSV
          </Badge>
        </Flex>
        
        <Text fontSize="sm" mb="20px" color="gray.500">
          Upload official rankings and scores for non-OpenCode events (Hackathons, Contests, Design Sprints).
          Rankings uploaded here will be displayed to users when selecting this event in the Leaderboard.
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
                <option key={e.name} value={e.name}>
                  {e.name} {isOpencode ? '(PR Automated)' : '(Spreadsheet Managed)'}
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
              accept=".xlsx,.xls,.csv"
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
                    {(selectedFile.size / 1024).toFixed(1)} KB · Ready to upload
                  </Text>
                </Box>
              ) : (
                <Box>
                  <Text fontWeight="600" color={textColor} fontSize="14px">
                    Click to browse or drag and drop spreadsheet
                  </Text>
                  <Text fontSize="12px" color="gray.500" mt="4px">
                    Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv)
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
              Download Template (.csv)
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
                loadingText="Uploading..."
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
