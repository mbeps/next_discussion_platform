import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Circus Discussions",
  description: "A discussion platform",
};

/**
 * The root layout component for the entire application.
 * Defines the base HTML structure, global metadata, and wraps the application in the necessary providers.
 * @param children - The content of the current route.
 * @returns The top-level HTML structure for the application.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
