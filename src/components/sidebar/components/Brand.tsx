import { Box, Flex, Text } from '@chakra-ui/react';
import Link from 'next/link';

import { HorizonLogo } from 'components/icons/Icons';
import { HSeparator } from 'components/separator/Separator';

export function SidebarBrand() {
  const textColor = 'var(--fg)';
  const mutedText = 'var(--fg-muted)';
  const accentColor = 'var(--accent)';

  return (
    <Flex align="center" direction="column" py="24px" px="16px">
      <Link href="/user/events">
        <Box cursor="pointer" textAlign="center">
          <Box mb="12px">
            <HorizonLogo h="70px" w="70px" color={textColor} />
          </Box>

          <Box position="relative" display="inline-block">
            <Text
              fontSize="22px"
              fontWeight="800"
              letterSpacing="-0.8px"
              color={textColor}
            >
              Geekhaven Events
            </Text>

            <Flex
              position="absolute"
              right="0"
              bottom="-6px"
              align="center"
              gap="6px"
            >
              <Box w="22px" h="2.5px" bg={accentColor} borderRadius="full" />
              <Box w="5px" h="5px" bg={accentColor} borderRadius="full" />
            </Flex>
          </Box>

          <Text fontSize="12px" color={mutedText} mt="10px">
            Open source • Events • Community
          </Text>
        </Box>
      </Link>

      <HSeparator my="24px" />
    </Flex>
  );
}

export default SidebarBrand;
