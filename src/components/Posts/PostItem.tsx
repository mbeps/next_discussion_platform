import { Post } from "@/atoms/postsAtom";
import useCustomToast from "@/hooks/useCustomToast";
import {
  Button,
  Flex,
  Icon,
  Image,
  Link,
  Skeleton,
  Stack,
  Text,
  useClipboard,
  useToast,
} from "@chakra-ui/react";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { BsBookmark } from "react-icons/bs";
import { FiShare2 } from "react-icons/fi";
import {
  IoArrowDownCircleOutline,
  IoArrowDownCircleSharp,
  IoArrowUpCircleOutline,
  IoArrowUpCircleSharp,
  IoPeopleCircleOutline,
} from "react-icons/io5";
import { MdOutlineDelete } from "react-icons/md";
import PostItemError from "../atoms/ErrorMessage";

/**
 * @param {Post} post - post object
 * @param {boolean} userIsCreator - is the currently logged in user the creator of post
 * @param {number} userVoteValue - whether the currently logged in user has voted on the post (1, -1, or 0)
 * @param {function} onVote - function to handle voting
 * @param {function} onDeletePost - function to handle deleting post
 * @param {function} onSelectPost - function to handle selecting post
 * @param {boolean} showCommunityImage - whether to show the community image
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
  showCommunityImage?: boolean;
};

/**
 * Component to display a post:
 *  - Post title
 *  - Post text
 *  - Post creator
 *  - Post community
 *  - Post vote count
 *  - Post vote buttons
 *  - Post delete button (if user is creator)
 *  - Post select button (if post is not selected)
 *  - Post community image (if showCommunityImage is true)
 * @param {Post} post - post object
 * @param {boolean} userIsCreator - is the currently logged in user the creator of post
 * @param {number} userVoteValue - whether the currently logged in user has voted on the post (1, -1, or 0)
 * @param {function} onVote - function to handle voting
 * @param {function} onDeletePost - function to handle deleting post
 * @param {function} onSelectPost - function to handle selecting post
 * @param {boolean} showCommunityImage - whether to show the community image
 * @returns {React.FC<PostItemProps>} - card displaying post
 */
