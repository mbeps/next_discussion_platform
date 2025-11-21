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
import type { AppProps } from "next/app";
import { theme } from "@/chakra/theme";
import Layout from "@/components/Layout/Layout";
import { RecoilRoot } from "recoil";
import Head from "next/head";
import { toaster } from "@/hooks/useCustomToast";

/**
 * Represents the entire application.
 * `RecoilRoot` allows the entire app (children) to be able to manage its state via Recoil.
 * `ChakraProvider` allows the entire app (children) to be able to use Chakra UI.
 * @param param0 - every page and component is a child of this component
 * @returns App component
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <ChakraProvider value={theme}>
        <Layout>
          <Head>
            <title>Circus Discussions</title>
          </Head>
          <Component {...pageProps} />
        </Layout>
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
    </RecoilRoot>
  );
}
