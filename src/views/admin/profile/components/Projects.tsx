'use client';

import {
  Text,
  Stack,
  Box,
  Flex,
  Icon,
} from '@chakra-ui/react';
import Project from 'views/admin/profile/components/Project';
import { PullRequest } from 'app/user/profile/page';
import { FaInbox } from 'react-icons/fa';
import { Star } from 'lucide-react';
import Link from 'next/link';

export default function Projects(props: { PRs: PullRequest[] }) {
  const textPrimary = 'var(--fg)';
  const textSecondary = 'var(--muted)';

  return (
    <Box>
      {/* Header */}
      <Box mb="20px">
        <Text
          color={textPrimary}
          fontWeight="800"
          fontSize="20px"
          mb="4px"
        >
          Recent Contributions
        </Text>
        <Text color={textSecondary} fontSize="14px">
          Pull requests created by this user
        </Text>
      </Box>

      {/* Content */}
      {props.PRs.length ? (
        <Stack spacing="14px">
          {props.PRs.map((pr) => (
            <Project
              key={`${pr.issue.repoName}-${pr.prNumber}`}
              pr={pr}
            />
          ))}
        </Stack>
      ) : (
        <Box
          p="44px"
          borderRadius="16px"
          textAlign="center"
          border="1px dashed var(--border)"
          bg="var(--card-soft)"
          position="relative"
          overflow="hidden"
        >
          <Icon
            as={FaInbox}
            boxSize="36px"
            color="var(--accent)"
            mb="14px"
          />
          <Text fontSize="lg" fontWeight="700" color={textPrimary}>
            No contributions yet. Ready to make an impact?
          </Text>
          <Text fontSize="sm" color={textSecondary} mt="6px">
            Start contributing to see your history here.{' '}
            <Link href="/user/repos" style={{ color: 'var(--accent)', textDecoration: 'underline', fontWeight: 600 }}>
              Explore Issues
            </Link>
          </Text>
        </Box>
      )}
    </Box>
  );
}
