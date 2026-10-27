import { StyleConfig, StyleFunctionProps } from "@chakra-ui/theme-tools";

export const badgeStyles: { components: { Badge: StyleConfig } } = {
  components: {
    Badge: {
      baseStyle: {
        borderRadius: "8px",
        lineHeight: "100%",
        padding: "6px 12px",
        fontFamily: "var(--f-body), sans-serif",
        fontWeight: "600",
        letterSpacing: "0.04em",
      },
      variants: {
        outline: () => ({
          bg: "transparent",
          color: "var(--fg)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
        }),
        solid: () => ({
          bg: "var(--accent)",
          color: "var(--accent-ink)",
          borderRadius: "8px",
        }),
        brand: () => ({
          bg: "var(--accent-soft)",
          color: "var(--accent)",
          border: "1px solid var(--border-accent)",
          borderRadius: "8px",
        }),
        secondary: () => ({
          bg: "var(--secondary-soft)",
          color: "var(--secondary)",
          border: "1px solid var(--secondary-border)",
          borderRadius: "8px",
        }),
      },
    },
  },
};
