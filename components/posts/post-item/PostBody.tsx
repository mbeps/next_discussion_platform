import { Flex, Image, Skeleton, Text } from "@chakra-ui/react";
import type React from "react";
import type { Post } from "@/types/post";

type PostBodyProps = {
  post: Post;
  loadingImage: boolean;
  setLoadingImage: (value: React.SetStateAction<boolean>) => void;
};

/**
 * Renders the post body preview and optional image with skeleton fallback.
 * @param post - Post content to show.
 * @param loadingImage - Whether the image is still loading.
 * @param setLoadingImage - Setter triggered on image load.
 * @returns Text excerpt and image block.
 */
const PostBody: React.FC<PostBodyProps> = ({
  post,
  loadingImage,
  setLoadingImage,
}) => {
  return (
    <>
      <Text fontSize="12pt">{post.body.split(" ").slice(0, 30).join(" ")}</Text>
      {post.imageURL && (
        <Flex justify="center" align="center">
          {loadingImage && (
            <Skeleton height="300px" width="100%" borderRadius={10} />
          )}
          <Image
            mt={4}
            src={post.imageURL}
            alt="Image for post"
            maxHeight="450px"
            maxWidth="100%"
            borderRadius="10px"
            display={loadingImage ? "none" : "unset"}
            onLoad={() => setLoadingImage(false)}
            shadow="md"
          />
        </Flex>
      )}
    </>
  );
};

export default PostBody;
