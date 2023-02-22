import { Post } from "@/atoms/postsAtom";
import {
  Alert,
  AlertIcon,
  Flex,
  Icon,
  Image,
  Link,
  Skeleton,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { BsBookmark, BsChat } from "react-icons/bs";
import { FiShare2 } from "react-icons/fi";
import {
  IoArrowDownCircleOutline,
  IoArrowDownCircleSharp,
  IoArrowUpCircleOutline,
  IoArrowUpCircleSharp,
  IoPeopleCircleOutline,
} from "react-icons/io5";
import { MdOutlineDelete } from "react-icons/md";

/**
 * Props for PostItem component.
 * @param {post} - post object
 * @param {userIsCreator} - is the currently logged in user the creator of post
 * @param {userVoteValue} - value of the vote of the currently logged in user
 * @param {onVote} - function to handle voting
 * @param {onDeletePost} - function to handle deleting post
 * @param {onSelectPost} - function to handle selecting post
 */
type PostItemProps = {
  post: Post;
  userIsCreator: boolean; // is the currently logged in user the creator of post
  userVoteValue?: number; // value of the vote of the currently logged in user
  onVote: (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string
  ) => void; // function to handle voting
  onDeletePost: (post: Post) => Promise<boolean>; // function to handle deleting post
  onSelectPost?: (post: Post) => void; // optional because once a post is selected it cannot be reselected
  isHomePage?: boolean;
};

const PostItem: React.FC<PostItemProps> = ({
  post,
  userIsCreator,
  userVoteValue,
  onVote,
  onDeletePost,
  onSelectPost,
  isHomePage,
}) => {
  const [loadingImage, setLoadingImage] = useState(true);
  const [error, setError] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const router = useRouter();
  /**
   * If there is no selected post then post is already selected
   */
  const singlePostPage = !onSelectPost;

  /**
   * Text to be displayed on top of the post.
   * Displays the author and the time of creation.
   */
  const topText: string = `Author: ${post.creatorUsername} |
		Time: ${post.createTime
      .toDate()
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  /**
   * Will call the `handleDelete` from prop (usePosts hook).
   * This function provides the error handling for the delete functionality.
   * Each component may choose to the error handling differently.
   * Core functionality is shared.
   * @param {event} - event object
   */
  const handleDelete = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation(); // stop event bubbling up to parent
    setLoadingDelete(true);
    try {
      const success: boolean = await onDeletePost(post); // call the delete function from usePosts hook

      if (!success) {
        // if the post was not deleted successfully
        throw new Error("Post could not be deleted"); // throw error
      }

      console.log("Post has been deleted successfully"); // log success
      // if the user deletes post from the single post page, they should be redirected to the post's community page
      if (singlePostPage) {
        // if the post is on the single post page
        router.push(`/community/${post.communityId}`); // redirect to the community page
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <Flex
      border="1px solid"
      bg="white"
      // borderColor="gray.500"
      borderColor={singlePostPage ? "white" : "gray.300"}
      borderRadius={singlePostPage ? "10px 10px 0px 0px" : "10px"}
      _hover={{ borderColor: singlePostPage ? "none" : "gray.500" }}
      cursor={singlePostPage ? "unset" : "pointer"}
      onClick={() => onSelectPost && onSelectPost(post)} // if a post is selected then open post
    >
      {/* left side containing like, dislike and vote number */}
      <Flex
        direction="column"
        align="center"
        bg={singlePostPage ? "none" : "gray.100"}
        p={2}
        width="40px"
        borderRadius={singlePostPage ? "0" : "10px 0px 0px 10px"}
      >
        {/* like button */}
        <Icon
          as={
            userVoteValue === 1 ? IoArrowUpCircleSharp : IoArrowUpCircleOutline
          }
          color={userVoteValue === 1 ? "red.500" : "gray.500"}
          fontSize={22}
          cursor="pointer"
          onClick={(event) => onVote(event, post, 1, post.communityId)}
        />
        {/* number of likes  */}
        <Text fontSize="12pt" color="gray.600">
          {post.voteStatus}
        </Text>
        {/* dislike button */}
        <Icon
          as={
            userVoteValue === -1
              ? IoArrowDownCircleSharp
              : IoArrowDownCircleOutline
          }
          color={userVoteValue === -1 ? "red.500" : "gray.500"}
          fontSize={22}
          cursor="pointer"
          onClick={(event) => onVote(event, post, -1, post.communityId)}
          // onClick={onVote}
        />
      </Flex>
      {/* right side containing content  */}
      <Flex direction="column" width="100%">
        <Stack spacing={1} p="10px">
          <Stack
            direction="row"
            spacing={0.5}
            align="center"
            fontSize="9pt"
            borderRadius="full"
            boxSize="18px"
            mr={2}
            width="100%"
          >
            {/* Check whether home page to decide whether to display community image */}
            {isHomePage && (
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
            <Text>{topText}</Text>
          </Stack>
          {/* post title */}
          <Text fontSize="12pt" fontWeight={600}>
            {post.title}
          </Text>
          {/* Post body */}
          <Text fontSize="12pt">
            {/* only displays the first 30 words for descriptions that are too long */}
            {post.body.split(" ").slice(0, 30).join(" ")}
          </Text>
          {/* image (if exists) */}
          {post.imageURL && (
            <Flex justify="center" align="center">
              {loadingImage && (
                <Skeleton height="300px" width="100%" borderRadius={10} />
              )}
              <Image
                src={post.imageURL}
                alt="Image for post"
                maxHeight="450px"
                borderRadius="10px"
                display={loadingImage ? "none" : "unset"}
                onLoad={() => setLoadingImage(false)}
              />
            </Flex>
          )}
        </Stack>
        <Flex ml={1} mb={1} color="gray.500" fontWeight={600}>
          <Flex
            align="center"
            p="8px 10px"
            borderRadius={5}
            _hover={{ bg: "gray.200" }}
            cursor="pointer"
            width="100px"
          >
            <Icon as={FiShare2} mr={2} />
            <Text fontSize="9pt">Share</Text>
          </Flex>
          <Flex
            align="center"
            p="8px 10px"
            borderRadius={5}
            _hover={{ bg: "gray.200" }}
            cursor="pointer"
            width="100px"
          >
            <Icon as={BsBookmark} mr={2} />
            <Text fontSize="9pt">Save</Text>
          </Flex>
          {userIsCreator && (
            <Flex
              align="center"
              p="8px 10px"
              borderRadius={5}
              _hover={{ bg: "gray.200" }}
              cursor="pointer"
              onClick={handleDelete}
              width="100px"
            >
              {loadingDelete ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <Icon as={MdOutlineDelete} mr={2} />
                  <Text fontSize="9pt">Delete</Text>
                </>
              )}
            </Flex>
          )}
        </Flex>
        {error && (
          <Alert status="error" borderRadius="0px 0px 10px 0px">
            <AlertIcon />
            <Text mr={2} fontWeight={600} color="red.500">
              {error}
            </Text>
          </Alert>
        )}
      </Flex>
    </Flex>
  );
};
export default PostItem;
