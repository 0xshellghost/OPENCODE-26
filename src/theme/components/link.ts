export const linkStyles = {
	components: {
		Link: {
			baseStyle: {
				textDecoration: 'none',
				transition: 'color 0.2s ease',
				_focusVisible: {
					outline: '2px solid var(--accent)',
					outlineOffset: '2px',
					borderRadius: '4px',
				},
				_hover: {
					textDecoration: 'none',
					color: 'var(--accent)',
				},
			},
		},
	},
};
