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
 * Updates the display name of the creator across all their existing comments.
 * This ensures that name changes are propagated throughout the platform's comment threads.
 * The updates are performed in a Firestore batch for efficiency.
 * @param userId - The unique identifier of the user whose comments are being updated.
 * @param newUserName - The new display name to be applied to all the user's comments.
 * @returns A promise that resolves when all comment documents have been updated.
 */
export const updateUserCommentsName = async (
  userId: string,
  newUserName: string,
) => {
  const commentsQuery = query(
    collection(firestore, "comments"),
    where("creatorId", "==", userId),
  );
  const commentsSnapshot = await getDocs(commentsQuery);

  const batch = writeBatch(firestore);

  commentsSnapshot.forEach((commentDoc) => {
    const commentRef = doc(firestore, "comments", commentDoc.id);
    batch.update(commentRef, { creatorDisplayText: newUserName });
  });

  await batch.commit();
};
