import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
const Card = {
  baseStyle: (props: StyleFunctionProps) => ({
    p: "20px",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    position: "relative",
    borderRadius: "var(--r)",
    minWidth: "0px",
    wordWrap: "break-word",
    bg: 'var(--surface)',
    color: 'var(--fg)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--line)',
    boxShadow: 'var(--shadow)',
    backgroundClip: "border-box",
  }),
};

export const CardComponent = {
  components: {
    Card,
  },
};
