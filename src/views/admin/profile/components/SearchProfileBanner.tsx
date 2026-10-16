'use client';

import {
  Box,
  Flex,
  Input,
} from '@chakra-ui/react';
import { Search } from 'lucide-react';
import { opencodeTokens } from '../../../../theme/opencode-tokens';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  w?: any;
}

export default function SearchProfileBanner({
  value,
  onChange,
  placeholder = 'Search name or GitHub ID',
  w,
}: Props) {
  return (
    <Flex
      align="center"
      gap="10px"
      px={{ base: '14px', md: '18px' }}
      py={{ base: '10px', md: '12px' }}
      bg={opencodeTokens.colors.background.glassDark}
      borderRadius="16px"
      border={`1px solid ${opencodeTokens.colors.border.primary}`}
      backdropFilter="blur(20px)"
      boxShadow={opencodeTokens.shadows.glass}
      w={w || { base: '100%', sm: '280px', md: '340px' }}
      transition="all 0.3s ease"
      _hover={{
        borderColor: opencodeTokens.colors.accent.sakura,
      }}
      _focusWithin={{
        borderColor: opencodeTokens.colors.accent.sakura,
        boxShadow: `0 0 15px ${opencodeTokens.colors.accent.sakuraHover}`
      }}
    >
      <Box
        color={opencodeTokens.colors.accent.sakura}
        display="flex"
        alignItems="center"
      >
        <Search size={18} />
      </Box>

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        variant="unstyled"
        fontSize="14px"
        fontWeight="500"
        color={opencodeTokens.colors.text.primary}
        _placeholder={{ color: opencodeTokens.colors.text.secondary, opacity: 0.85 }}
      />
    </Flex>
  );
}


