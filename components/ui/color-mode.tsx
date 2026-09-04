"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider, useTheme } from "next-themes";

/**
 * A provider component that integrates `next-themes` with Chakra UI.
 * Enables the use of `_dark` tokens by synchronizing the theme state with a CSS class on the html element.
 * @param props - Properties passed to the underlying `ThemeProvider`.
 * @returns A theme provider configured for class-based theme switching.
 */
export function ColorModeProvider(props: ThemeProviderProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  );
}

/**
 * A custom hook for accessing and manipulating the current color mode.
 * Provides the active theme and a function to toggle between light and dark modes.
 * @returns An object containing the current color mode and control functions.
 */
export function useColorMode() {
  const { resolvedTheme, setTheme } = useTheme();
  const toggleColorMode = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };
  return {
    colorMode: resolvedTheme,
    setColorMode: setTheme,
    toggleColorMode,
  };
}

/**
 * Selects a value based on the current color mode.
 * Useful for components that need to apply different styles or values for light and dark modes manually.
 * @param light - The value to use in light mode.
 * @param dark - The value to use in dark mode.
 * @returns The value corresponding to the active color mode.
 */
export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? dark : light;
}
