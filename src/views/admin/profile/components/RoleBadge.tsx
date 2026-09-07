'use client';

import {
  Flex,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { isMaintainer } from 'constants/Maintainers';
import { Crown, Globe, GraduationCap } from 'lucide-react';

export interface RoleTag {
  key: string;
  label: string;
  type: 'mentor' | 'iiita' | 'other';
}

export function getRoleTags(
  profile?: {
    githubId?: string;
    college?: string;
    role?: string;
  },
  fallbackGithubId?: string,
): RoleTag[] {
  const tags: RoleTag[] = [];
  const effectiveGithubId = profile?.githubId || fallbackGithubId;

  // 1. Check Mentor status
  const isMentor =
    Boolean(effectiveGithubId && isMaintainer(effectiveGithubId)) ||
    profile?.role?.toLowerCase() === 'mentor' ||
    profile?.role?.toLowerCase() === 'maintainer';

  if (isMentor) {
    tags.push({
      key: 'mentor',
      label: 'Mentor',
      type: 'mentor',
    });
  }

  // 2. Check College / Affiliation status
  const collegeStr = (profile?.college || '').trim().toLowerCase();
  const isIIITA =
    collegeStr === 'iiit allahabad' ||
    collegeStr === 'iiita' ||
    collegeStr === 'iiit-a' ||
    collegeStr.includes('allahabad') ||
    collegeStr.includes('iiit');

  if (collegeStr) {
    if (isIIITA) {
      tags.push({
        key: 'iiita',
        label: 'IIIT A',
        type: 'iiita',
      });
    } else {
      tags.push({
        key: 'other',
        label: 'Other',
        type: 'other',
      });
    }
  } else if (isMentor) {
    // Mentors from IIIT Allahabad without explicit college default to IIIT A
    tags.push({
      key: 'iiita',
      label: 'IIIT A',
      type: 'iiita',
    });
  } else if (profile || fallbackGithubId) {
    tags.push({
      key: 'other',
      label: 'Other',
      type: 'other',
    });
  }

  return tags;
}

export function RoleBadge({ tag }: { tag: RoleTag }) {
  const isDark = useColorModeValue(false, true);

  const configs = {
    mentor: {
      bg: isDark ? 'rgba(245, 158, 11, 0.16)' : 'rgba(245, 158, 11, 0.12)',
      border: isDark ? 'rgba(245, 158, 11, 0.45)' : 'rgba(217, 119, 6, 0.35)',
      color: isDark ? '#FBBF24' : '#B45309',
      icon: Crown,
      glow: isDark ? '0 0 12px rgba(245, 158, 11, 0.25)' : 'none',
    },
    iiita: {
      bg: isDark ? 'rgba(124, 58, 237, 0.18)' : 'rgba(124, 58, 237, 0.1)',
      border: isDark ? 'rgba(139, 92, 246, 0.45)' : 'rgba(109, 40, 217, 0.3)',
      color: isDark ? '#C4B5FD' : '#6D28D9',
      icon: GraduationCap,
      glow: isDark ? '0 0 12px rgba(124, 58, 237, 0.25)' : 'none',
    },
    other: {
      bg: isDark ? 'rgba(14, 165, 233, 0.16)' : 'rgba(14, 165, 233, 0.1)',
      border: isDark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(2, 132, 199, 0.3)',
      color: isDark ? '#7DD3FC' : '#0369A1',
      icon: Globe,
      glow: isDark ? '0 0 12px rgba(14, 165, 233, 0.25)' : 'none',
    },
  };

  const current = configs[tag.type] || configs.other;
  const IconComponent = current.icon;

  return (
    <Flex
      as="span"
      align="center"
      gap="5px"
      px="10px"
      py="3px"
      borderRadius="full"
      fontSize="12px"
      fontWeight="700"
      letterSpacing="0.3px"
      bg={current.bg}
      border="1px solid"
      borderColor={current.border}
      color={current.color}
      boxShadow={current.glow}
      transition="all 0.2s ease"
      _hover={{
        transform: 'translateY(-1px)',
        boxShadow: isDark
          ? '0 4px 14px rgba(0,0,0,0.4)'
          : '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <IconComponent size={13} strokeWidth={2.4} />
      <Text as="span" lineHeight="1">
        {tag.label}
      </Text>
    </Flex>
  );
}

export function RoleBadgesGroup({
  tags,
  mt,
  mb,
}: {
  tags: RoleTag[];
  mt?: any;
  mb?: any;
}) {
  if (!tags || tags.length === 0) return null;

  return (
    <Flex
      justify="center"
      align="center"
      gap="8px"
      mt={mt}
      mb={mb}
      flexWrap="wrap"
    >
      {tags.map((tag) => (
        <RoleBadge key={tag.key} tag={tag} />
      ))}
    </Flex>
  );
}
