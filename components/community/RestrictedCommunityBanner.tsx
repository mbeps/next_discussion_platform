import { Flex, Icon, Text } from "@chakra-ui/react";
import type React from "react";
import { FaLock } from "react-icons/fa";

type RestrictedCommunityBannerProps = {
  title?: string;
  description?: string;
};

/**
 * A placeholder banner displayed when a user attempts to view a private or restricted community without permission.
 * @param title - Custom title for the restriction message.
 * @param description - Custom description explaining the access limitation.
 * @returns A centered banner with a lock icon and explanatory text.
 */
const RestrictedCommunityBanner: React.FC<RestrictedCommunityBannerProps> = ({
  title = "This community is private",
  description = "Posts are only shown to subscribers.",
}) => {
  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      border="1px solid"
      borderColor={{ base: "gray.300", _dark: "gray.600" }}
      borderRadius={"xl"}
      p={10}
      bg={{ base: "white", _dark: "gray.800" }}
    >
      <Icon as={FaLock} fontSize={50} color="gray.400" mb={4} />
      <Text fontWeight={600} fontSize="lg">
        {title}
      </Text>
      <Text color="gray.500">{description}</Text>
    </Flex>
  );
};

export default RestrictedCommunityBanner;
