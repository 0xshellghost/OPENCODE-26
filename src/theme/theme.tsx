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
				baseStyle: {
					borderRadius: '9999px',
					fontFamily: 'var(--f-body), sans-serif',
					fontWeight: '500',
					transition: 'transform 0.2s, background 0.2s, box-shadow 0.2s',
				},
				variants: {
					solid: {
						bg: 'var(--accent)',
						color: 'var(--accent-ink)',
						borderRadius: '9999px',
						boxShadow: '0 12px 36px -10px var(--accent)',
						_hover: {
							bg: 'var(--accent)',
							transform: 'translateY(-2px)',
							boxShadow: '0 16px 40px -8px var(--accent)',
						}
					},
					ghost: {
						borderRadius: '9999px',
						color: 'var(--muted)',
						_hover: {
							bg: 'var(--surface-2)',
							color: 'var(--fg)',
							transform: 'translateY(-1px)',
						}
					},
					outline: {
						borderRadius: '9999px',
						border: '1px solid',
						borderColor: 'var(--border)',
						bg: 'var(--surface)',
						color: 'var(--fg)',
						backdropFilter: 'blur(14px)',
						_hover: {
							bg: 'var(--accent-soft)',
							borderColor: 'var(--accent)',
							color: 'var(--accent)',
							transform: 'translateY(-1px)',
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
