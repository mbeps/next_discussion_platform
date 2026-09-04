import { Flex } from "@chakra-ui/react";
import type React from "react";

const SuggestionsHeader: React.FC = () => {
  return (
    <Flex
      align="flex-end"
      color="white"
      p="6px 10px"
      height="70px"
      borderTopRadius="lg"
      fontWeight={700}
      bgImage="linear-gradient(to bottom, rgba(139, 0, 0, 0), rgba(139, 0, 0, 0.75)), url('/images/banners/large.png')"
      backgroundSize="cover"
    >
      Top Communities
    </Flex>
  );
};

/**
 * Banner header for the recommendations card.
 * @returns Gradient overlay with title text.
 */
export default SuggestionsHeader;
