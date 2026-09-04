import { Stack } from "@chakra-ui/react";
import type React from "react";
import PostLoaderItem from "./PostLoaderItem";

/**
 * Component to display a post loader while the post is being loaded.
 * @returns {React.FC} - loading component while the post is being loaded
 *
 * @requires PostLoaderItem - actual post loader item of the given height
 */
const PostLoader: React.FC = () => {
  return (
    <Stack gap={6}>
      <PostLoaderItem height="200px" />
      <PostLoaderItem height="50px" />
    </Stack>
  );
};

export default PostLoader;
