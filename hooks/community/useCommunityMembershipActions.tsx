import { useSetAtom } from "jotai";
import { useAuthState } from "react-firebase-hooks/auth";
import { authModalStateAtom } from "@/atoms/authModalAtom";
import { auth } from "@/firebase/clientApp";
import type { Community } from "@/types/community";
import useJoinCommunity from "./useJoinCommunity";
import useLeaveCommunity from "./useLeaveCommunity";

/**
 * A custom hook that centralizes the logic for joining and leaving communities.
 * It handles authentication gating, triggering the auth modal if necessary, and
 * delegates the actual join/leave operations to specialized hooks.
 * @returns An object containing the `onJoinOrLeaveCommunity` handler and a combined loading state.
 */
const useCommunityMembershipActions = () => {
  const [user] = useAuthState(auth);
  const setAuthModalState = useSetAtom(authModalStateAtom);
  const { joinCommunity, joinLoading } = useJoinCommunity();
  const { leaveCommunity, leaveLoading } = useLeaveCommunity();

  const onJoinOrLeaveCommunity = (
    communityData: Community,
    isJoined: boolean,
  ) => {
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    if (isJoined) {
      leaveCommunity(communityData.id);
      return;
    }
    joinCommunity(communityData);
  };

  return {
    onJoinOrLeaveCommunity,
    loading: joinLoading || leaveLoading,
  };
};

export default useCommunityMembershipActions;
