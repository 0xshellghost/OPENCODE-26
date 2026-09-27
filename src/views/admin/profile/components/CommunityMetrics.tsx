'use client';

import {
  Box,
  Flex,
  Grid,
  Icon,
  Text,
} from '@chakra-ui/react';
import { opencodeTokens } from '../../../../theme/opencode-tokens';
import { GitMerge, Star, Award } from 'lucide-react';

interface CommunityMetricsProps {
  prMerged: number;
  pointsEarned: number;
}

export default function CommunityMetrics({ prMerged, pointsEarned }: CommunityMetricsProps) {
  const textPrimary = opencodeTokens.colors.text.primary;
  const textSecondary = opencodeTokens.colors.text.secondary;

  const statCardBg = opencodeTokens.colors.background.glassDark;
  const statBorder = opencodeTokens.colors.border.light;

  const isEmpty = prMerged === 0 && pointsEarned === 0;

  return (
    <Box h="100%">
      {/* Section Title */}
      <Text
        fontSize="15px"
        fontWeight="700"
        color={textPrimary}
        mb="20px"
      >
        Community Metrics
      </Text>

      {/* Stat Cards */}
      <Grid
        templateColumns="1fr 1fr"
        gap="14px"
        mb="16px"
      >
        {/* Merged */}
        <Box
          bg={statCardBg}
          border="1px solid"
          borderColor={statBorder}
          borderRadius="16px"
          p="18px"
          textAlign="center"
          position="relative"
          overflow="hidden"
          transition="all 0.3s ease"
          _hover={{
            borderColor: '#785255',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(120, 82, 85, 0.2)',
          }}
        >
          {/* Icon top-left */}
          <Flex
            position="absolute"
            top="10px"
            left="10px"
            align="center"
            justify="center"
            w="28px"
            h="28px"
            borderRadius="8px"
            bg="rgba(120, 82, 85, 0.15)"
            border="1px solid rgba(120, 82, 85, 0.3)"
          >
            <Icon as={GitMerge} w="14px" h="14px" color="#B88784" />
          </Flex>

          <Text
            fontSize="36px"
            fontWeight="900"
            lineHeight="1"
            color={textPrimary}
            mt="10px"
          >
            {prMerged}
          </Text>
          <Text
            fontSize="12px"
            fontWeight="600"
            color={textSecondary}
            mt="6px"
          >
            Merged
          </Text>
        </Box>

        {/* Points Earned */}
        <Box
          bg={statCardBg}
          border="1px solid"
          borderColor={statBorder}
          borderRadius="16px"
          p="18px"
          textAlign="center"
          position="relative"
          overflow="hidden"
          transition="all 0.3s ease"
          _hover={{
            borderColor: '#785255',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(120, 82, 85, 0.2)',
          }}
        >
          {/* Icon top-left */}
          <Flex
            position="absolute"
            top="10px"
            left="10px"
            align="center"
            justify="center"
            w="28px"
            h="28px"
            borderRadius="8px"
            bg="rgba(120, 82, 85, 0.15)"
            border="1px solid rgba(120, 82, 85, 0.3)"
          >
            <Icon as={Star} w="14px" h="14px" color="#B88784" />
          </Flex>

          {/* Decorative star top-right */}
          <Flex
            position="absolute"
            top="10px"
            right="10px"
            align="center"
            justify="center"
            w="28px"
            h="28px"
            borderRadius="8px"
            bg="rgba(184, 135, 132, 0.1)"
            border="1px solid rgba(184, 135, 132, 0.2)"
          >
            <Icon as={Award} w="14px" h="14px" color="#CF9690" />
          </Flex>

          <Text
            fontSize="36px"
            fontWeight="900"
            lineHeight="1"
            color={textPrimary}
            mt="10px"
          >
            {pointsEarned}
          </Text>
          <Text
            fontSize="12px"
            fontWeight="600"
            color={textSecondary}
            mt="6px"
          >
            Points Earned
          </Text>
        </Box>
      </Grid>

      {/* Empty state hint */}
      {isEmpty && (
        <Text
          fontSize="13px"
          color={textSecondary}
          textAlign="center"
          mt="6px"
        >
          Start contributing to see your stats grow.
        </Text>
      )}
    </Box>
  );
}
