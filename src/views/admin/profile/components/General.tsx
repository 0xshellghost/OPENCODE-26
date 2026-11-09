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
  <GridItem colSpan={colSpan || { base: 1, md: 1 }}>
    <Box
      bg="var(--card-soft)"
      border="1px solid"
      borderColor="var(--border)"
      borderRadius="18px"
      p={{ base: '16px 18px', md: '18px 22px' }}
      minH="76px"
      h="100%"
      transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      _hover={{
        borderColor: 'var(--accent)',
        bg: 'var(--card-strong)',
        transform: 'translateY(-2px)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <Flex align="center" justify="space-between" gap="16px" h="100%">
        <Box minW={0} flex="1">
          <Text
            fontSize="11px"
            fontWeight="700"
            color="var(--muted)"
            textTransform="uppercase"
            letterSpacing="0.08em"
            mb="4px"
          >
            {label}
          </Text>
          <Tooltip
            label={value || '-'}
            placement="top"
            hasArrow
            isDisabled={!value || value.length < 35}
          >
            <Text
              fontSize={{ base: '14px', md: '15px' }}
              fontWeight="700"
              color="var(--fg)"
              lineHeight="1.4"
              wordBreak="break-word"
              noOfLines={noClamp ? undefined : 1}
            >
              {value || '-'}
            </Text>
          </Tooltip>
        </Box>
        {icon && (
          <Flex
            align="center"
            justify="center"
            w="40px"
            h="40px"
            borderRadius="12px"
            bg="var(--accent-soft)"
            border="1px solid var(--border)"
            flexShrink={0}
            color="var(--accent)"
            transition="all 0.25s ease"
          >
            <Icon as={icon} w="18px" h="18px" />
          </Flex>
        )}
      </Flex>
    </Box>
  </GridItem>
);

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

  return (
    <Box h="100%" display="flex" flexDirection="column" justifyContent="space-between" {...rest}>
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        mb="20px"
        pb="12px"
        borderBottom="1px solid rgba(174, 188, 199, 0.12)"
      >
        <Text
          fontSize="16px"
          fontWeight="700"
          color="var(--fg)"
          letterSpacing="0.02em"
        >
          General Information
        </Text>
        <Text fontSize="12px" color="var(--muted)" fontFamily="var(--f-mono)" letterSpacing="0.08em" textTransform="uppercase">
          Profile Details
        </Text>
      </Flex>

      {/* Grid */}
      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
        }}
        gap={{ base: '14px', md: '18px' }}
      >
        <Item label="Name" value={name} icon={User} />
        <Item label="GitHub" value={`@${githubId}`} icon={FaGithub} />
        <Item
          label="College"
          value={college || '-'}
          icon={GraduationCap}
          colSpan={{ base: 1, md: 2 }}
          noClamp
        />
        <Item label="Role & Affiliation" value={role || 'Contributor'} icon={Globe} />
        <Item label="Year" value={year || '-'} icon={Calendar} />
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
              : '-'
          }
          icon={Sparkles}
        />
        <Item label="Discord ID" value={discordId || '-'} icon={FaDiscord} />
        <Item
          label="Email"
          value={email || '-'}
          icon={Mail}
          colSpan={{ base: 1, md: 2 }}
          noClamp
        />
      </Grid>
    </Box>
  );
}
