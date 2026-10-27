'use client';

import { Flex, Link, Text } from '@chakra-ui/react';

export default function Footer() {
  return (
    <Flex
      zIndex="3"
      flexDirection={{ base: 'column', xl: 'row' }}
      alignItems="center"
      justifyContent="space-between"
      px={{ base: '20px', md: '40px' }}
      py="24px"
      borderTop="1px solid var(--border)"
      color="var(--fg-muted)"
      fontSize="13px"
    >
      <Text textAlign="center">
        &copy; {new Date().getFullYear()}{' '}
        <span>Made with ❤️ by </span>
        <Link
          href="https://geekhaven.iiita.ac.in/"
          target="_blank"
          rel="noopener noreferrer"
          color="var(--accent)"
          fontWeight="600"
          _hover={{ textDecoration: 'underline' }}
        >
          Geekhaven
        </Link>
      </Text>
      <Link
        href="/user/events"
        color="var(--fg-muted)"
        _hover={{ color: 'var(--accent)' }}
        mt={{ base: '8px', xl: '0' }}
      >
        Return to Portal →
      </Link>
    </Flex>
  );
}
