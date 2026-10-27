// Chakra imports
import { Avatar, Flex, Icon, Text } from '@chakra-ui/react';
// Custom components
import Card from 'components/card/Card';
import TransparentMenu from 'components/menu/TransparentMenu';
// Custom icons
import { MoreVertical } from 'lucide-react';

export default function Default(props: {
  avatar: string;
  name: string;
  job: string;
}) {
  const { avatar, name, job, ...rest } = props;
  const textColor = 'var(--fg)';
  const bg = 'var(--surface)';

  return (
    <Card py="10px" bg={bg} {...rest}>
      <Flex align="center">
        <Flex justifyContent="center" alignItems="center">
          <Avatar
            h={{ base: '48px', xl: '36px', '2xl': '48px' }}
            w={{ base: '48px', xl: '36px', '2xl': '48px' }}
            src={avatar}
            me="20px"
          />
          <Flex direction="column" align="start">
            <Text
              color={textColor}
              fontSize={{ base: 'md', xl: 'sm', '3xl': 'md' }}
              fontWeight="700"
            >
              {name}
            </Text>
            <Text
              color="var(--fg-muted)"
              textAlign="left"
              fontSize={{ base: 'sm', xl: 'xs', '3xl': 'sm' }}
              fontWeight="400"
            >
              {job}
            </Text>
          </Flex>
        </Flex>

        <TransparentMenu
          ms="auto"
          mb="0px"
          icon={
            <Icon as={MoreVertical} w="20px" h="20px" color={textColor} />
          }
        />
      </Flex>
    </Card>
  );
}
