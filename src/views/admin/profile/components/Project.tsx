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
  const textPrimary = opencodeTokens.colors.text.primary;
  const textSecondary = opencodeTokens.colors.text.secondary;

  const cardBg = opencodeTokens.colors.background.glassDark;
  const borderColor = opencodeTokens.colors.border.light;
  const iconBg = opencodeTokens.colors.background.glassLight;
  const iconColor = opencodeTokens.colors.accent.sakura;

  const status = pr.status.toLowerCase();
  const statusColor =
    status === 'merged'
      ? 'green'
      : status === 'open'
      ? 'purple'
      : status === 'rejected'
      ? 'red'
      : 'gray';

  return (
    <Card
      bg="linear-gradient(135deg, rgba(233, 167, 178, 0.15), rgba(233, 167, 178, 0.05))"
      backdropFilter="blur(20px)"
      p="16px"
      borderRadius="16px"
      border="1px solid rgba(233, 167, 178, 0.3)"
      transition="all 0.3s ease"
      boxShadow="0 4px 15px 0 rgba(233, 167, 178, 0.1)"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: "0 8px 32px 0 rgba(233, 167, 178, 0.2)",
        borderColor: opencodeTokens.colors.accent.sakura,
        bg: "linear-gradient(135deg, rgba(233, 167, 178, 0.2), rgba(233, 167, 178, 0.1))",
      }}
    >
      <Flex gap="14px" align="flex-start">
        {/* ICON */}
        <Box
          p="10px"
          borderRadius="12px"
          bg={iconBg}
          border={`1px solid ${opencodeTokens.colors.border.light}`}
        >
          <Icon as={FaGithub} h="20px" w="20px" color={iconColor} />
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
              <Badge
                colorScheme={statusColor}
                px="10px"
                py="2px"
                borderRadius="full"
                fontWeight="800"
                textTransform="capitalize"
              >
                {pr.status}
              </Badge>
            </Flex>
            {status === 'merged' && (
              <Flex align="center" gap="6px" bg={opencodeTokens.colors.background.glassLight} px="10px" py="4px" borderRadius="8px">
                <Text fontSize="xs" fontWeight="700" color={opencodeTokens.colors.accent.sakura}>POINTS</Text>
                <Text fontSize="sm" fontWeight="800" color={opencodeTokens.colors.accent.sakuraHover}>
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

