import { useAtom, useSetAtom } from "jotai";
import type React from "react";
import { postStateAtom } from "@/atoms/postsAtom";
import { savedPostStateAtom } from "@/atoms/savedPostsAtom";
import { deletePost } from "@/lib/posts/deletePost";
import type { Post, PostVote } from "@/types/post";

/**
 * A custom hook that provides functionality for deleting a post and its associated data.
 * It optimistically updates the local post and saved post states and handles rollback if the deletion fails.
 * @param setPostStateValue - A state setter function to update the global post state.
 * @returns An object containing the `onDeletePost` function and the current post state value.
 */
const usePostDeletion = (
  setPostStateValue: React.Dispatch<
    React.SetStateAction<{
      selectedPost: Post | null;
      posts: Post[];
      postVotes: PostVote[];
    }>
  >,
) => {
  const [postStateValue] = useAtom(postStateAtom);
  const setSavedPostState = useSetAtom(savedPostStateAtom);

  const onDeletePost = async (post: Post): Promise<boolean> => {
    setPostStateValue((prev) => ({
      ...prev,
      posts: prev.posts.filter((item) => item.id !== post.id),
    }));

    setSavedPostState((prev) => ({
      ...prev,
      savedPosts: prev.savedPosts.filter((item) => item.postId !== post.id),
    }));

    try {
      await deletePost(post);
      return true;
    } catch (error) {
      console.log("Error deleting post", error);
      setPostStateValue((prev) => ({
        ...prev,
        posts: [...prev.posts, post],
      }));
      return false;
    }
  };

  return { onDeletePost, postStateValue };
};

export default usePostDeletion;
