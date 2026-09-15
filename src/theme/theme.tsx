import { extendTheme, HTMLChakraProps, ThemingProps } from '@chakra-ui/react';
import { CardComponent } from './additions/card/card';
import { buttonStyles } from './components/button';
import { badgeStyles } from './components/badge';
import { inputStyles } from './components/input';
import { progressStyles } from './components/progress';
import { sliderStyles } from './components/slider';
import { textareaStyles } from './components/textarea';
import { switchStyles } from './components/switch';
import { linkStyles } from './components/link';
import { breakpoints } from './foundations/breakpoints';
import { globalStyles } from './styles';
import { opencodeTokens } from './opencode-tokens';

export default extendTheme(
	{ 
		breakpoints,
		config: {
			initialColorMode: 'dark',
			useSystemColorMode: false,
		},
		styles: {
			global: {
				body: {
					bg: opencodeTokens.colors.background.base,
					color: opencodeTokens.colors.text.primary,
				}
			}
		},
		components: {
			Menu: {
				baseStyle: {
					list: {
						bg: opencodeTokens.colors.background.glassDark,
						backdropFilter: opencodeTokens.glass.backdropFilter,
						border: opencodeTokens.glass.border,
						boxShadow: opencodeTokens.shadows.glass,
						borderRadius: opencodeTokens.borders.radius.lg,
					},
					item: {
						bg: 'transparent',
						_hover: {
							bg: opencodeTokens.colors.background.glassLight,
						},
						_focus: {
							bg: opencodeTokens.colors.background.glassLight,
						}
					}
				}
			},
			Button: {
				variants: {
					solid: {
						bg: opencodeTokens.colors.accent.sakura,
						color: opencodeTokens.colors.background.base,
						_hover: {
							bg: opencodeTokens.colors.accent.sakuraHover,
							boxShadow: opencodeTokens.shadows.glow,
						}
					},
					ghost: {
						_hover: {
							bg: opencodeTokens.colors.background.glassLight,
						}
					}
				}
			}
		}
	},
	globalStyles,
	badgeStyles,
	buttonStyles,
	linkStyles,
	progressStyles,
	sliderStyles,
	inputStyles,
	textareaStyles,
	switchStyles,
	CardComponent
);

export interface CustomCardProps extends HTMLChakraProps<'div'>, ThemingProps {}
