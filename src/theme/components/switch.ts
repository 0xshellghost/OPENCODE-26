export const switchStyles = {
  components: {
    Switch: {
      baseStyle: {
        thumb: {
          fontWeight: 400,
          borderRadius: "50%",
          w: "16px",
          h: "16px",
          bg: "white",
          _checked: {
            transform: "translate(20px, 0px)",
            bg: "var(--accent-ink, #07131F)",
          },
        },
        track: {
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
          w: "40px",
          h: "20px",
          p: "2px",
          ps: "2px",
          bg: "var(--surface-2)",
          border: "1px solid var(--border)",
          _checked: {
            bg: "var(--accent)",
            borderColor: "var(--accent)",
          },
          _focus: {
            boxShadow: "0 0 0 2px var(--accent-soft)",
          },
        },
      },

      variants: {
        main: () => ({
          track: {
            bg: "var(--surface-2)",
            _checked: {
              bg: "var(--accent)",
            },
          },
        }),
      },
    },
  },
};
