import { Box, Skeleton, SkeletonText } from "@chakra-ui/react";
import type React from "react";

type PostLoaderItemProps = {
  height: string;
};

/**
 * Displays a post loader item of the given height.
 * @param {string} height - height of the post loader item
 * @returns
 */
const PostLoaderItem: React.FC<PostLoaderItemProps> = ({ height }) => {
  return (
    <Box
      padding="10px 10px"
      boxShadow="lg"
      bg={{ base: "white", _dark: "gray.800" }}
      borderRadius={10}
      shadow="md"
    >
      <SkeletonText
        borderRadius={10}
        mt="4"
        noOfLines={1}
        width="40%"
        rootProps={{ gap: 4 }}
      />
      <SkeletonText
        borderRadius={10}
        mt="4"
        noOfLines={4}
        rootProps={{ gap: 4 }}
      />
      <Skeleton borderRadius={10} mt="4" height={height} />
    </Box>
  );
};

export default PostLoaderItem;
