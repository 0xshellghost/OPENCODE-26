import {
  Box,
  Flex,
  Icon,
  Link,
  Text,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { PullRequest } from 'app/user/profile/page';
import Card from 'components/card/Card';
import { FaGithub, FaCodeBranch } from 'react-icons/fa';

export default function Project({ pr }: { pr: PullRequest }) {
  const textPrimary = useColorModeValue('gray.800', 'white');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');

  const cardBg = useColorModeValue('gray.50', 'rgba(15,23,42,0.8)');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconBg = useColorModeValue('purple.50', 'navy.800');
  const iconColor = useColorModeValue('purple.500', 'gray.300');

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
      bg={cardBg}
      p="16px"
      borderRadius="16px"
      border="1px solid"
      borderColor={borderColor}
      transition="all 0.25s ease"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
        borderColor: 'purple.300',
        bg: useColorModeValue('white', 'rgba(15,23,42,0.9)'),
      }}
    >
      <Flex gap="14px" align="flex-start">
        {/* ICON */}
        <Box
          p="10px"
          borderRadius="12px"
          bg={iconBg}
          border="1px solid"
          borderColor={useColorModeValue('purple.100', 'transparent')}
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
            {/*Need to add conditional rendering logic */}
            <Flex align="center" gap="6px" bg={useColorModeValue('purple.50', 'rgba(117,95,255,0.1)')} px="10px" py="4px" borderRadius="8px">
              <Text fontSize="xs" fontWeight="700" color="purple.500">POINTS</Text>
              <Text fontSize="sm" fontWeight="800" color={useColorModeValue('purple.700', 'purple.300')}>
                +{pr.issue.currentPoints}
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Card>
  );
}

