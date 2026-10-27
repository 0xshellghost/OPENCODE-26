// Chakra imports
import { Box, Flex, Icon, Progress, Text } from '@chakra-ui/react';
// Custom components
import Card from 'components/card/Card';
import IconBox from 'components/icons/IconBox';
import Menu from 'components/menu/MainMenu';
import React from 'react';
// Assets
import { CloudCheck } from 'lucide-react';

export default function Banner(props: { used: number; total: number; [x: string]: any }) {
	const { used, total } = props;
	const textColorPrimary = 'var(--fg)';
	const brandColor = 'var(--accent)';
	const textColorSecondary = 'var(--fg-muted)';
	const box = 'var(--accent-soft)';
	return (
		<Card mb={{ base: '0px', lg: '20px' }} alignItems='center'>
			<Flex w='100%'>
				<Menu ms='auto' />
			</Flex>
			<IconBox
				mx='auto'
				h='100px'
				w='100px'
				icon={<Icon as={CloudCheck} color={brandColor} h='46px' w='46px' />}
				bg={box}
			/>
			<Text color={textColorPrimary} fontWeight='bold' fontSize='2xl' mt='10px'>
				Your storage
			</Text>
			<Text color={textColorSecondary} fontSize='md' maxW={{ base: '100%', xl: '80%', '3xl': '60%' }} mx='auto'>
				Supervise your drive space in the easiest way
			</Text>
			<Box w='100%' mt='auto'>
				<Flex w='100%' justify='space-between' mb='10px'>
					<Text color={textColorSecondary} fontSize='sm' maxW='40%'>
						{used} GB
					</Text>
					<Text color={textColorSecondary} fontSize='sm' maxW='40%'>
						{total} GB
					</Text>
				</Flex>
				<Progress alignItems='start' colorScheme='brandScheme' value={used / total * 100} w='100%' />
			</Box>
		</Card>
	);
}
