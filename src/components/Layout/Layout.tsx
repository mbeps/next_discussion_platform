import React, { ReactNode } from "react";
import Navbar from "../Navbar/Navbar";

/**
 * Children components that can exist that are rendered.
 * These can include React components, pages, etc.
 */
interface LayoutProps {
  children: ReactNode;
}

/**
 * Provides a common layout for the entire application.
 * Each page in the application will follow this standard layout.
 * Each page will display the navbar component.
 * Each page will be different hence different children components can be passed.
 * @param param0 children components for different pages
 * @returns Navbar and children
 * @see https://nextjs.org/docs/basic-features/layouts
 * @requires src/components/Navbar/Navbar.tsx - navbar at the top of every page
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};
export default Layout;
