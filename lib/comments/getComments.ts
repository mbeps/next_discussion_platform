import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";
import type { Comment } from "@/types/comment";

/**
 * Retrieves all comments for a specific post, ordered by creation time in descending order.
 * This is used to populate the comment section of a post detail page.
 * @param postId - The unique identifier of the post whose comments are being retrieved.
 * @returns A promise that resolves to an array of comment objects.
 */
export const getComments = async (postId: string) => {
  const commentsQuery = query(
    collection(firestore, "comments"),
    where("postId", "==", postId),
    orderBy("createdAt", "desc"),
  );
  const commentDocs = await getDocs(commentsQuery);
  const comments = commentDocs.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Comment[];
  return comments;
};
