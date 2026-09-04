import { useCallback, useEffect, useState } from "react";
import useCustomToast from "@/hooks/useCustomToast";
import { getComments as getCommentsLib } from "@/lib/comments/getComments";
import type { Post } from "@/types/post";
import type { Comment } from "../../types/comment";

/**
 * A custom hook that manages the retrieval and state of comments for a specific post.
 * It automatically fetches comments when the selected post changes and provides a loading state.
 * @param selectedPost - The post object for which comments are being loaded.
 * @returns An object containing the comments array, a setter for comments, a loading flag, and a function to reload comments.
 */
const useCommentList = (selectedPost: Post | null) => {
  const showToast = useCustomToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentFetchLoading, setCommentFetchLoading] = useState(true);

  const loadComments = useCallback(async () => {
    if (!selectedPost) return;
    setCommentFetchLoading(true);
    try {
      const comments = await getCommentsLib(selectedPost.id!);
      setComments(comments);
    } catch (error: any) {
      console.log("getPostComments error", error);
      showToast({
        title: "Error fetching comments",
        description: "There was an error fetching comments",
        status: "error",
      });
    } finally {
      setCommentFetchLoading(false);
    }
  }, [selectedPost, showToast]);

  useEffect(() => {
    if (selectedPost) {
      loadComments();
    }
  }, [selectedPost, loadComments]);

  return {
    comments,
    setComments,
    commentFetchLoading,
    loadComments,
  };
};

export default useCommentList;
