// Chakra imports
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import Footer from 'components/footer/FooterAuth';
// Assets
import { ReactNode } from 'react';

function AuthIllustration(props: {
  children: ReactNode;
  illustrationBackground: string;
}) {
  const authBg = useColorModeValue('white', 'navy.900');
  const { children, illustrationBackground } = props;

  return (
    <Flex minH="100vh" w="100%" bg={authBg} position="relative">
      <Flex
        minH={{ base: '100vh', lg: '100vh' }}
        w="100%"
        maxW={{ md: '66%', lg: '1313px' }}
        mx={{ base: '0', md: 'auto' }}
        pt={{ base: '40px', md: '0px' }}
        px={{ base: '20px', md: '30px', xl: '0px' }}
        ps={{ xl: '70px' }}
        justifyContent="start"
        direction="column"
      >
        {children}
        <Box
          display={{ base: 'none', md: 'block' }}
          h="100%"
          minH="100vh"
          w={{ lg: '50vw', '2xl': '44vw' }}
          position="absolute"
          right="0px"
        >
          <Flex
            style={{ backgroundImage: `url(${illustrationBackground})` }}
            justify="center"
            align="end"
            w="100%"
            h="100%"
            bgSize="cover"
            bgPosition="50%"
            position="absolute"
            borderBottomLeftRadius={{ lg: '120px', xl: '200px' }}
          />
        </Box>
        <Footer mb={{ xl: '3vh' }} />
      </Flex>
    </Flex>
  );
}

export default AuthIllustration;
