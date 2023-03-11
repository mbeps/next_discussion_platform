import { Flex } from "@chakra-ui/react";
import React, { ReactNode } from "react";

/**
 * Children components that can exist that are rendered.
 * These can include React components, pages, etc.
 * @param {ReactNode} children - children components in every page
 */
type PageContentProps = {
  children: ReactNode;
};

/**
 * Creates a layout for for main contents page.
 * The page is separated into 2 sections (array of 2):
 *  - Left: main content such as the list of posts
 *  - Right: extra content such as community descriptions, etc
 *
 * The layout is responsive which means that in mobile screen sizes,
 * the right layout will be removed.
 * @param {children} children - children components in every page
 * @returns page layout
 */
const PageContent: React.FC<PageContentProps> = ({ children }) => {
  return (
    <Flex justify="center" p="16px 0px">
      <Flex width="95%" justify="center" maxWidth="1200px">
        {/* Left */}
        <Flex
          direction="column"
          width={{ base: "100%", md: "65%" }}
          mr={{ base: 0, md: 6 }}
        >
          {/* check if the children exist before rendering */}
          {children && children[0 as keyof typeof children]}
        </Flex>

        {/* Right */}
        <Flex
          direction="column"
          display={{ base: "none", md: "flex" }}
          flexGrow={1}
        >
          {children && children[1 as keyof typeof children]}
        </Flex>
      </Flex>
    </Flex>
  );
};
export default PageContent;
