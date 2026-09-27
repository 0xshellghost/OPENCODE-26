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

  const textPrimary = opencodeTokens.colors.text.primary;
  const textSecondary = opencodeTokens.colors.text.secondary;
  const avatarBorder = '#785255'; // Sakura from palette
  const avatarShadow = '0 0 24px rgba(120, 82, 85, 0.45)';

  return (
    <Box
      textAlign="center"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      h="100%"
      {...rest}
    >
      {/* Title */}
      <Text
        fontSize="15px"
        fontWeight="700"
        color={textPrimary}
        mb="20px"
        alignSelf="flex-start"
      >
        User Identity
      </Text>

      {/* Avatar */}
      <Flex justify="center" mb="16px">
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
        fontSize="20px"
        lineHeight="1.2"
      >
        {name}
      </Text>

      {/* GitHub handle */}
      <Text
        color={textSecondary}
        fontSize="14px"
        mb={tags && tags.length > 0 ? '10px' : '16px'}
      >
        @{githubUrl}
      </Text>

      {/* Role Tags */}
      {tags && tags.length > 0 && (
        <RoleBadgesGroup tags={tags} mb="16px" />
      )}

      {/* Edit Profile Button */}
      {showEdit && (
        <Button
          leftIcon={<Pencil size={14} />}
          size="sm"
          w="100%"
          maxW="260px"
          bg="linear-gradient(135deg, #3E3843, #60434A)"
          color="#FEF3ED"
          border="1px solid rgba(120, 82, 85, 0.5)"
          borderRadius="14px"
          fontWeight="700"
          fontSize="13px"
          py="18px"
          _hover={{
            bg: 'linear-gradient(135deg, #60434A, #785255)',
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 20px rgba(120, 82, 85, 0.35)',
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