const PostItem: React.FC<PostItemProps> = ({
  post,
  userIsCreator,
  userVoteValue,
  onVote,
  onDeletePost,
  onSelectPost,
  showCommunityImage,
}) => {
  const [loadingImage, setLoadingImage] = useState(true);
  const [error, setError] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const router = useRouter();
  const showToast = useCustomToast();
  const { onCopy, value, setValue, hasCopied } = useClipboard("");
  /**
   * If there is no selected post then post is already selected
   */
  const singlePostPage = !onSelectPost;

  /**
   * Will call the `handleDelete` from prop (usePosts hook).
   * This function provides the error handling for the delete functionality.
   * Each component may choose to the error handling differently.
   * Core functionality is shared.
   * @param {React.MouseEvent<HTMLButtonElement, MouseEvent>} event - click event on delete button to prevent from post being selected
   */
  const handleDelete = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation(); // stop event bubbling up to parent
    setLoadingDelete(true);
    try {
      const success: boolean = await onDeletePost(post); // call the delete function from usePosts hook

      if (!success) {
        // if the post was not deleted successfully
        throw new Error("Post could not be deleted"); // throw error
      }

      showToast({
        title: "Post Deleted",
        description: "Your post has been deleted",
        status: "success",
      });
      // if the user deletes post from the single post page, they should be redirected to the post's community page
      if (singlePostPage) {
        // if the post is on the single post page
        router.push(`/community/${post.communityId}`); // redirect to the community page
      }
    } catch (error: any) {
      setError(error.message);
      showToast({
        title: "Post not Deleted",
        description: "There was an error deleting your post",
        status: "error",
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  /**
   * Added functionality to share a post by copying the link to the post to the clipboard.
   * Router will check base URL to copy the correct link depending on the name of the site.
   * @param {React.MouseEvent<HTMLButtonElement, MouseEvent>} event - click event on share button to prevent from post being selected
   */
  const handleShare = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation(); // stop event bubbling up to parent
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const postLink = `${baseUrl}/community/${post.communityId}/comments/${post.id}`;
    setValue(postLink);
    onCopy(); // copy link to clipboard

    showToast({
      title: "Link Copied",
      description: "Link to the post has been saved to your clipboard",
      status: "info",
    });
  };

  const handleSave = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation(); // stop event bubbling up to parent

    showToast({
      title: "Functionality Coming Soon",
      description: "Currently, this functionality is not available",
      status: "warning",
    });
  };

  return (
    <Flex
      border="1px solid"
      bg="white"
      borderColor="gray.300"
      borderRadius={10}
      _hover={{
        borderColor: singlePostPage ? "none" : "gray.400",
        boxShadow: !singlePostPage && "xl",
      }}
      cursor={singlePostPage ? "unset" : "pointer"}
      onClick={() => onSelectPost && onSelectPost(post)} // if a post is selected then open post
      shadow="md"
    >
      {/* Left Section */}
      <Flex
        direction="column"
        align="center"
        bg={singlePostPage ? "none" : "gray.100"}
        p={2}
        width="40px"
        borderRadius={singlePostPage ? "0" : "10px 0px 0px 10px"}
      >
        <VoteSection
          userVoteValue={userVoteValue}
          onVote={onVote}
          post={post}
        />
      </Flex>

      {/* Right Section  */}
      <Flex direction="column" width="100%">
        <Stack spacing={1} p="10px">
          <PostDetails showCommunityImage={true} post={post} />
          <PostTitle post={post} />
          <PostBody
            post={post}
            loadingImage={loadingImage}
            setLoadingImage={setLoadingImage}
          />
        </Stack>
        <PostActions
          handleDelete={handleDelete}
          loadingDelete={loadingDelete}
          userIsCreator={userIsCreator}
          handleShare={handleShare}
          handleSave={handleSave}
        />
        <PostItemError
          error={error}
          message={"There was an error when loading this post"}
        />
      </Flex>
    </Flex>
  );
};
export default PostItem;

/**
 * @param {number} userVoteValue - whether the currently logged in user has voted on the post (1, -1, or 0)
 * @param {function} onVote - function to handle voting
 * @param {Post} post - post object
 */
type VoteSectionProps = {
  userVoteValue?: number;
  onVote: (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string
  ) => void;
  post: Post;
};

/**
 * Displays the vote section of a post.
 * Contains:
 * - Like button
 * - Vote status (number of likes and dislikes combined)
 * - Dislike button
 * @param {number} userVoteValue - whether the currently logged in user has voted on the post (1, -1, or 0)
 * @param {function} onVote - function to handle voting
 * @param {Post} post - post object
 *
 * @returns {React.FC<VoteSectionProps>} - component to display the vote section of a post
 */
const VoteSection: React.FC<VoteSectionProps> = ({
  userVoteValue,
  onVote,
  post,
}) => {
  return (
    <>
      {/* like button */}
      <Icon
        as={userVoteValue === 1 ? IoArrowUpCircleSharp : IoArrowUpCircleOutline}
        color={userVoteValue === 1 ? "red.500" : "gray.500"}
        fontSize={22}
        cursor="pointer"
        _hover={{ color: "red.300" }}
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
        _hover={{ color: "red.300" }}
        fontSize={22}
        cursor="pointer"
        onClick={(event) => onVote(event, post, -1, post.communityId)}
      />
    </>
  );
};

/**
 * @param {boolean} showCommunityImage - whether to show the community image
 * @param {Post} post - post object
 */
type PostDetailsProps = {
  showCommunityImage?: boolean;
  post: Post;
};

/**
 * Displays the details of a post at the top of the post card.
 * Contains:
 * - Community image (if needed)
 * - Author of the post
 * - Time of creation
 * @param {boolean} showCommunityImage - whether to show the community image
 * @param {Post} post - post object
 *
 * @returns {React.FC<PostDetailsProps>} - component to display the details of a post
 */
const PostDetails = ({ showCommunityImage, post }: PostDetailsProps) => {
  /**
   * Text to be displayed on top of the post.
   * Displays the author and the time of creation.
   */
  const topText: string = `By ${post.creatorUsername} ${moment(
    new Date(post.createTime.seconds * 1000)
  ).fromNow()}`;
  return (
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

/**
 * @param {Post} post - post object
 */
type PostTitleProps = {
  post: Post;
};

/**
 * Displays the title of a post.
 * @param {Post} post - post object
 *
 * @returns {React.FC<PostTitleProps>} - component to display the title of a post
 */
const PostTitle = ({ post }: PostTitleProps) => {
  return (
    <Text fontSize="12pt" fontWeight={600}>
      {post.title}
    </Text>
  );
};

/**
 * @param {Post} post - post object
 * @param {boolean} loadingImage - whether the image is loading
 * @param {function} setLoadingImage - function to set the loadingImage state
 */
type PostBodyProps = {
  post: Post;
  loadingImage: boolean;
  setLoadingImage: (value: React.SetStateAction<boolean>) => void;
};

/**
 * Body of the post containing the description and the image (if exists).
 * The description is limited to 30 words.
 * @param {Post} post - post object
 * @param {boolean} loadingImage - whether the image is loading
 * @param {function} setLoadingImage - function to set the loadingImage state
 * @returns {React.FC<PostBodyProps>} - component to display the body of a post
 */
const PostBody = ({ post, loadingImage, setLoadingImage }: PostBodyProps) => {
  return (
    <>
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

/**
 * @param {function} handleDelete - function to handle the delete button
 * @param {boolean} loadingDelete - whether the post is being deleted
 */
interface PostActionsProps {
  handleDelete: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => Promise<void>;
  loadingDelete: boolean;
  userIsCreator: boolean;
  handleShare: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  handleSave: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

/**
 * Displays the actions the user can take on a post.
 * Contains:
 * - Share button (not implemented)
 * - Save button (not implemented)
 * - Delete button (only for the author of the post)
 * @param {function} handleDelete - function to handle the delete button
 * @param {boolean} loadingDelete - whether the post is being deleted
 * @returns {React.FC<PostActionsProps>} - component to display the actions of a post
 */
const PostActions: React.FC<PostActionsProps> = ({
  handleDelete,
  loadingDelete,
  userIsCreator,
  handleShare,
  handleSave,
}) => (
  <Stack
    ml={1}
    mb={1}
    color="gray.500"
    fontWeight={600}
    direction="row"
    spacing={1}
  >
    <Button variant="action" height="32px" onClick={handleShare}>
      <Icon as={FiShare2} mr={2} />
      <Text fontSize="9pt">Share</Text>
    </Button>

    <Button variant="action" height="32px" onClick={handleSave}>
      <Icon as={BsBookmark} mr={2} />
      <Text fontSize="9pt">Save</Text>
    </Button>

    {userIsCreator && (
      <Button
        variant="action"
        height="32px"
        onClick={handleDelete}
        isLoading={loadingDelete}
      >
        <Icon as={MdOutlineDelete} mr={2} />
        <Text fontSize="9pt">Delete</Text>
      </Button>
    )}
  </Stack>
);
