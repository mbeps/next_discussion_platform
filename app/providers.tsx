"use client";

import {
  ChakraProvider,
  Toaster,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastIndicator,
  ToastCloseTrigger,
  Flex,
  Stack,
} from "@chakra-ui/react";
import { theme } from "@/chakra/theme";
import Layout from "@/components/Layout/Layout";
import { Provider as JotaiProvider } from "jotai";
import { toaster } from "@/hooks/useCustomToast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <ChakraProvider value={theme}>
        <Layout>{children}</Layout>
        <Toaster toaster={toaster} gap={4} placement="top">
          {(toast: any) => (
            <ToastRoot
              key={toast.id}
              type={toast.type}
              closable={toast.closable}
              maxW="360px"
              width="calc(100vw - 32px)"
              mx="auto"
              borderRadius="md"
              shadow="lg"
            >
              <Flex align="center" gap={3} pr={toast.closable ? 2 : 0}>
                <ToastIndicator />
                <Stack gap={0} flex="1">
                  {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
                  {toast.description && (
                    <ToastDescription>{toast.description}</ToastDescription>
                  )}
                </Stack>
                {toast.closable && <ToastCloseTrigger />}
              </Flex>
            </ToastRoot>
          )}
        </Toaster>
      </ChakraProvider>
    </JotaiProvider>
  );
}
