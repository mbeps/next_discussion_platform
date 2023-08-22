import React, { ReactNode } from "react";
import Navbar from "../Navbar/Navbar";

/**
 * Children components that can exist that are rendered.
 * These can include React components, pages, etc.
 * @param {ReactNode} children - children components in every page
 */
interface LayoutProps {
  children: ReactNode;
}

/**
 * Provides a common layout for the entire application.
 * Each page in the application will follow this standard layout.
 * Each page will display the navbar component.
 * Each page will be different hence different children components can be passed.
 * @param {LayoutProps} { children } - children components in every page
 *
 * @returns {React.FC<LayoutProps>} - layout for the entire application with navbar at the top
 *
 * @see https://nextjs.org/docs/basic-features/layouts
 *
 * @requires Navbar.tsx - navbar at the top of every page
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
