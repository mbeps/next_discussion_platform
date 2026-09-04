import { doc, increment, writeBatch } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";

/**
 * Removes a user from a community by deleting their membership snippet and decrementing the member count.
 * This is typically used by community administrators to moderate the member list.
 * @param communityId - The unique identifier of the community.
 * @param memberId - The unique identifier of the user to be removed.
 * @returns A promise that resolves when the removal batch write is successfully committed.
 */
export const removeCommunityMember = async (
  communityId: string,
  memberId: string,
) => {
  try {
    const batch = writeBatch(firestore);

    // Delete the user's community snippet
    batch.delete(
      doc(firestore, `users/${memberId}/communitySnippets`, communityId),
    );

    // Decrement the community member count
    batch.update(doc(firestore, "communities", communityId), {
      numberOfMembers: increment(-1),
    });

    await batch.commit();
  } catch (error) {
    console.error("Error removing community member", error);
    throw error;
  }
};
