import { defaultConfig, defineRecipe } from "@chakra-ui/react";

const baseRecipe = (defaultConfig.theme?.recipes?.button as Record<string, any>) ?? {};
const baseStyles = (baseRecipe.base as Record<string, any>) ?? {};
const sizeVariants = (baseRecipe.variants?.size as Record<string, Record<string, any>>) ?? {};
const variantVariants = (baseRecipe.variants?.variant as Record<string, Record<string, any>>) ?? {};
const solidBase = variantVariants.solid ?? {};
const outlineBase = variantVariants.outline ?? {};

/**
 * Custom button recipe used throughout the app.
 * Keeps the previous styling from Chakra v2 while leveraging the v3 recipe API.
 */
export const buttonRecipe = defineRecipe({
  ...baseRecipe,
  base: {
    ...baseStyles,
    borderRadius: "10px",
    fontSize: "10pt",
    fontWeight: 700,
    _focus: {
      boxShadow: "none",
    },
    _hover: {
      ...(baseStyles._hover ?? {}),
      boxShadow: "lg",
    },
  },
  variants: {
    ...baseRecipe.variants,
    size: {
      ...sizeVariants,
      sm: {
        ...(sizeVariants.sm ?? {}),
        fontSize: "8pt",
      },
      md: {
        ...(sizeVariants.md ?? {}),
        fontSize: "10pt",
      },
    },
    variant: {
      ...variantVariants,
      solid: {
        ...solidBase,
        color: "white",
        bg: "red.500",
        borderColor: "red.500",
        _hover: {
          ...(solidBase._hover ?? {}),
          bg: "red.400",
        },
      },
      outline: {
        ...outlineBase,
        color: "red.500",
        borderWidth: "1px",
        borderColor: "red.500",
        _hover: {
          ...(outlineBase._hover ?? {}),
          bg: "red.50",
        },
      },
      oauth: {
        height: "34px",
        borderWidth: "1px",
        borderColor: "gray.300",
        _hover: {
          bg: "gray.50",
          borderColor: "red.400",
        },
      },
      action: {
        height: "34px",
        borderWidth: "1px",
        borderColor: "white",
        _hover: {
          bg: "gray.50",
          borderColor: "red.400",
        },
      },
    },
  },
});
