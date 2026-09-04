import { Icon, Image, Link, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import type React from "react";
import { IoPeopleCircleOutline } from "react-icons/io5";
import type { Post } from "@/types/post";

type PostDetailsProps = {
  showCommunityImage?: boolean;
  post: Post;
};

/**
 * Renders the post meta line with community icon, author, and relative time.
 * @param showCommunityImage - Whether to show the community avatar/link.
 * @param post - Post data for metadata fields.
 * @returns Stack of metadata elements for a post card.
 */
const PostDetails: React.FC<PostDetailsProps> = ({
  showCommunityImage,
  post,
}) => {
  const topText: string = `By ${post.creatorUsername} ${moment(
    new Date(post.createTime.seconds * 1000),
  ).fromNow()}`;

  return (
    <Stack
      direction="row"
      gap={0.5}
      align="center"
      fontSize="9pt"
      borderRadius="full"
      boxSize="18px"
      mr={2}
      width="100%"
    >
      {showCommunityImage && (
        <>
          {post.communityImageURL ? (
            <Image
              borderRadius="full"
              boxSize="18px"
              src={post.communityImageURL}
              mr={2}
              alt="Community logo"
            />
          ) : (
            <Icon
              as={IoPeopleCircleOutline}
              mr={1}
              fontSize="18pt"
              color="red.500"
            />
          )}
          <Link href={`/community/${post.communityId}`}>
            <Text
              fontWeight={700}
              _hover={{ textDecoration: "underline" }}
              pr={2}
              onClick={(event) => event.stopPropagation()}
            >
              {post.communityId}
            </Text>
          </Link>
        </>
      )}
      <Text fontWeight={500}>{topText}</Text>
    </Stack>
  );
};

export default PostDetails;
