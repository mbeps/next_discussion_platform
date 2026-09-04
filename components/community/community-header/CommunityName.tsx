import { Flex, Text } from "@chakra-ui/react";
import type React from "react";

type CommunityNameProps = {
  id: string;
};

/**
 * Displays the community id in the header.
 * @param id - Community slug.
 * @returns Typography block with the name.
 */
const CommunityName: React.FC<CommunityNameProps> = ({ id }) => {
  return (
    <Flex direction="column" mr={6}>
      <Text fontWeight={800} fontSize="16pt">
        {id}
      </Text>
    </Flex>
  );
};

export default CommunityName;
