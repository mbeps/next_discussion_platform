import { Flex, Stack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import ConfirmationDialog from "@/components/modal/ConfirmationDialog";
import useSavedPosts from "@/hooks/posts/useSavedPosts";
import useCustomToast from "@/hooks/useCustomToast";
import type { Post } from "@/types/post";
import PostItemError from "../../ui/ErrorMessage";
import PostActions from "./PostActions";
import PostBody from "./PostBody";
import PostDetails from "./PostDetails";
import PostTitle from "./PostTitle";
import VoteSection from "./VoteSection";

/**
 * Interface for the PostItem component properties.
 * @param post - The post data to render.
 * @param userIsCreator - Whether the current user is the author of the post.
 * @param userIsAdmin - Whether the current user has administrative rights in the community.
 * @param userVoteValue - The current user's vote on this post (1, -1, or 0).
 * @param onVote - Callback to handle voting actions.
 * @param onDeletePost - Callback to handle post deletion.
 * @param onSelectPost - Optional callback to navigate to the post's detail page.
 * @param showCommunityImage - Whether to display the community's avatar.
 * @param votingDisabled - Whether voting is restricted for the current user.
 */
type PostItemProps = {
  post: Post;
  userIsCreator: boolean;
  userIsAdmin?: boolean;
  userVoteValue?: number;
  onVote: (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string,
  ) => void;
  onDeletePost: (post: Post) => Promise<boolean>;
  onSelectPost?: (post: Post) => void;
  showCommunityImage?: boolean;
  votingDisabled?: boolean;
};

/**
 * A comprehensive card component for displaying post summaries or details.
 * Includes sections for voting, metadata, content preview, and moderation actions.
 * @param props - Component properties.
 * @returns A themed card representing a post.
 */
const PostItem: React.FC<PostItemProps> = ({
  post,
  userIsCreator,
  userIsAdmin = false,
  userVoteValue,
  onVote,
  onDeletePost,
  onSelectPost,
  showCommunityImage: _showCommunityImage,
  votingDisabled: _votingDisabled,
}) => {
  const [loadingImage, setLoadingImage] = useState(true);
  const [error, setError] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const router = useRouter();
  const showToast = useCustomToast();
  const { onSavePost, isPostSaved } = useSavedPosts();
  const isSaved = isPostSaved(post.id!);

  const singlePostPage = !onSelectPost;

  const handleDeleteClick = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    setDeleteConfirmationOpen(true);
  };

  const onConfirmDelete = async () => {
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
        if (post.communityId) {
          router.push(`/community/${post.communityId}`); // redirect to the community page
        } else {
          router.push("/"); // redirect to home if communityId is missing
        }
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
      setDeleteConfirmationOpen(false);
    }
  };

  const getPostLink = () => {
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    return `${baseUrl}/community/${post.communityId}/comments/${post.id}`;
  };

  const handleSave = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    await onSavePost(post);
  };

  return (
    <Flex
      border="1px solid"
      bg={{ base: "white", _dark: "gray.800" }}
      borderColor={{ base: "gray.300", _dark: "gray.700" }}
      borderRadius={"xl"}
      _hover={{
        borderColor: singlePostPage
          ? "none"
          : { base: "gray.400", _dark: "gray.600" },
        boxShadow: singlePostPage ? undefined : "sm",
      }}
      cursor={singlePostPage ? "unset" : "pointer"}
      onClick={() => onSelectPost?.(post)} // if a post is selected then open post
      shadow="md"
    >
      {/* Left Section */}
      <Flex
        direction="column"
        align="center"
        bg={singlePostPage ? "none" : { base: "gray.100", _dark: "gray.700" }}
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
        <Stack gap={1} p="12px">
          <PostDetails showCommunityImage={true} post={post} />
          <PostTitle post={post} />
          <PostBody
            post={post}
            loadingImage={loadingImage}
            setLoadingImage={setLoadingImage}
          />
        </Stack>
        <PostActions
          handleDelete={handleDeleteClick}
          loadingDelete={loadingDelete}
          userIsCreator={userIsCreator}
          userIsAdmin={userIsAdmin}
          postLink={getPostLink()}
          handleSave={handleSave}
          isSaved={isSaved}
          showToast={showToast}
        />
        <PostItemError
          error={error}
          message={"There was an error when loading this post"}
        />
        <ConfirmationDialog
          open={deleteConfirmationOpen}
          onClose={() => setDeleteConfirmationOpen(false)}
          onConfirm={onConfirmDelete}
          title="Delete Post"
          body="Are you sure you want to delete this post? This action cannot be undone."
          confirmButtonText="Delete"
          isLoading={loadingDelete}
        />
      </Flex>
    </Flex>
  );
};
export default PostItem;
