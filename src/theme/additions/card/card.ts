import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
const Card = {
  baseStyle: (props: StyleFunctionProps) => ({
    p: "20px",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    position: "relative",
    borderRadius: "20px",
    minWidth: "0px",
    wordWrap: "break-word",
    bg: 'var(--card-bg)',
    color: 'var(--text)',
    backdropFilter: 'blur(22px)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
    backgroundClip: "border-box",
  }),
};

export const CardComponent = {
  components: {
    Card,
  },
};
