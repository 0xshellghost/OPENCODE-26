import { Box, Flex, Icon } from '@chakra-ui/react';
import NextImage from 'next/image';
import { useState } from 'react';
import { MdImageNotSupported } from 'react-icons/md';

export const Image = (props: any) => {
  const { src, alt, ...rest } = props;
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <Box
        overflow="hidden"
        position="relative"
        bg="whiteAlpha.100"
        display="flex"
        alignItems="center"
        justifyContent="center"
        {...rest}
      >
        <Icon as={MdImageNotSupported} color="gray.500" boxSize="28px" />
      </Box>
    );
  }

  const isRemote = typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'));

  return (
    <Box overflow="hidden" position="relative" {...rest}>
      <NextImage
        fill
        src={src}
        alt={alt || ''}
        style={{ objectFit: 'cover' }}
        unoptimized={isRemote}
        onError={() => setHasError(true)}
      />
    </Box>
  );
};
