'use client';

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { Box } from '@chakra-ui/react';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserIssueDetails } from 'api/events/events';
import { RingLoader } from 'react-spinners';
import PageHeading from 'components/japanese/PageHeading';
import AnimatedContent from 'components/reactbits/AnimatedContent';
// avoid next/navigation useSearchParams to prevent CSR bailout during prerender

export default function Dashboard() {
  const [repoName, setRepoName] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setRepoName(params.get('repoName'));
    setProfileName(params.get('profileName'));
  }, []);

  interface issues {
    title: string;
    issueNumber: number;
    status: string;
    currentPoints: number;
  }
  interface IssueData {
    repoName: string;

    issues: issues[]; // Update this with the actual type of PR array
  }

  const [userIssueDetails, setuserIssueDetails] = useState<
    IssueData | undefined
  >(undefined);

  const { data: UserIssueDetils, isLoading } = useQuery({
    queryKey: ['profileInfo', profileName, repoName],
    queryFn: () =>
      getUserIssueDetails(
        profileName || '',
        process.env.NEXT_PUBLIC_EVENT_NAME || '',
        repoName || '',
      ),
    enabled: Boolean(profileName && repoName),
  });

  useEffect(() => {
    if (UserIssueDetils) {
      setuserIssueDetails(UserIssueDetils);
      // console.log(UserIssueDetils);
    }
  }, [UserIssueDetils]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RingLoader color="var(--accent)" />
      </div>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} px={{ base: '12px', md: '24px' }} maxW="1200px" mx="auto">
      <PageHeading
        eyebrow="CONTRIBUTION DETAILS"
        title="Issue Tracker"
        description="A detailed view of all pull requests and issue assignments for this contributor."
      />
      <AnimatedContent distance={20} duration={0.5} delay={0.1}>
        <TableContainer
          bg="var(--surface)"
          border="1px solid var(--border)"
          borderRadius="16px"
          boxShadow="var(--shadow)"
          p="12px"
        >
          <Table variant="simple">
            <TableCaption color="var(--muted)">All PR Details</TableCaption>
            <Thead>
              <Tr>
                <Th color="var(--muted)" borderColor="var(--border)">Issue Title</Th>
                <Th color="var(--muted)" borderColor="var(--border)">Issue Number</Th>
                <Th color="var(--muted)" borderColor="var(--border)">Status</Th>
                <Th color="var(--muted)" borderColor="var(--border)">Current Points</Th>
              </Tr>
            </Thead>
            <Tbody>
              {userIssueDetails?.issues?.map((pr, index) => (
                <Tr key={index} _hover={{ bg: 'var(--surface-2)' }}>
                  <Td borderColor="var(--border)">{pr.title}</Td>
                  <Td borderColor="var(--border)">{pr.issueNumber}</Td>
                  <Td borderColor="var(--border)">{pr.status}</Td>
                  <Td borderColor="var(--border)">{pr.currentPoints}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </AnimatedContent>
    </Box>
  );
}
