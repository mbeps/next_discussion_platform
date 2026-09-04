import type { User } from "firebase/auth";
import {
  collection,
  doc,
  increment,
  serverTimestamp,
  type Timestamp,
  writeBatch,
} from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";
import type { Comment } from "@/types/comment";

/**
 * Creates a new comment on a post and updates the post's comment count.
 * This function supports threaded comments up to a maximum depth of 2.
 * All operations are performed in a Firestore batch to ensure atomicity.
 * @param user - The Firebase Auth user object of the comment creator.
 * @param communityId - The unique identifier of the community where the post resides.
 * @param postId - The unique identifier of the post being commented on.
 * @param postTitle - The title of the post, cached for display in user activity feeds.
 * @param commentText - The content of the comment.
 * @param depth - The nesting level of the comment (0 for top-level, 1 for reply, etc.).
 * @param parentId - The identifier of the parent comment if this is a reply.
 * @returns A promise that resolves to the newly created comment object.
 * @throws Error if the maximum comment depth is exceeded.
 */
export const createComment = async (
  user: User,
  communityId: string,
  postId: string,
  postTitle: string,
  commentText: string,
  depth: number,
  parentId?: string,
) => {
  if (depth > 2) {
    throw new Error(
      "Maximum comment depth reached. You cannot reply to this comment.",
    );
  }

  const batch = writeBatch(firestore);
  const commentDocRef = doc(collection(firestore, "comments"));
  const newComment: Comment = {
    id: commentDocRef.id,
    creatorId: user.uid,
    creatorDisplayText: user.email!.split("@")[0],
    communityId: communityId,
    postId: postId,
    postTitle: postTitle,
    text: commentText,
    createdAt: serverTimestamp() as Timestamp,
    parentId: parentId || undefined,
    depth: depth,
  };

  if (!parentId) delete newComment.parentId;

  batch.set(commentDocRef, newComment);

  const postDocRef = doc(firestore, "posts", postId);
  batch.update(postDocRef, {
    numberOfComments: increment(1),
  });

  await batch.commit();
  return newComment;
};
