import { Providers } from "./providers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Circus Discussions",
  description: "A discussion platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
