import type { User } from "firebase/auth";
import { useSetAtom } from "jotai";
import { type Dispatch, type SetStateAction, useState } from "react";
import { postStateAtom } from "@/atoms/postsAtom";
import useCustomToast from "@/hooks/useCustomToast";
import { createComment } from "@/lib/comments/createComment";
import { checkCommunityPermission } from "@/lib/community/communityPermissions";
import type { Post } from "@/types/post";
import type { Comment } from "../../types/comment";
import useCommunityState from "../community/useCommunityState";

/**
 * A custom hook that provides functionality for creating new comments and replies.
 * It handles permission checks for restricted communities and updates the local post state to reflect the new comment count.
 * @param selectedPost - The post being commented on.
 * @param setComments - A state setter function to update the local comments list.
 * @returns An object containing the `onCreateComment` function and a loading state indicator.
 */
const useCreateComment = (
  selectedPost: Post | null,
  setComments: Dispatch<SetStateAction<Comment[]>>,
) => {
  const setPostState = useSetAtom(postStateAtom);
  const showToast = useCustomToast();
  const [createLoading, setCreateLoading] = useState(false);
  const { communityStateValue } = useCommunityState();

  const onCreateComment = async (
    user: User,
    commentText: string,
    parentId?: string,
    depth: number = 0,
  ) => {
    if (!selectedPost) return;
    setCreateLoading(true);

    // Check for restricted community permissions
    const currentCommunity = communityStateValue.currentCommunity;
    if (currentCommunity?.id === selectedPost.communityId) {
      const hasPermission = checkCommunityPermission(
        currentCommunity,
        communityStateValue.mySnippets,
      );

      if (!hasPermission) {
        showToast({
          title: "Restricted Community",
          description: "You must be a member to comment in this community.",
          status: "error",
        });
        setCreateLoading(false);
        return;
      }
    }

    try {
      const newComment = await createComment(
        user,
        selectedPost.communityId,
        selectedPost.id!,
        selectedPost.title,
        commentText,
        depth,
        parentId,
      );

      setComments((prev) => [newComment, ...prev]);
      setPostState((prev) => ({
        ...prev,
        selectedPost: {
          ...prev.selectedPost!,
          numberOfComments: prev.selectedPost!.numberOfComments + 1,
        },
      }));
    } catch (error: any) {
      console.log("onCreateComment error", error);
      showToast({
        title: "Comment failed",
        description:
          error.message || "There was an error creating your comment",
        status: "error",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  return {
    createComment: onCreateComment,
    createLoading,
  };
};

export default useCreateComment;
