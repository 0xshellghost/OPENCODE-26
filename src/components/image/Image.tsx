import { Box, Icon } from '@chakra-ui/react';
import NextImage from 'next/image';
import { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

export const Image = (props: any) => {
  const { src, alt, fallbackSrc, onError, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      return;
    }
    setHasError(true);
    if (onError) {
      onError();
    }
  };

  if (!imgSrc || hasError) {
    return (
      <Box
        overflow="hidden"
        position="relative"
        bg="var(--card-soft)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        {...rest}
      >
        <Icon as={ImageOff} color="var(--fg-muted)" boxSize="28px" />
      </Box>
    );
  }

  const isRemote = typeof imgSrc === 'string' && (imgSrc.startsWith('http://') || imgSrc.startsWith('https://'));

  return (
    <Box overflow="hidden" position="relative" {...rest}>
      <NextImage
        fill
        src={imgSrc}
        alt={alt || ''}
        style={{ objectFit: 'cover' }}
        unoptimized={isRemote}
        onError={handleError}
      />
    </Box>
  );
};

