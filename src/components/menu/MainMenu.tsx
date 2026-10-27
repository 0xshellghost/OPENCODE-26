// Chakra imports
import {
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
// Assets
import {
  Briefcase,
  Lightbulb,
  MoreHorizontal,
  Settings,
  User,
} from 'lucide-react';

export default function Banner(props: { [x: string]: any }) {
  const { ...rest } = props;

  const textColor = 'var(--fg-muted)';
  const textHover = { color: 'var(--fg)', bg: 'var(--surface-2)' };
  const iconColor = 'var(--fg-muted)';
  const bgList = 'var(--surface-2)';
  const bgButton = 'var(--surface-2)';
  const bgHover = { bg: 'var(--surface)', color: 'var(--accent)' };

  // Ellipsis modals
  const {
    isOpen: isOpen1,
    onOpen: onOpen1,
    onClose: onClose1,
  } = useDisclosure();

  return (
    <Menu isOpen={isOpen1} onClose={onClose1}>
      <MenuButton
        alignItems="center"
        justifyContent="center"
        bg={bgButton}
        _hover={bgHover}
        w="37px"
        h="37px"
        lineHeight="100%"
        onClick={onOpen1}
        borderRadius="10px"
        border="1px solid var(--border)"
        aria-label="More options"
        {...rest}
      >
        <Icon as={MoreHorizontal} color={iconColor} w="20px" h="20px" />
      </MenuButton>
      <MenuList
        w="160px"
        minW="unset"
        maxW="160px"
        border="1px solid var(--border)"
        backdropFilter="blur(20px)"
        bg={bgList}
        boxShadow="0 10px 30px rgba(0,0,0,0.3)"
        borderRadius="14px"
        p="8px"
      >
        <MenuItem
          transition="0.2s linear"
          color={textColor}
          _hover={textHover}
          px="8px"
          py="6px"
          borderRadius="8px"
          bg="transparent"
          mb="4px"
        >
          <Flex align="center">
            <Icon as={User} h="15px" w="15px" me="8px" />
            <Text fontSize="sm" fontWeight="500">
              Panel 1
            </Text>
          </Flex>
        </MenuItem>
        <MenuItem
          transition="0.2s linear"
          px="8px"
          py="6px"
          borderRadius="8px"
          color={textColor}
          _hover={textHover}
          bg="transparent"
          mb="4px"
        >
          <Flex align="center">
            <Icon as={Briefcase} h="15px" w="15px" me="8px" />
            <Text fontSize="sm" fontWeight="500">
              Panel 2
            </Text>
          </Flex>
        </MenuItem>
        <MenuItem
          transition="0.2s linear"
          px="8px"
          py="6px"
          borderRadius="8px"
          color={textColor}
          _hover={textHover}
          bg="transparent"
          mb="4px"
        >
          <Flex align="center">
            <Icon as={Lightbulb} h="15px" w="15px" me="8px" />
            <Text fontSize="sm" fontWeight="500">
              Panel 3
            </Text>
          </Flex>
        </MenuItem>
        <MenuItem
          transition="0.2s linear"
          color={textColor}
          _hover={textHover}
          px="8px"
          py="6px"
          borderRadius="8px"
          bg="transparent"
        >
          <Flex align="center">
            <Icon as={Settings} h="15px" w="15px" me="8px" />
            <Text fontSize="sm" fontWeight="500">
              Panel 4
            </Text>
          </Flex>
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
