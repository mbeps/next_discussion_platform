import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";

/**
 * Updates the creator's username across all their existing posts.
 * This ensures that name changes are propagated throughout the platform's post feeds.
 * The updates are performed in a Firestore batch for efficiency.
 * @param userId - The unique identifier of the user whose posts are being updated.
 * @param newUserName - The new username or display name to be applied to all the user's posts.
 * @returns A promise that resolves when all post documents have been updated.
 */
export const updateUserPostsName = async (
  userId: string,
  newUserName: string,
) => {
  const postsQuery = query(
    collection(firestore, "posts"),
    where("creatorId", "==", userId),
  );
  const postsSnapshot = await getDocs(postsQuery);

  const batch = writeBatch(firestore);

  postsSnapshot.forEach((postDoc) => {
    const postRef = doc(firestore, "posts", postDoc.id);
    batch.update(postRef, { creatorUsername: newUserName });
  });

  await batch.commit();
};
