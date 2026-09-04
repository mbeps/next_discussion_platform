import { useSetAtom } from "jotai";
import { communityStateAtom } from "@/atoms/communitiesAtom";
import { updateCommunityPrivacy } from "@/lib/community/updateCommunityPrivacy";
import type { Community } from "@/types/community";
import useCustomToast from "../useCustomToast";

/**
 * A custom hook that provides functionality for updating a community's privacy setting.
 * It handles the backend update and synchronizes the local Jotai state to reflect the change.
 * @param communityData - The community object whose privacy setting is being updated.
 * @returns An object containing the `updatePrivacyType` function.
 */
const useCommunityPrivacy = (communityData: Community) => {
  const setCommunityStateValue = useSetAtom(communityStateAtom);
  const showToast = useCustomToast();

  const updatePrivacyType = async (privacyType: string) => {
    try {
      await updateCommunityPrivacy(communityData.id, privacyType);
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          privacyType: privacyType,
        } as Community,
      }));
    } catch (error) {
      console.log("Error: onUpdateCommunityPrivacyType", error);
      showToast({
        title: "Privacy Type not Updated",
        description: "There was an error updating the community privacy type",
        status: "error",
      });
    }
  };

  return { updatePrivacyType };
};

export default useCommunityPrivacy;
