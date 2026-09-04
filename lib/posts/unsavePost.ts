import { deleteDoc, doc } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";

/**
 * Removes a previously saved post from a user's personal collection.
 * @param userId - The unique identifier of the user unsaving the post.
 * @param postId - The unique identifier of the post to be removed from the saved list.
 * @returns A promise that resolves when the saved post document is deleted.
 */
export const unsavePost = async (userId: string, postId: string) => {
  await deleteDoc(doc(firestore, `users/${userId}/savedPosts`, postId));
};
