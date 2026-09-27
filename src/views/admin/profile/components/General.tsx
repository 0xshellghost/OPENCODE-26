'use client';

import {
  Box,
  Flex,
  Grid,
  Icon,
  Text,
} from '@chakra-ui/react';
import { opencodeTokens } from '../../../../theme/opencode-tokens';
import { User, Globe } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

export default function GeneralInformation(props: {
  name: string;
  githubId: string;
  discordId?: string;
  college?: string;
  email?: string;
  gender?: string;
  year?: string;
  role?: string;
  [x: string]: any;
}) {
  const { name, githubId, discordId, college, email, gender, year, role, ...rest } =
    props;

  const titleColor = opencodeTokens.colors.text.primary;
  const labelColor = opencodeTokens.colors.text.secondary;
  const valueColor = opencodeTokens.colors.text.primary;

  const itemBg = opencodeTokens.colors.background.glassDark;
  const itemBorder = opencodeTokens.colors.border.light;

  const Item = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value?: string;
    icon?: any;
  }) => (
    <Box
      bg={itemBg}
      border="1px solid"
      borderColor={itemBorder}
      borderRadius="14px"
      px="14px"
      py="12px"
      transition="all 0.3s ease"
      _hover={{
        borderColor: '#785255',
        bg: opencodeTokens.colors.background.glassLight,
      }}
    >
      <Flex align="center" justify="space-between">
        <Box>
          <Text
            fontSize="10px"
            fontWeight="700"
            color={labelColor}
            textTransform="uppercase"
            letterSpacing="0.8px"
            mb="4px"
          >
            {label}
          </Text>
          <Text
            fontSize="14px"
            fontWeight="600"
            color={valueColor}
            noOfLines={2}
          >
            {value || '—'}
          </Text>
        </Box>
        {icon && (
          <Flex
            align="center"
            justify="center"
            w="32px"
            h="32px"
            borderRadius="10px"
            bg="rgba(120, 82, 85, 0.12)"
            border="1px solid rgba(120, 82, 85, 0.25)"
            flexShrink={0}
            ml="10px"
          >
            <Icon as={icon} w="16px" h="16px" color="#B88784" />
          </Flex>
        )}
      </Flex>
    </Box>
  );

  return (
    <Box h="100%" {...rest}>
      {/* Header */}
      <Text
        fontSize="15px"
        fontWeight="700"
        color={titleColor}
        mb="20px"
      >
        General Information
      </Text>

      {/* Grid */}
      <Grid
        templateColumns={{
          base: '1fr',
          sm: 'repeat(2, 1fr)',
        }}
        gap="14px"
      >
        <Item label="Name" value={name} icon={User} />
        <Item label="GitHub" value={`@${githubId}`} icon={FaGithub} />
        {role && <Item label="Role & Affiliation" value={role} icon={Globe} />}
        {college && <Item label="College" value={college} />}
        {gender && (
          <Item
            label="Gender"
            value={
              gender.toLowerCase() === 'male'
                ? 'Male'
                : gender.toLowerCase() === 'female'
                  ? 'Female'
                  : gender.toLowerCase() === 'other'
                    ? 'Other'
                    : gender
            }
          />
        )}
        {year && <Item label="Year" value={year} />}
        {discordId && <Item label="Discord ID" value={discordId} />}
        {email && <Item label="Email" value={email} />}
      </Grid>
    </Box>
  );
}
