import { useSetAtom } from "jotai";
import { type Dispatch, type SetStateAction, useCallback } from "react";
import { communityStateAtom } from "@/atoms/communitiesAtom";
import { addCommunityAdmin } from "@/lib/community/addCommunityAdmin";
import type { AdminUser } from "@/types/adminUser";
import type { Community } from "@/types/community";

/**
 * A custom hook that provides functionality for adding a new administrator to a community.
 * It handles the backend promotion logic and synchronizes the local Jotai state to reflect the change.
 * @returns An object containing the `handleAddAdmin` callback function.
 */
const useAddAdmin = () => {
  const setCommunityStateValue = useSetAtom(communityStateAtom);

  const handleAddAdmin = useCallback(
    async (
      communityId: string,
      newUser: AdminUser,
      communityImageURL?: string,
      updateAdmins?: Dispatch<SetStateAction<AdminUser[]>>,
    ) => {
      await addCommunityAdmin(communityId, newUser.uid, communityImageURL);

      if (updateAdmins) {
        updateAdmins((prev) => [...prev, newUser]);
      }

      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity!,
          adminIds: [...(prev.currentCommunity?.adminIds || []), newUser.uid],
        } as Community,
      }));
    },
    [setCommunityStateValue],
  );

  return { handleAddAdmin };
};

export default useAddAdmin;
