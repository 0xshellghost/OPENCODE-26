import {
  Box,
  Flex,
  Icon,
  Link,
  Text,
  Badge,
} from '@chakra-ui/react';
import { opencodeTokens } from '../../../../theme/opencode-tokens';
import { PullRequest } from 'app/user/profile/page';
import Card from 'components/card/Card';
import { FaGithub, FaCodeBranch } from 'react-icons/fa';

export default function Project({ pr }: { pr: PullRequest }) {
  const textPrimary = '#fff1ec';
  const textSecondary = '#dfced5';

  const status = pr.status.toLowerCase();
  const statusStyles =
    status === 'merged'
      ? { bg: 'rgba(104, 211, 145, 0.18)', color: '#68D391', border: '1px solid rgba(104, 211, 145, 0.35)' }
      : status === 'open'
      ? { bg: 'rgba(183, 148, 244, 0.18)', color: '#B794F4', border: '1px solid rgba(183, 148, 244, 0.35)' }
      : status === 'rejected'
      ? { bg: 'rgba(252, 129, 129, 0.18)', color: '#FC8181', border: '1px solid rgba(252, 129, 129, 0.35)' }
      : { bg: 'rgba(255, 255, 255, 0.1)', color: '#dfced5', border: '1px solid rgba(255, 255, 255, 0.2)' };

  return (
    <Card
      bg="rgba(240, 168, 184, 0.05)"
      backdropFilter="blur(20px)"
      p="16px"
      borderRadius="16px"
      border="1px solid rgba(240, 168, 184, 0.18)"
      transition="all 0.3s ease"
      boxShadow="0 4px 15px 0 rgba(0, 0, 0, 0.25)"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 28px 0 rgba(0, 0, 0, 0.45)',
        borderColor: '#f0a8b8',
        bg: 'rgba(240, 168, 184, 0.09)',
      }}
    >
      <Flex gap="14px" align="flex-start">
        {/* ICON */}
        <Box
          p="10px"
          borderRadius="12px"
          bg="rgba(240, 168, 184, 0.14)"
          border="1px solid rgba(240, 168, 184, 0.3)"
          color="#f0a8b8"
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
              <Text fontSize="sm" color={textSecondary} opacity={0.85}>
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
                bg="rgba(240, 168, 184, 0.12)"
                border="1px solid rgba(240, 168, 184, 0.25)"
                px="10px"
                py="3px"
                borderRadius="8px"
              >
                <Text fontSize="xs" fontWeight="700" color="#f0a8b8">POINTS</Text>
                <Text fontSize="sm" fontWeight="800" color="#fff1ec" fontFamily="var(--f-mono)">
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

