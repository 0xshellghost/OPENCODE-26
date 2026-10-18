import {
  Box,
  Flex,
  Icon,
  Link,
  Text,
  Badge,
} from '@chakra-ui/react';
import { PullRequest } from 'app/user/profile/page';
import Card from 'components/card/Card';
import { FaGithub, FaCodeBranch } from 'react-icons/fa';

export default function Project({ pr }: { pr: PullRequest }) {
  const textPrimary = 'var(--fg)';
  const textSecondary = 'var(--muted)';

  const status = pr.status.toLowerCase();
  const statusStyles =
    status === 'merged'
      ? { bg: 'rgba(104, 211, 145, 0.18)', color: '#68D391', border: '1px solid rgba(104, 211, 145, 0.35)' }
      : status === 'open'
      ? { bg: 'rgba(183, 148, 244, 0.18)', color: '#B794F4', border: '1px solid rgba(183, 148, 244, 0.35)' }
      : status === 'rejected'
      ? { bg: 'rgba(252, 129, 129, 0.18)', color: '#FC8181', border: '1px solid rgba(252, 129, 129, 0.35)' }
      : { bg: 'rgba(255, 255, 255, 0.1)', color: 'var(--muted)', border: '1px solid rgba(255, 255, 255, 0.2)' };

  return (
    <Card
      bg="var(--card-soft)"
      backdropFilter="blur(20px)"
      p="16px"
      borderRadius="16px"
      border="1px solid var(--border)"
      transition="all 0.3s ease"
      boxShadow="var(--shadow)"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'var(--shadow)',
        borderColor: 'var(--accent)',
        bg: 'var(--accent-soft)',
      }}
    >
      <Flex gap="14px" align="flex-start">
        {/* ICON */}
        <Box
          p="10px"
          borderRadius="12px"
          bg="var(--accent-soft)"
          border="1px solid var(--border)"
          color="var(--accent)"
          flexShrink={0}
        >
          <Icon as={FaGithub} h="20px" w="20px" />
        </Box>

        {/* CONTENT */}
        <Box flex="1">
          {/* TITLE & ISSUE */}
          <Link
            href={`https://github.com/opencodeiiita/${pr.issue.repoName}/pull/${pr.prNumber}`}
            isExternal
          >
            <Text
              fontWeight="800"
              fontSize="md"
              color={textPrimary}
              _hover={{ textDecoration: 'underline' }}
              mb="2px"
            >
              {pr.title || `PR #${pr.prNumber}`}
            </Text>
          </Link>
          <Link
            href={`https://github.com/opencodeiiita/${pr.issue.repoName}/issues/${pr.issue.issueNumber}`}
            isExternal
          >
            <Text fontSize="sm" color={textSecondary} _hover={{ textDecoration: 'underline' }}>
              Related to Issue #{pr.issue.issueNumber}
            </Text>
          </Link>

          {/* PR + REPO */}
          <Flex
            mt="4px"
            gap="6px"
            wrap="wrap"
            align="center"
            fontSize="sm"
            color={textSecondary}
          >
            <Icon as={FaCodeBranch} opacity={0.7} />

            <Link
              href={`https://github.com/opencodeiiita/${pr.issue.repoName}/pull/${pr.prNumber}`}
              isExternal
              fontWeight="600"
              _hover={{ textDecoration: 'underline' }}
            >
              PR #{pr.prNumber}
            </Link>

            <Text>•</Text>

            <Link
              href={`https://github.com/opencodeiiita/${pr.issue.repoName}`}
              isExternal
              fontWeight="600"
              _hover={{ textDecoration: 'underline' }}
            >
              {pr.issue.repoName}
            </Link>
          </Flex>

          {/* STATUS & POINTS */}
          <Flex mt="12px" align="center" justify="space-between" flexWrap="wrap" gap="10px">
            <Flex align="center" gap="8px">
              <Text fontSize="sm" color={textSecondary}>
                Status
              </Text>
              <Box
                {...statusStyles}
                px="10px"
                py="2px"
                borderRadius="full"
                fontWeight="700"
                fontSize="12px"
                textTransform="capitalize"
              >
                {pr.status}
              </Box>
            </Flex>
            {status === 'merged' && (
              <Flex
                align="center"
                gap="6px"
                bg="var(--accent-soft)"
                border="1px solid var(--border)"
                px="10px"
                py="3px"
                borderRadius="8px"
              >
                <Text fontSize="xs" fontWeight="700" color="var(--accent)">POINTS</Text>
                <Text fontSize="sm" fontWeight="800" color="var(--fg)" fontFamily="var(--f-mono)">
                  +{pr.issue.currentPoints}
                </Text>
              </Flex>
            )}
          </Flex>
        </Box>
      </Flex>
    </Card>
  );
}

