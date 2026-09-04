import { useState } from "react";
import { removeCommunityMember } from "@/lib/community/removeCommunityMember";
import useCustomToast from "../useCustomToast";

/**
 * A custom hook that provides functionality for an administrator to remove a member from a community.
 * It handles the backend removal logic and provides feedback via toast notifications.
 * @returns An object containing the `removeMember` function and a loading state indicator.
 */
const useRemoveCommunityMember = () => {
  const showToast = useCustomToast();
  const [loading, setLoading] = useState(false);

  const removeMember = async (communityId: string, memberId: string) => {
    setLoading(true);
    try {
      await removeCommunityMember(communityId, memberId);
      showToast({
        title: "User removed",
        description: "The user has been removed from the community.",
        status: "success",
      });
      return true;
    } catch (error: any) {
      console.error("Error removing member", error);
      showToast({
        title: "Error removing member",
        description: error.message,
        status: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { removeMember, loading };
};

export default useRemoveCommunityMember;
