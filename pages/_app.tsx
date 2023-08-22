import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { theme } from "@/chakra/theme";
import Layout from "@/components/Layout/Layout";
import { RecoilRoot } from "recoil";
import Head from "next/head";

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
      <ChakraProvider theme={theme}>
        <Layout>
          <Head>
            <title>Circus Discussions</title>
          </Head>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </RecoilRoot>
  );
}
