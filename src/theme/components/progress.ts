import { StyleFunctionProps } from "@chakra-ui/theme-tools";

export const progressStyles = {
  components: {
    Progress: {
      baseStyle: {
        track: {
          bg: "var(--surface-2)",
          borderRadius: "9999px",
          overflow: "hidden",
        },
        filledTrack: {
          bg: "var(--accent)",
          borderRadius: "9999px",
          transition: "all 0.3s ease",
        },
      },

      variants: {
        table: (props: StyleFunctionProps) => ({
          track: {
            bg: "var(--border)",
            borderRadius: "9999px",
            h: "8px",
          },
          filledTrack: {
            bg: "var(--accent)",
            borderRadius: "9999px",
          },
        }),
        neon: () => ({
          track: {
            bg: "var(--surface-2)",
            borderRadius: "9999px",
            border: "1px solid var(--border)",
          },
          filledTrack: {
            bg: "linear-gradient(90deg, var(--accent) 0%, var(--secondary) 100%)",
            boxShadow: "0 0 12px var(--accent-soft)",
            borderRadius: "9999px",
          },
        }),
      },
    },
  },
};
