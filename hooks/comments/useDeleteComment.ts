import { useSetAtom } from "jotai";
import { type Dispatch, type SetStateAction, useState } from "react";
import { postStateAtom } from "@/atoms/postsAtom";
import useCustomToast from "@/hooks/useCustomToast";
import { deleteComment } from "@/lib/comments/deleteComment";
import type { Comment } from "../../types/comment";

/**
 * A custom hook that provides functionality for deleting comments and their threaded replies.
 * It calculates all descendant comment IDs to ensure a clean cascading delete and updates the post's comment count.
 * @param comments - The current list of comments for the post.
 * @param setComments - A state setter function to update the local comments list.
 * @returns An object containing the `onDeleteComment` function and the ID of the comment currently being deleted.
 */
const useDeleteComment = (
  comments: Comment[],
  setComments: Dispatch<SetStateAction<Comment[]>>,
) => {
  const setPostState = useSetAtom(postStateAtom);
  const showToast = useCustomToast();
  const [deleteLoadingId, setDeleteLoadingId] = useState("");

  const onDeleteComment = async (comment: Comment) => {
    setDeleteLoadingId(comment.id);
    try {
      const getDescendantIds = (parentId: string): string[] => {
        const children = comments.filter((c) => c.parentId === parentId);
        let ids = children.map((c) => c.id);
        children.forEach((child) => {
          ids = [...ids, ...getDescendantIds(child.id)];
        });
        return ids;
      };

      const descendantIds = getDescendantIds(comment.id);
      const allIdsToDelete = [comment.id, ...descendantIds];

      await deleteComment(comment.id, comment.postId, descendantIds);

      setComments((prev) =>
        prev.filter((item) => !allIdsToDelete.includes(item.id)),
      );
      setPostState((prev) => ({
        ...prev,
        selectedPost: {
          ...prev.selectedPost!,
          numberOfComments:
            prev.selectedPost!.numberOfComments - allIdsToDelete.length,
        },
      }));
    } catch (error: any) {
      console.log("onDeleteComment error", error);
      showToast({
        title: "Delete failed",
        description: "There was an error deleting your comment",
        status: "error",
      });
    } finally {
      setDeleteLoadingId("");
    }
  };

  return {
    deleteComment: onDeleteComment,
    deleteLoadingId,
  };
};

export default useDeleteComment;
