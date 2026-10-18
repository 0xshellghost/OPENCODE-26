'use client';

import {
  Box,
  Button,
  Flex,
  Text,
} from '@chakra-ui/react';
import { NextAvatar } from 'components/image/Avatar';
import { Pencil } from 'lucide-react';
import { RoleBadgesGroup, RoleTag } from './RoleBadge';
import { opencodeTokens } from '../../../../theme/opencode-tokens';

export default function Banner(props: {
  avatar: string;
  name: string;
  githubUrl: string;
  tags?: RoleTag[];
  showEdit?: boolean;
  onEdit?: () => void;
  [x: string]: any;
}) {
  const {
    avatar,
    name,
    githubUrl,
    tags,
    showEdit,
    onEdit,
    ...rest
  } = props;

  const textPrimary = 'var(--fg)';
  const textSecondary = 'var(--muted)';
  const avatarBorder = 'var(--border-strong)';
  const avatarShadow = 'var(--shadow)';

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      h="100%"
      w="100%"
      {...rest}
    >
      {/* Title */}
      <Flex justify="space-between" align="center" w="100%" mb="16px">
        <Text
          fontSize="15px"
          fontWeight="700"
          color={textPrimary}
        >
          User Identity
        </Text>
        <Text fontSize="12px" color={textSecondary} fontFamily="var(--f-mono)">
          Contributor
        </Text>
      </Flex>

      {/* Main Identity Content */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        flex="1"
        py="8px"
      >
        {/* Avatar */}
        <Flex justify="center" mb="16px">
          <NextAvatar
            src={avatar}
            name={name}
            h="128px"
            w="128px"
            border="3.5px solid"
            borderColor={avatarBorder}
            boxShadow={avatarShadow}
          />
        </Flex>

        {/* Name */}
        <Text
          color={textPrimary}
          fontWeight="800"
          fontSize="22px"
          lineHeight="1.2"
          textAlign="center"
        >
          {name}
        </Text>

        {/* GitHub handle */}
        <Text
          color={textSecondary}
          fontSize="14px"
          mt="4px"
          mb={tags && tags.length > 0 ? '10px' : '16px'}
          textAlign="center"
        >
          @{githubUrl}
        </Text>

        {/* Role Tags */}
        {tags && tags.length > 0 && (
          <RoleBadgesGroup tags={tags} mb="16px" />
        )}
      </Flex>

      {/* Edit Profile Button */}
      {showEdit && (
        <Button
          leftIcon={<Pencil size={14} />}
          size="sm"
          w="100%"
          maxW="260px"
          mx="auto"
          bg="var(--accent-soft)"
          color="var(--fg)"
          border="1px solid var(--border)"
          borderRadius="full"
          fontWeight="700"
          fontSize="13px"
          py="18px"
          _hover={{
            bg: 'var(--accent-soft)',
            borderColor: 'var(--accent)',
            transform: 'translateY(-1px)',
            boxShadow: 'var(--shadow)',
          }}
          transition="all 0.3s ease"
          onClick={onEdit}
        >
          Edit Profile
        </Button>
      )}
    </Box>
  );
}
