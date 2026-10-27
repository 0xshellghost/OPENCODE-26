import { StyleFunctionProps } from "@chakra-ui/theme-tools";

export const inputStyles = {
  components: {
    Input: {
      baseStyle: {
        field: {
          fontWeight: 400,
          borderRadius: "14px",
          color: "var(--fg)",
          _placeholder: { color: "var(--muted)" },
        },
      },

      variants: {
        main: (props: StyleFunctionProps) => ({
          field: {
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
          },
        }),
        auth: (props: StyleFunctionProps) => ({
          field: {
            fontWeight: "500",
            color: "var(--fg)",
            bg: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            _placeholder: { color: "var(--muted)", fontWeight: "400" },
            _hover: {
              borderColor: "var(--accent)",
            },
            _focus: {
              borderColor: "var(--accent)",
              boxShadow: "0 0 12px var(--accent-soft)",
            },
          },
        }),
        authSecondary: () => ({
          field: {
            bg: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            color: "var(--fg)",
            _placeholder: { color: "var(--muted)" },
            _hover: {
              borderColor: "var(--accent)",
            },
            _focus: {
              borderColor: "var(--accent)",
              boxShadow: "0 0 12px var(--accent-soft)",
            },
          },
        }),
        search: () => ({
          field: {
            border: "none",
            py: "11px",
            borderRadius: "inherit",
            color: "var(--fg)",
            _placeholder: { color: "var(--muted)" },
          },
        }),
      },
    },
    NumberInput: {
      baseStyle: {
        field: {
          fontWeight: 400,
          color: "var(--fg)",
          borderRadius: "14px",
        },
      },

      variants: {
        main: () => ({
          field: {
            bg: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            color: "var(--fg)",
            _placeholder: { color: "var(--muted)" },
            _hover: {
              borderColor: "var(--accent)",
            },
            _focus: {
              borderColor: "var(--accent)",
              boxShadow: "0 0 12px var(--accent-soft)",
            },
          },
        }),
        auth: () => ({
          field: {
            bg: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            color: "var(--fg)",
            _placeholder: { color: "var(--muted)" },
            _hover: {
              borderColor: "var(--accent)",
            },
            _focus: {
              borderColor: "var(--accent)",
              boxShadow: "0 0 12px var(--accent-soft)",
            },
          },
        }),
        authSecondary: () => ({
          field: {
            bg: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            color: "var(--fg)",
            _placeholder: { color: "var(--muted)" },
            _hover: {
              borderColor: "var(--accent)",
            },
            _focus: {
              borderColor: "var(--accent)",
              boxShadow: "0 0 12px var(--accent-soft)",
            },
          },
        }),
        search: () => ({
          field: {
            border: "none",
            py: "11px",
            borderRadius: "inherit",
            color: "var(--fg)",
            _placeholder: { color: "var(--muted)" },
          },
        }),
      },
    },
    Select: {
      baseStyle: {
        field: {
          fontWeight: 400,
          color: "var(--fg)",
          borderRadius: "14px",
        },
      },

      variants: {
        main: (props: StyleFunctionProps) => ({
          field: {
            bg: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
            borderRadius: "14px",
            _placeholder: { color: "var(--muted)" },
            _hover: {
              borderColor: "var(--accent)",
            },
            _focus: {
              borderColor: "var(--accent)",
              boxShadow: "0 0 12px var(--accent-soft)",
            },
          },
          icon: {
            color: "var(--fg-muted)",
          },
        }),
        mini: (props: StyleFunctionProps) => ({
          field: {
            bg: "var(--surface-2)",
            border: "0px solid transparent",
            fontSize: "0px",
            p: "10px",
            color: "var(--fg)",
            _placeholder: { color: "var(--muted)" },
          },
          icon: {
            color: "var(--fg-muted)",
          },
        }),
        subtle: () => ({
          box: {
            width: "unset",
          },
          field: {
            bg: "transparent",
            border: "0px solid",
            color: "var(--fg-muted)",
            borderColor: "transparent",
            width: "max-content",
            _placeholder: { color: "var(--muted)" },
          },
          icon: {
            color: "var(--fg-muted)",
          },
        }),
        transparent: (props: StyleFunctionProps) => ({
          field: {
            bg: "transparent",
            border: "0px solid",
            width: "min-content",
            color: "var(--fg)",
            borderColor: "transparent",
            padding: "0px",
            paddingLeft: "8px",
            paddingRight: "20px",
            fontWeight: "700",
            fontSize: "14px",
            _placeholder: { color: "var(--muted)" },
          },
          icon: {
            transform: "none !important",
            position: "unset !important",
            width: "unset",
            color: "var(--fg-muted)",
            right: "0px",
          },
        }),
        auth: () => ({
          field: {
            bg: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            color: "var(--fg)",
            _placeholder: { color: "var(--muted)" },
            _hover: {
              borderColor: "var(--accent)",
            },
            _focus: {
              borderColor: "var(--accent)",
              boxShadow: "0 0 12px var(--accent-soft)",
            },
          },
        }),
        authSecondary: (props: StyleFunctionProps) => ({
          field: {
            bg: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            color: "var(--fg)",
            _placeholder: { color: "var(--muted)" },
            _hover: {
              borderColor: "var(--accent)",
            },
            _focus: {
              borderColor: "var(--accent)",
              boxShadow: "0 0 12px var(--accent-soft)",
            },
          },
        }),
        search: (props: StyleFunctionProps) => ({
          field: {
            border: "none",
            py: "11px",
            borderRadius: "inherit",
            color: "var(--fg)",
            _placeholder: { color: "var(--muted)" },
          },
        }),
      },
    },
  },
};
