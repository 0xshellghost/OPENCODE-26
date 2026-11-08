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
      <Flex
        justify="space-between"
        align="center"
        w="100%"
        mb="20px"
        pb="12px"
        borderBottom="1px solid rgba(174, 188, 199, 0.12)"
      >
        <Text
          fontSize="16px"
          fontWeight="700"
          color={textPrimary}
          letterSpacing="0.02em"
        >
          User Identity
        </Text>
        <Text fontSize="12px" color={textSecondary} fontFamily="var(--f-mono)" letterSpacing="0.08em" textTransform="uppercase">
          Contributor
        </Text>
      </Flex>

      {/* Main Identity Content */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        flex="1"
        py={{ base: '12px', md: '20px' }}
      >
        {/* Avatar with Ambient Luminous Ring */}
        <Box
          position="relative"
          p="4px"
          borderRadius="full"
          bg="linear-gradient(135deg, var(--border-accent) 0%, rgba(174, 188, 199, 0.25) 50%, var(--border-accent) 100%)"
          boxShadow="0 12px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(88, 185, 154, 0.22)"
          transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          mb="20px"
          _hover={{
            transform: 'scale(1.03)',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.7), 0 0 32px rgba(88, 185, 154, 0.35)',
          }}
        >
          <NextAvatar
            src={avatar}
            name={name}
            h={{ base: '124px', md: '144px' }}
            w={{ base: '124px', md: '144px' }}
            border="3px solid var(--navy-500)"
          />
        </Box>

        {/* Name */}
        <Text
          color={textPrimary}
          fontWeight="800"
          fontSize={{ base: '24px', md: '28px' }}
          lineHeight="1.2"
          textAlign="center"
          letterSpacing="-0.01em"
        >
          {name}
        </Text>

        {/* GitHub handle */}
        <Text
          as="a"
          href={githubUrl ? `https://github.com/${githubUrl}` : undefined}
          target="_blank"
          rel="noopener noreferrer"
          color="var(--accent)"
          fontSize="14px"
          fontWeight="600"
          mt="6px"
          mb={tags && tags.length > 0 ? '14px' : '22px'}
          textAlign="center"
          transition="color 0.2s ease"
          _hover={{ color: 'var(--accent-hover)', textDecoration: 'underline' }}
        >
          @{githubUrl}
        </Text>

        {/* Role Tags */}
        {tags && tags.length > 0 && (
          <RoleBadgesGroup tags={tags} mb="20px" />
        )}
      </Flex>

      {/* Edit Profile Button */}
      {showEdit && (
        <Button
          leftIcon={<Pencil size={15} />}
          w="100%"
          maxW="280px"
          h="44px"
          mx="auto"
          mt="auto"
          bg="var(--accent-soft)"
          color="var(--fg)"
          border="1px solid var(--border-accent)"
          borderRadius="full"
          fontWeight="700"
          fontSize="14px"
          letterSpacing="0.02em"
          _hover={{
            bg: 'var(--accent)',
            color: 'var(--accent-ink)',
            borderColor: 'var(--accent)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(88, 185, 154, 0.35)',
          }}
          transition="all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
          onClick={onEdit}
        >
          Edit Profile
        </Button>
      )}
    </Box>
  );
}
