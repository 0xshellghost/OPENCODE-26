import { Button, Icon, useColorMode } from '@chakra-ui/react';
import { Moon, Sun } from 'lucide-react';

export default function FixedPlugin(props: { [x: string]: any }) {
  const { ...rest } = props;
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Button
      {...rest}
      aria-label="Toggle color theme"
      h="52px"
      w="52px"
      bg="var(--accent)"
      color="var(--accent-ink)"
      zIndex="99"
      position="fixed"
      right={{ base: '20px', md: '35px' }}
      bottom={{ base: '80px', md: '30px' }}
      border="1px solid var(--border)"
      boxShadow="0 4px 14px 0 rgba(0, 0, 0, 0.4)"
      borderRadius="full"
      onClick={toggleColorMode}
      display={{ base: 'none', md: 'flex' }}
      p="0px"
      alignItems="center"
      justifyContent="center"
      _hover={{ bg: 'var(--accent-glow)' }}
      _active={{ transform: 'scale(0.95)' }}
    >
      <Icon
        h="22px"
        w="22px"
        as={colorMode === 'light' ? Moon : Sun}
      />
    </Button>
  );
}
