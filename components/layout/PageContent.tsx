import { Flex } from "@chakra-ui/react";
import type React from "react";
import type { ReactNode } from "react";

type PageContentProps = {
  children: ReactNode;
};

/**
 * A responsive two-column layout component used for page content.
 * Expects two children: the first for the main content area (left) and the second for the sidebar (right).
 * The sidebar is hidden on smaller screens.
 * @param children - The content to be displayed in the two columns.
 * @returns A centered flex container with responsive column widths.
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
          {children?.[0 as keyof typeof children]}
        </Flex>

        {/* Right */}
        <Flex
          direction="column"
          display={{ base: "none", md: "flex" }}
          flexGrow={1}
        >
          {children?.[1 as keyof typeof children]}
        </Flex>
      </Flex>
    </Flex>
  );
};
export default PageContent;
