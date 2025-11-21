// 1. Import `extendTheme`
import "@fontsource/open-sans/300.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/700.css";
import { createSystem, defaultConfig, defineConfig, defineGlobalStyles } from "@chakra-ui/react";
import { buttonRecipe } from "./button";

const appConfig = defineConfig({
  globalCss: defineGlobalStyles({
    body: {
      bg: "gray.100",
      fontFamily: "fonts.body",
    },
  }),
  theme: {
    tokens: {
      colors: {
        brand: {
          100: { value: "#FF0000" },
        },
      },
      fonts: {
        body: { value: "Open Sans, sans-serif" },
      },
    },
    recipes: {
      button: buttonRecipe,
    },
  },
});

export const theme = createSystem(defaultConfig, appConfig);
