import { Button, Icon, useColorMode } from '@chakra-ui/react';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';

export default function FixedPlugin(props: { [x: string]: any }) {
  const { ...rest } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  let bgButton = 'linear-gradient(135deg, #58B99A 0%, #2D8B6F 100%)';

  let left = '';
  let right = '35px';

  return (
    <Button
      {...rest}
      h="60px"
      w="60px"
      bg={bgButton}
      zIndex="99"
      position="fixed"
      variant="no-effects"
      left={left}
      right={right}
      bottom="30px"
      border="1px solid"
      borderColor="#58B99A"
      borderRadius="50px"
      onClick={toggleColorMode}
      display="flex"
      p="0px"
      alignItems="center"
      justifyContent="center"
    >
      <Icon
        h="24px"
        w="24px"
        color="white"
        as={colorMode === 'light' ? IoMdMoon : IoMdSunny}
      />
    </Button>
  );
}
