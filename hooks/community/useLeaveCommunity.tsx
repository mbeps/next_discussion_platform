import { useSetAtom } from "jotai";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { communityStateAtom } from "@/atoms/communitiesAtom";
import { auth } from "@/firebase/clientApp";
import { leaveCommunity } from "@/lib/community/leaveCommunity";
import useCustomToast from "../useCustomToast";

/**
 * A custom hook that provides functionality for a user to leave a community.
 * It handles the backend leave logic, removes the user's membership snippet,
 * and decrements the community's member count in the local Jotai state.
 * @returns An object containing the `leaveCommunity` function, loading state, and error state.
 */
const useLeaveCommunity = () => {
  const [user] = useAuthState(auth);
  const setCommunityStateValue = useSetAtom(communityStateAtom);
  const showToast = useCustomToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onLeaveCommunity = async (communityId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await leaveCommunity(user.uid, communityId);

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.filter(
          (item) => item.communityId !== communityId,
        ),
        currentCommunity:
          prev.currentCommunity?.id === communityId
            ? {
                ...prev.currentCommunity,
                numberOfMembers: prev.currentCommunity.numberOfMembers - 1,
              }
            : prev.currentCommunity,
      }));
    } catch (error: any) {
      console.log("Error: leaveCommunity", error.message);
      setError(error.message);
      showToast({
        title: "Could not Unsubscribe",
        description: "There was an error unsubscribing from the community",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    leaveCommunity: onLeaveCommunity,
    leaveLoading: loading,
    leaveError: error,
  };
};

export default useLeaveCommunity;
