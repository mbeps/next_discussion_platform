import { Text } from "@chakra-ui/react";
import type React from "react";
import type { Post } from "@/types/post";

type PostTitleProps = {
  post: Post;
};

/**
 * Displays the title of a post card.
 * @param post - Post entity with title text.
 * @returns Styled text heading.
 */
const PostTitle: React.FC<PostTitleProps> = ({ post }) => {
  return (
    <Text fontSize="14pt" fontWeight={600}>
      {post.title}
    </Text>
  );
};

export default PostTitle;
