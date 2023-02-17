import { Post } from "@/atoms/postsAtom";
import {
  Alert,
  AlertIcon,
  Flex,
  Icon,
  Image,
  Skeleton,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { BsBookmark, BsChat } from "react-icons/bs";
import { FiShare2 } from "react-icons/fi";
import {
  IoArrowDownCircleOutline,
  IoArrowDownCircleSharp,
  IoArrowUpCircleOutline,
  IoArrowUpCircleSharp,
} from "react-icons/io5";
import { MdOutlineDelete } from "react-icons/md";

type PostItemProps = {
  post: Post;
  userIsCreator: boolean; // is the currently logged in user the creator of post
  userVoteValue?: number;
  onVote: () => {};
  onDeletePost: (post: Post) => Promise<boolean>;
  onSelectPost: () => void;
};

const PostItem: React.FC<PostItemProps> = ({
  post,
  userIsCreator,
  userVoteValue,
  onVote,
  onDeletePost,
  onSelectPost,
}) => {
  const [loadingImage, setLoadingImage] = useState(true);
  const [error, setError] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const topText: string = `Author: ${post.creatorUsername} 
		Time: ${post.createTime
      .toDate()
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  /**
   * Will call the `handleDelete` from prop
   * this one will provide error handling
   * Each component may choose to the error handling differently
   * Core functionality is shared
   */
  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      const success: boolean = await onDeletePost(post);

      if (!success) {
        throw new Error("Post could not be deleted");
      }

      console.log("Post has been deleted successfully");
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
      borderColor="gray.500"
      borderRadius={10}
      _hover={{ borderColor: "gray.500" }}
      cursor="pointer"
      onClick={onSelectPost}
    >
      {/* left side containing like, dislike and vote number */}
      <Flex
        direction="column"
        align="center"
        bg="gray.100"
        p={2}
        width="40px"
        borderRadius="10px 0px 0px 10px"
      >
        {/* like button */}
        <Icon
          as={
            userVoteValue === 1 ? IoArrowUpCircleSharp : IoArrowUpCircleOutline
          }
          color={userVoteValue === 1 ? "red.500" : "gray.500"}
          fontSize={22}
          cursor="pointer"
          onClick={onVote}
        />
        <Text fontSize="12pt" color="gray.600">
          {post.votes}
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
          onClick={onVote}
        />
      </Flex>
      {/* right side containing content  */}
      <Flex direction="column" width="100%">
        <Stack spacing={1} p="10px">
          <Stack direction="row" spacing={0.5} align="center" fontSize="9pt">
            {/* Check whether home page to decide whether to display community image */}
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
          >
            <Icon as={BsChat} mr={2} />
            <Text fontSize="9pt">{post.numberOfComments}</Text>
          </Flex>
          <Flex
            align="center"
            p="8px 10px"
            borderRadius={5}
            _hover={{ bg: "gray.200" }}
            cursor="pointer"
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
