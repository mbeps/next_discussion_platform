import { arrayRemove, doc, getDoc, writeBatch } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";

/**
 * Demotes a user from an admin role within a specific community.
 * This function removes the user from the community's admin list and updates their membership snippet.
 * The user remains a member of the community but loses administrative privileges.
 * @param communityId - The unique identifier of the community.
 * @param userId - The unique identifier of the user to be demoted.
 * @returns A promise that resolves when the demotion batch write is complete.
 */
export const removeCommunityAdmin = async (
  communityId: string,
  userId: string,
): Promise<void> => {
  const snippetRef = doc(
    firestore,
    `users/${userId}/communitySnippets/${communityId}`,
  );
  const snippetDoc = await getDoc(snippetRef);

  const batch = writeBatch(firestore);
  const communityRef = doc(firestore, "communities", communityId);

  batch.update(communityRef, {
    adminIds: arrayRemove(userId),
  });

  if (snippetDoc.exists()) {
    batch.update(snippetRef, {
      isAdmin: false,
    });
  }

  await batch.commit();
};
