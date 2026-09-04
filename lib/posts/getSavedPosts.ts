import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";
import type { SavedPost } from "@/types/savedPost";

/**
 * Retrieves all posts saved by a specific user from their personal 'savedPosts' subcollection.
 * This is used to populate the 'Saved' tab in the user's profile or dashboard.
 * @param userId - The unique identifier of the user whose saved posts are being retrieved.
 * @returns A promise that resolves to an array of saved post objects.
 */
export const getSavedPosts = async (userId: string) => {
  const querySnapshot = await getDocs(
    collection(firestore, `users/${userId}/savedPosts`),
  );
  const savedPosts = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as SavedPost[];
  return savedPosts;
};
