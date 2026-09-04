import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";

/**
 * Updates the privacy setting for a community.
 * This determines whether the community is public, restricted, or private.
 * @param communityId - The unique identifier of the community.
 * @param privacyType - The new privacy setting to be applied.
 * @returns A promise that resolves when the community document is updated.
 */
export const updateCommunityPrivacy = async (
  communityId: string,
  privacyType: string,
) => {
  await updateDoc(doc(firestore, "communities", communityId), {
    privacyType,
  });
};
