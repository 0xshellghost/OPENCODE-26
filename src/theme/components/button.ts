import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
export const buttonStyles = {
  components: {
    Button: {
      baseStyle: {
        borderRadius: "9999px",
        fontFamily: "var(--f-body), sans-serif",
        fontWeight: "500",
        transition: "transform .2s ease, background .2s ease, box-shadow .2s ease",
        boxSizing: "border-box",
        _focus: {
          boxShadow: "none",
        },
        _active: {
          boxShadow: "none",
        },
      },
      variants: {
        outline: () => ({
          borderRadius: "9999px",
          border: "1px solid",
          borderColor: "var(--border)",
          bg: "var(--surface)",
          color: "var(--fg)",
          backdropFilter: "blur(14px)",
          _hover: {
            bg: "var(--accent-soft)",
            borderColor: "var(--accent)",
            color: "var(--accent)",
            transform: "translateY(-1px)",
          },
        }),
        brand: (props: StyleFunctionProps) => ({
          bg: mode("brand.500", "brand.200")(props),
          color: mode("white", "#0C1C2C")(props),
          borderRadius: "9999px",
          boxShadow: mode("0 12px 36px -10px rgba(45, 139, 111, 0.4)", "0 12px 36px -10px rgba(88, 185, 154, 0.4)")(props),
          _focus: {
            bg: mode("brand.500", "brand.200")(props),
          },
          _active: {
            bg: mode("brand.500", "brand.200")(props),
          },
          _hover: {
            bg: mode("brand.600", "brand.100")(props),
            transform: "translateY(-2px)",
          },
        }),
        darkBrand: (props: StyleFunctionProps) => ({
          bg: mode("brand.900", "brand.400")(props),
          color: "white",
          borderRadius: "9999px",
          _focus: {
            bg: mode("brand.900", "brand.400")(props),
          },
          _active: {
            bg: mode("brand.900", "brand.400")(props),
          },
          _hover: {
            bg: mode("brand.800", "brand.300")(props),
            transform: "translateY(-1px)",
          },
        }),
        lightBrand: (props: StyleFunctionProps) => ({
          bg: mode("brand.50", "whiteAlpha.100")(props),
          color: mode("brand.500", "white")(props),
          _focus: {
            bg: mode("brand.50", "whiteAlpha.100")(props),
          },
          _active: {
            bg: mode("secondaryGray.300", "whiteAlpha.100")(props),
          },
          _hover: {
            bg: mode("secondaryGray.400", "whiteAlpha.200")(props),
          },
        }),
        light: (props: StyleFunctionProps) => ({
          bg: mode("secondaryGray.300", "whiteAlpha.100")(props),
          color: mode("secondaryGray.900", "white")(props),
          _focus: {
            bg: mode("secondaryGray.300", "whiteAlpha.100")(props),
          },
          _active: {
            bg: mode("secondaryGray.300", "whiteAlpha.100")(props),
          },
          _hover: {
            bg: mode("secondaryGray.400", "whiteAlpha.200")(props),
          },
        }),
        action: (props: StyleFunctionProps) => ({
          fontWeight: "500",
          borderRadius: "50px",
          bg: mode("secondaryGray.300", "brand.400")(props),
          color: mode("brand.500", "white")(props),
          _focus: {
            bg: mode("secondaryGray.300", "brand.400")(props),
          },
          _active: { bg: mode("secondaryGray.300", "brand.400")(props) },
          _hover: {
            bg: mode("secondaryGray.200", "brand.400")(props),
          },
        }),
        setup: (props: StyleFunctionProps) => ({
          fontWeight: "500",
          borderRadius: "50px",
          bg: mode("transparent", "brand.400")(props),
          border: mode("1px solid", "0px solid")(props),
          borderColor: mode("secondaryGray.400", "transparent")(props),
          color: mode("secondaryGray.900", "white")(props),
          _focus: {
            bg: mode("transparent", "brand.400")(props),
          },
          _active: { bg: mode("transparent", "brand.400")(props) },
          _hover: {
            bg: mode("secondaryGray.100", "brand.400")(props),
          },
        }),
        secondary: () => ({
          bg: "var(--secondary)",
          color: "#0C1C2C",
          borderRadius: "9999px",
          fontWeight: "600",
          boxShadow: "0 4px 16px var(--secondary-soft)",
          _focus: {
            bg: "var(--secondary-hover)",
          },
          _active: {
            bg: "var(--secondary-hover)",
            transform: "scale(0.98)",
          },
          _hover: {
            bg: "var(--secondary-hover)",
            transform: "translateY(-1px)",
          },
        }),
      },
    },
  },
};
