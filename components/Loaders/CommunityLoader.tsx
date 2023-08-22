import { Flex, SkeletonCircle, Skeleton } from "@chakra-ui/react";
import React from "react";

/**
 * Loading component while the communities are being loaded.
 * @returns {React.FC} - loading component while the community is being loaded
 */
const CommunityLoader: React.FC = () => (
  <Flex
    bg="white"
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
