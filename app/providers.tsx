"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { Provider as JotaiProvider } from "jotai";
import { useEffect, useState } from "react";
import { theme } from "@/chakra/theme";
import Layout from "@/components/layout/Layout";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { Toaster } from "@/components/ui/toaster";
import EmotionRegistry from "./emotion-registry";

/**
 * The root provider component that initializes the application's global context.
 * Orchestrates state management (Jotai), styling (Emotion, Chakra UI), theming (ColorMode), and the global layout shell.
 * @param children - The application content to be wrapped by the providers.
 * @returns A nested provider tree ensuring all global services are available.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <JotaiProvider>
      <EmotionRegistry>
        <ChakraProvider value={theme}>
          <ColorModeProvider>
            <Layout>{children}</Layout>
          </ColorModeProvider>
          {mounted && <Toaster />}
        </ChakraProvider>
      </EmotionRegistry>
    </JotaiProvider>
  );
}
