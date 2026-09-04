import { doc, increment, writeBatch } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";

/**
 * Removes a user from a community by deleting their membership snippet and decrementing the member count.
 * This operation is performed as a batch write to ensure data consistency.
 * @param userId - The unique identifier of the user leaving the community.
 * @param communityId - The unique identifier of the community being left.
 * @returns A promise that resolves when the batch write is successfully committed.
 */
export const leaveCommunity = async (userId: string, communityId: string) => {
  const batch = writeBatch(firestore);

  batch.delete(
    doc(firestore, `users/${userId}/communitySnippets`, communityId),
  );

  batch.update(doc(firestore, "communities", communityId), {
    numberOfMembers: increment(-1),
  });

  await batch.commit();
};
