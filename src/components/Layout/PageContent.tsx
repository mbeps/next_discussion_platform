import { Flex } from "@chakra-ui/react";
import React, { ReactNode } from "react";

/**
 * Children components that can exist that are rendered.
 * These can include React components, pages, etc.
 */
type PageContentProps = {
  children: ReactNode;
};

// children in this case is an array taking 2 components (left and right)
// check if the children exist before rendering
const PageContent: React.FC<PageContentProps> = ({ children }) => {
  return (
    <Flex justify="center" p="16px 0px" border="1px solid red">
      <Flex
        width="95%"
        justify="center"
        maxWidth="860px"
        border="1px solid green"
      >
        {/* Left */}
        <Flex
          direction="column"
          width={{ base: "100%", md: "65%" }}
          mr={{ base: 0, md: 6 }}
          border="1px solid blue"
        >
          {children && children[0 as keyof typeof children]}
        </Flex>

        {/* Right */}
        <Flex
          direction="column"
          display={{ base: "none", md: "flex" }}
          flexGrow={1}
          border="1px solid orange"
        >
          {children && children[1 as keyof typeof children]}
        </Flex>
      </Flex>
    </Flex>
  );
};
export default PageContent;
