import { Flex, Skeleton, SkeletonCircle } from "@chakra-ui/react";
import type React from "react";

/**
 * Loading component while the communities are being loaded.
 * @returns {React.FC} - loading component while the community is being loaded
 */
const CommunityLoader: React.FC = () => (
  <Flex
    bg={{ base: "white", _dark: "gray.800" }}
    justify="space-between"
    align="center"
    p={5}
    borderRadius={10}
    shadow="md"
  >
    <SkeletonCircle size="14" />
    <Skeleton height="10px" width="80%" />
  </Flex>
);

export default CommunityLoader;
