import { Flex, SkeletonCircle, Skeleton } from "@chakra-ui/react";
import React from "react";

const CommunityLoader: React.FC = () => (
  <Flex
    bg="white"
    justify="space-between"
    align="center"
    p={5}
    borderRadius={10}
  >
    <SkeletonCircle size="14" />
    <Skeleton height="10px" width="80%" />
  </Flex>
);

export default CommunityLoader;
