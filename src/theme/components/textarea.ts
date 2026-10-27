import { StyleFunctionProps } from "@chakra-ui/theme-tools";

export const textareaStyles = {
  components: {
    Textarea: {
      baseStyle: {
        fontWeight: 400,
        borderRadius: "14px",
        bg: "var(--surface-2)",
        color: "var(--fg)",
        border: "1px solid var(--border)",
        _placeholder: { color: "var(--muted)" },
        _focus: {
          borderColor: "var(--accent)",
          boxShadow: "0 0 0 1px var(--accent)",
        },
      },

      variants: {
        main: (props: StyleFunctionProps) => ({
          bg: "var(--surface-2)",
          border: "1px solid var(--border)",
          color: "var(--fg)",
          borderRadius: "14px",
          fontSize: "sm",
          p: "16px",
          _placeholder: { color: "var(--muted)" },
          _hover: {
            borderColor: "var(--accent)",
          },
          _focus: {
            borderColor: "var(--accent)",
            boxShadow: "0 0 12px var(--accent-soft)",
          },
        }),
        auth: () => ({
          bg: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          color: "var(--fg)",
          _placeholder: { color: "var(--muted)" },
        }),
        authSecondary: () => ({
          bg: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          color: "var(--fg)",
          _placeholder: { color: "var(--muted)" },
        }),
        search: () => ({
          border: "none",
          py: "11px",
          borderRadius: "inherit",
          _placeholder: { color: "var(--muted)" },
        }),
      },
    },
  },
};
