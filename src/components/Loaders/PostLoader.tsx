import React from "react";
import { Stack, Box, SkeletonText, Skeleton } from "@chakra-ui/react";

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
      bg="white"
      borderRadius={10}
      shadow="md"
    >
      <SkeletonText
        borderRadius={10}
        mt="4"
        noOfLines={1}
        width="40%"
        spacing="4"
      />
      <SkeletonText borderRadius={10} mt="4" noOfLines={4} spacing="4" />
      <Skeleton borderRadius={10} mt="4" height={height} />
    </Box>
  );
};

/**
 * Component to display a post loader while the post is being loaded.
 * @returns {React.FC} - loading component while the post is being loaded
 *
 * @requires PostLoaderItem - actual post loader item of the given height
 */
const PostLoader: React.FC = () => {
  return (
    <Stack spacing={6}>
      <PostLoaderItem height="200px" />
      <PostLoaderItem height="50px" />
    </Stack>
  );
};

export default PostLoader;
