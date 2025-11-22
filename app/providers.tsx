"use client";

import { ChakraProvider, Toaster } from "@chakra-ui/react";
import { theme } from "@/chakra/theme";
import Layout from "@/components/Layout/Layout";
import { Provider as JotaiProvider } from "jotai";
import { useEffect, useState } from "react";
import { toaster } from "@/hooks/useCustomToast";
import EmotionRegistry from "./emotion-registry";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <JotaiProvider>
      <EmotionRegistry>
        <ChakraProvider value={theme}>
          <Layout>{children}</Layout>
          {/* @ts-ignore */}
          {mounted && <Toaster toaster={toaster} />}
        </ChakraProvider>
      </EmotionRegistry>
    </JotaiProvider>
  );
}
