import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'

/**
 * Represents the entire application
 * @param param0 - every page and component is a child of this component
 * @returns 
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}
