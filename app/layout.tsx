'use client'
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '@/chakra/theme';
import Layout from '@/components/Layout/Layout';
import { RecoilRoot } from 'recoil';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Circus Discussions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RecoilRoot>
          <ChakraProvider theme={theme}>
            <Layout>{children}</Layout>
          </ChakraProvider>
        </RecoilRoot>
      </body>
    </html>
  );
}
