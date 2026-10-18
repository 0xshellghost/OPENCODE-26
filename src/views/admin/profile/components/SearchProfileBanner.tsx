'use client';

import {
  Box,
  Flex,
  Input,
} from '@chakra-ui/react';
import { Search } from 'lucide-react';

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
      bg="var(--surface)"
      borderRadius="16px"
      border="1px solid var(--border)"
      backdropFilter="blur(20px)"
      boxShadow="var(--shadow)"
      w={w || { base: '100%', sm: '280px', md: '340px' }}
      transition="all 0.3s ease"
      _hover={{
        borderColor: 'var(--accent)',
      }}
      _focusWithin={{
        borderColor: 'var(--accent)',
        boxShadow: '0 0 15px var(--accent-hover)',
      }}
    >
      <Box
        color="var(--accent)"
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
        color="var(--fg)"
        _placeholder={{ color: 'var(--muted)' }}
      />
    </Flex>
  );
}


