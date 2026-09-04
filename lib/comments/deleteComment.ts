import { doc, increment, writeBatch } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";

/**
 * Deletes a comment and all its threaded descendants, then updates the post's comment count.
 * This ensures that deleting a parent comment also removes all replies associated with it.
 * All deletions and the count update are performed in a Firestore batch.
 * @param commentId - The unique identifier of the comment to be deleted.
 * @param postId - The unique identifier of the post the comment belongs to.
 * @param descendantIds - An array of identifiers for all child comments to be deleted.
 * @returns A promise that resolves to the total number of comments deleted.
 */
export const deleteComment = async (
  commentId: string,
  postId: string,
  descendantIds: string[],
) => {
  const batch = writeBatch(firestore);
  const allIdsToDelete = [commentId, ...descendantIds];

  allIdsToDelete.forEach((id) => {
    const commentDocRef = doc(firestore, "comments", id);
    batch.delete(commentDocRef);
  });

  const postDocRef = doc(firestore, "posts", postId);
  batch.update(postDocRef, {
    numberOfComments: increment(-allIdsToDelete.length),
  });

  await batch.commit();
  return allIdsToDelete.length;
};
