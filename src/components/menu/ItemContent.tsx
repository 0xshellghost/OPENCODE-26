import { Flex, Icon, Text } from '@chakra-ui/react';
import { ArrowUpCircle } from 'lucide-react';

export function ItemContent(props: { info: string }) {
  const textColor = 'var(--fg)';
  return (
    <>
      <Flex
        justify="center"
        align="center"
        borderRadius="16px"
        minH={{ base: '60px', md: '70px' }}
        h={{ base: '60px', md: '70px' }}
        minW={{ base: '60px', md: '70px' }}
        w={{ base: '60px', md: '70px' }}
        me="14px"
        bg="linear-gradient(135deg, #7ECDB5 0%, #2D8B6F 100%)"
      >
        <Icon as={ArrowUpCircle} color="white" w={8} h={8} />
      </Flex>
      <Flex flexDirection="column">
        <Text
          mb="5px"
          fontWeight="bold"
          color={textColor}
          fontSize={{ base: 'md', md: 'md' }}
        >
          New Update: {props.info}
        </Text>
        <Flex alignItems="center">
          <Text
            fontSize={{ base: 'sm', md: 'sm' }}
            lineHeight="100%"
            color={textColor}
          >
            A new update for your downloaded item is available!
          </Text>
        </Flex>
      </Flex>
    </>
  );
}
