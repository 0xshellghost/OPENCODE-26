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

  const textPrimary = '#fff1ec';
  const textSecondary = '#dfced5';
  const avatarBorder = 'rgba(240, 168, 184, 0.5)';
  const avatarShadow = '0 0 28px rgba(240, 168, 184, 0.35), 0 8px 24px rgba(0, 0, 0, 0.55)';

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
        <Text fontSize="12px" color={textSecondary} opacity={0.8} fontFamily="var(--f-mono)">
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
          opacity={0.85}
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
          bg="rgba(240, 168, 184, 0.12)"
          color="#fff1ec"
          border="1px solid rgba(240, 168, 184, 0.3)"
          borderRadius="full"
          fontWeight="700"
          fontSize="13px"
          py="18px"
          _hover={{
            bg: 'rgba(240, 168, 184, 0.22)',
            borderColor: '#f0a8b8',
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 20px rgba(240, 168, 184, 0.25)',
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
