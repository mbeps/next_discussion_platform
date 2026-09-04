import type React from "react";
import type { ReactNode } from "react";
import Navbar from "../navbar/Navbar";
import GlobalHooks from "./GlobalHooks";

interface LayoutProps {
  children: ReactNode;
}

/**
 * The primary layout wrapper for all pages in the application.
 * Injects global hooks for data bootstrapping and renders the persistent navbar.
 * @param children - The page-specific content to be rendered within the layout.
 * @returns A layout shell containing the navbar and main content area.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <GlobalHooks />
      <Navbar />
      <main>{children}</main>
    </>
  );
};
export default Layout;
