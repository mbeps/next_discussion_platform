import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";

/**
 * Orchestrates the creation of a new community and the initial membership for the creator.
 * Executes as a transaction to ensure that the community document and the user's membership snippet are created atomically.
 * @param communityName - The unique identifier for the new community.
 * @param communityType - The privacy setting (public, restricted, or private).
 * @param userId - The ID of the user creating the community.
 * @returns A promise that resolves when the transaction is successfully committed.
 */
export const createCommunity = async (
  communityName: string,
  communityType: string,
  userId: string,
) => {
  const communityDocRef = doc(firestore, "communities", communityName);

  await runTransaction(firestore, async (transaction) => {
    const communityDoc = await transaction.get(communityDocRef);
    if (communityDoc.exists()) {
      throw new Error(`Sorry, /r/${communityName} is taken. Try another.`);
    }

    // create community
    transaction.set(communityDocRef, {
      creatorId: userId,
      createdAt: serverTimestamp(),
      numberOfMembers: 1,
      privacyType: communityType,
    });

    // create community snippet on user
    transaction.set(
      doc(firestore, `users/${userId}/communitySnippets`, communityName),
      {
        communityId: communityName,
        isAdmin: true,
      },
    );
  });
};
