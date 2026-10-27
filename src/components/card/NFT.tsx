'use client';
// Chakra imports
import {
  AspectRatio,
  Box,
  Button,
  Flex,
  Link,
  Text,
} from '@chakra-ui/react';
// Custom components
import Card from 'components/card/Card';

import { Image } from 'components/image/Image';

export default function NFT(props: {
  image: string;
  name: string;
  des: string;
  download: string;
  logoImage?: string;
}) {
  const { image, name, des, download, logoImage } = props;
  const textColor = 'var(--fg)';
  const logoBorderColor = 'var(--border)';

  return (
    <Card
      p={{ base: '16px', sm: '20px' }}
      className="shadow-lg"
      maxW={{ base: '100%', sm: '360px', lg: '420px' }}
      w="100%"
    >
      <Flex direction={{ base: 'column' }} justify="center" align="center">
        <Box mb={{ base: '18px', md: '20px' }} position="relative" w="100%">
          <AspectRatio ratio={16 / 9}>
            <Image
              src={image}
              w={'100%'}
              borderRadius="16px"
              alt={name ? decodeURIComponent(name) : 'Event cover image'}
            />
          </AspectRatio>
          {logoImage && (
            <Box
              position="absolute"
              bottom="-12px"
              left="16px"
              w="48px"
              h="48px"
              borderRadius="14px"
              overflow="hidden"
              border="2px solid"
              borderColor={logoBorderColor}
              bg="var(--surface-2)"
              boxShadow="0 4px 12px rgba(0,0,0,0.3)"
              zIndex={2}
            >
              <Image
                src={logoImage}
                w="100%"
                h="100%"
                objectFit="cover"
                alt={name ? `${decodeURIComponent(name)} logo` : 'Event logo'}
              />
            </Box>
          )}
        </Box>

        <Flex
          flexDirection="column"
          justify="center"
          align="center"
          h="100%"
          textAlign="center"
        >
          <Flex direction="column" align="center" justify="center" mb="12px">
            <Text
              color={textColor}
              fontSize={{ base: 'xl', md: '2xl' }}
              mb="6px"
              fontWeight="700"
            >
              {(() => {
                try {
                  return decodeURIComponent(name || '');
                } catch (_err) {
                  return name;
                }
              })()}
            </Text>
            <Text
              color="var(--fg-muted)"
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight="400"
              maxW="90%"
            >
              {des}
            </Text>
          </Flex>

          <Flex mt="8px" justify="center" w="100%">
            <Link href={download}>
              <Button
                variant="brand"
                size="md"
              >
                Leaderboard
              </Button>
            </Link>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
