'use client';

import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import { NextAvatar } from 'components/image/Avatar';
import { Pencil } from 'lucide-react';
import { RoleBadgesGroup, RoleTag } from './RoleBadge';
import { opencodeTokens } from '../../../../theme/opencode-tokens';

export default function Banner(props: {
  banner?: string;
  avatar: string;
  name: string;
  githubUrl: string;
  prMerged: number;
  prContributed?: number;
  pointsEarned: number;
  tags?: RoleTag[];
  showEdit?: boolean;
  onEdit?: () => void;
  [x: string]: any;
}) {
  const {
    banner,
    avatar,
    name,
    githubUrl,
    prMerged,
    pointsEarned,
    tags,
    showEdit,
    onEdit,
    ...rest
  } = props;

  const cardBg = 'transparent';
  const borderColor = 'transparent';

  const textPrimary = opencodeTokens.colors.text.primary;
  const textSecondary = opencodeTokens.colors.text.secondary;
  const hintColor = opencodeTokens.colors.text.secondary;

  const avatarBorder = opencodeTokens.colors.accent.sakura;
  const avatarShadow = `0 0 20px ${opencodeTokens.colors.accent.sakuraHover}`;

  const statBg = opencodeTokens.colors.background.glassDark;

  return (
    <Card
      p="28px"
      textAlign="center"
      bg="linear-gradient(135deg, rgba(233, 167, 178, 0.15), rgba(233, 167, 178, 0.05))"
      backdropFilter="blur(20px)"
      borderColor="rgba(233, 167, 178, 0.3)"
      borderWidth="1px"
      borderStyle="solid"
      boxShadow="0 8px 32px 0 rgba(233, 167, 178, 0.2)"
      borderRadius="22px"
      {...rest}
      minH="410px"
      height="auto"
    >
      <Flex justify="center" mb="14px">
  <NextAvatar
    src={avatar}
    name={name}
    h="130px"
    w="130px"
    border="4px solid"
    borderColor={avatarBorder}
    boxShadow={avatarShadow}
  />
</Flex>


      {/* Name */}
      <Text
        color={textPrimary}
        fontWeight="800"
        fontSize="xl"
        lineHeight="1.2"
      >
        {name}
      </Text>

      {/* GitHub */}
      <Text
        color={textSecondary}
        fontSize="sm"
        mb={tags && tags.length > 0 ? '8px' : '22px'}
      >
        @{githubUrl}
      </Text>

      {/* Role Tags */}
      {tags && tags.length > 0 && (
        <RoleBadgesGroup tags={tags} mb="18px" />
      )}

      {showEdit && (
        <Button
          leftIcon={<Pencil size={14} />}
          size="sm"
          colorScheme="purple"
          variant="outline"
          borderRadius="12px"
          mb="18px"
          onClick={onEdit}
        >
          Edit Profile
        </Button>
      )}

      {/* Stats */}
      <Flex
        w="100%"
        maxW="360px"
        mx="auto"
        justify="space-between"
        mb="10px"
        gap="12px"
      >
        <Box
          flex="1"
          bg={statBg}
          borderRadius="14px"
          p="14px"
          border={`1px solid ${opencodeTokens.colors.border.light}`}
        >
          <Text
            color={textPrimary}
            fontSize="26px"
            fontWeight="900"
            lineHeight="1"
          >
            {prMerged}
          </Text>
          <Text
            color={textSecondary}
            fontSize="sm"
            mt="4px"
          >
            PRs Merged
          </Text>
        </Box>

        <Box
          flex="1"
          bg={statBg}
          borderRadius="14px"
          p="14px"
          border={`1px solid ${opencodeTokens.colors.border.light}`}
        >
          <Text
            color={textPrimary}
            fontSize="26px"
            fontWeight="900"
            lineHeight="1"
          >
            {pointsEarned}
          </Text>
          <Text
            color={textSecondary}
            fontSize="sm"
            mt="4px"
          >
            Points Earned
          </Text>
        </Box>
      </Flex>

      {/* Empty state hint */}
      {prMerged === 0 && pointsEarned === 0 && (
        <Text
          mt="14px"
          fontSize="sm"
          color={hintColor}
        >
          Start contributing to see your stats grow
        </Text>
      )}
    </Card>
  );
}
