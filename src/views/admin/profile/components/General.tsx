'use client';

import {
  Box,
  Flex,
  Grid,
  GridItem,
  Icon,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { User, Globe, GraduationCap, Calendar, Mail, Sparkles } from 'lucide-react';
import { FaGithub, FaDiscord } from 'react-icons/fa';

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

  const itemBg = 'var(--card-soft)';
  const itemBorder = 'var(--border)';

  const Item = ({
    label,
    value,
    icon,
    colSpan,
    noClamp,
  }: {
    label: string;
    value?: string;
    icon?: any;
    colSpan?: any;
    noClamp?: boolean;
  }) => (
    <GridItem colSpan={colSpan || { base: 1, sm: 1 }}>
      <Box
        bg={itemBg}
        border="1px solid"
        borderColor={itemBorder}
        borderRadius="16px"
        p="12px 14px"
        h="100%"
        transition="all 0.3s ease"
        _hover={{
          borderColor: 'var(--accent)',
          bg: 'var(--accent-soft)',
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <Flex align="center" justify="space-between" gap="10px" h="100%">
          <Box minW={0} flex="1">
            <Text
              fontSize="10px"
              fontWeight="700"
              color="var(--muted)"
              textTransform="uppercase"
              letterSpacing="0.8px"
              mb="3px"
            >
              {label}
            </Text>
            <Tooltip
              label={value || '—'}
              placement="top"
              hasArrow
              isDisabled={!value || value.length < 25}
            >
              <Text
                fontSize="13px"
                fontWeight="700"
                color="var(--fg)"
                lineHeight="1.35"
                wordBreak="break-word"
                noOfLines={noClamp ? undefined : 1}
              >
                {value || '—'}
              </Text>
            </Tooltip>
          </Box>
          {icon && (
            <Flex
              align="center"
              justify="center"
              w="32px"
              h="32px"
              borderRadius="10px"
              bg="var(--accent-soft)"
              border="1px solid var(--border)"
              flexShrink={0}
              color="var(--accent)"
            >
              <Icon as={icon} w="15px" h="15px" />
            </Flex>
          )}
        </Flex>
      </Box>
    </GridItem>
  );

  return (
    <Box h="100%" display="flex" flexDirection="column" justifyContent="space-between" {...rest}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb="16px">
        <Text
          fontSize="15px"
          fontWeight="700"
          color="var(--fg)"
        >
          General Information
        </Text>
        <Text fontSize="12px" color="var(--muted)" fontFamily="var(--f-mono)">
          Profile Details
        </Text>
      </Flex>

      {/* Grid */}
      <Grid
        templateColumns={{
          base: '1fr',
          sm: 'repeat(2, 1fr)',
        }}
        gap="11px"
      >
        <Item label="Name" value={name} icon={User} />
        <Item label="GitHub" value={`@${githubId}`} icon={FaGithub} />
        <Item
          label="College"
          value={college || '—'}
          icon={GraduationCap}
          colSpan={{ base: 1, sm: 2 }}
          noClamp
        />
        <Item label="Role & Affiliation" value={role || 'Contributor'} icon={Globe} />
        <Item label="Year" value={year || '—'} icon={Calendar} />
        <Item
          label="Gender"
          value={
            gender
              ? gender.toLowerCase() === 'male'
                ? 'Male'
                : gender.toLowerCase() === 'female'
                  ? 'Female'
                  : gender.toLowerCase() === 'other'
                    ? 'Other'
                    : gender
              : '—'
          }
          icon={Sparkles}
        />
        <Item label="Discord ID" value={discordId || '—'} icon={FaDiscord} />
        <Item
          label="Email"
          value={email || '—'}
          icon={Mail}
          colSpan={{ base: 1, sm: 2 }}
          noClamp
        />
      </Grid>
    </Box>
  );
}
