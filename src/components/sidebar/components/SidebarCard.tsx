import { Button, Flex, Link, Text, useColorModeValue } from '@chakra-ui/react';
import { Image } from 'components/image/Image';
import logoWhite from 'img/layout/logoWhite.png';

export default function SidebarDocs() {
  const bgColor = 'linear-gradient(135deg, #58B99A 0%, #2D8B6F 100%)';
  const borderColor = useColorModeValue('white', 'navy.800');
  const currentDate = new Date();
  const targetDate = new Date(currentDate.getFullYear(), 11, 14);
  //alert(currentDate<=targetDate)

  return (
    currentDate <= targetDate && (
      <Flex
        justify="center"
        direction="column"
        align="center"
        bg={bgColor}
        borderRadius="30px"
        me="20px"
        position="relative"
      >
        <Flex
          border="5px solid"
          borderColor={borderColor}
          bg="linear-gradient(135deg, #58B99A 0%, #2D8B6F 100%)"
          borderRadius="50%"
          w="94px"
          h="94px"
          align="center"
          justify="center"
          mx="auto"
          position="absolute"
          left="50%"
          top="-47px"
          transform="translate(-50%, 0%)"
        >
          <Image alt="gh-white-logo" src={logoWhite} w="40px" h="40px" />
        </Flex>
        <Flex
          direction="column"
          mb="12px"
          align="center"
          justify="center"
          px="15px"
          pt="55px"
        >
          <Text
            fontSize={{ base: 'lg', xl: '18px' }}
            color="white"
            fontWeight="bold"
            lineHeight="150%"
            textAlign="center"
            px="10px"
            mb="14px"
          >
            OpenCode&lsquo;23
          </Text>
          <Text
            fontSize="14px"
            color={'white'}
            px="10px"
            mb="14px"
            textAlign="center"
          >
            Start your Open Source Contribution journey from here! at IIIT
            Allahabad
          </Text>
        </Flex>
        <Link href="https://opencode23.devfolio.co">
          <Button
            bg="whiteAlpha.300"
            _hover={{ bg: 'whiteAlpha.200' }}
            _active={{ bg: 'whiteAlpha.100' }}
            mb={{ sm: '16px', xl: '24px' }}
            color={'white'}
            fontWeight="regular"
            fontSize="sm"
            minW="185px"
            mx="auto"
          >
            {' '}
            Register Now
          </Button>
        </Link>
      </Flex>
    )
  );
}
