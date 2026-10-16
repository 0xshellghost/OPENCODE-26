import { chakra, useColorMode } from '@chakra-ui/system'
import { ComponentProps } from 'react'
import { Image } from './Image'

interface AvatarImageProps extends ComponentProps<typeof Image> {
  showBorder?: boolean
  name?: string
}

export function NextAvatar ({
  src,
  name,
  showBorder,
  alt,
  style,
  fallbackSrc,
  ...props
}: AvatarImageProps) {
  const { colorMode } = useColorMode()

  // Generate deterministic fallback avatar from 1 to 10
  const identifier = (typeof alt === 'string' && alt) || (typeof name === 'string' && name) || (typeof src === 'string' && src) || 'user';
  const charCodeSum = identifier.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const fallbackIndex = (Math.abs(charCodeSum) % 10) + 1;
  const defaultFallback = `/img/avatars/avatar${fallbackIndex}.png`;

  return (
    <Image
      {...props}
      {...(showBorder
        ? {
            border: '2px',
            borderColor: colorMode === 'dark' ? 'navy.700' : 'white'
          }
        : {})}
      alt={alt || name || 'Avatar'}
      src={src || defaultFallback}
      fallbackSrc={fallbackSrc || defaultFallback}
      style={{ ...style, borderRadius: '50%' }}
    />
  )
}

export const ChakraNextAvatar = chakra(NextAvatar, {
  shouldForwardProp: (prop:string) => ['width', 'height', 'src', 'alt', 'name', 'fallbackSrc'].includes(prop)
})

