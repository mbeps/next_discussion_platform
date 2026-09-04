import { Flex, Icon, Text } from "@chakra-ui/react";
import type React from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";

interface AboutHeaderBarProps {
  communityName: string;
}

/**
 * Header strip for the community about card.
 * @param communityName - Community id to display.
 * @returns Banner with title and action icon placeholder.
 */
const AboutHeaderBar: React.FC<AboutHeaderBarProps> = ({ communityName }) => (
  <Flex
    justify="space-between"
    align="center"
    bg={{ base: "red.500", _dark: "red.600" }}
    color="white"
    p={3}
    borderRadius="10px 10px 0px 0px"
  >
    <Text fontSize="10pt" fontWeight={700}>
      About {communityName}
    </Text>
    <Icon as={HiOutlineDotsHorizontal} />
  </Flex>
);

export default AboutHeaderBar;
