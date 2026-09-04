import { doc, increment, writeBatch } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";
import type { CommunitySnippet } from "@/types/community";

/**
 * Joins a user to a community by creating a membership snippet and incrementing the member count.
 * This operation is performed as a batch write to ensure data consistency.
 * @param userId - The unique identifier of the user joining the community.
 * @param communityId - The unique identifier of the community being joined.
 * @param communityImageURL - The current image URL of the community to be stored in the user's snippet.
 * @param isCreatorOrAdmin - Whether the user should be granted admin privileges upon joining.
 * @returns A promise that resolves to the newly created community snippet.
 */
export const joinCommunity = async (
  userId: string,
  communityId: string,
  communityImageURL: string,
  isCreatorOrAdmin: boolean,
) => {
  const batch = writeBatch(firestore);

  const newSnippet: CommunitySnippet = {
    communityId: communityId,
    imageURL: communityImageURL || "",
    isAdmin: isCreatorOrAdmin,
  };

  batch.set(
    doc(firestore, `users/${userId}/communitySnippets`, communityId),
    newSnippet,
  );

  batch.update(doc(firestore, "communities", communityId), {
    numberOfMembers: increment(1),
  });

  await batch.commit();
  return newSnippet;
};
