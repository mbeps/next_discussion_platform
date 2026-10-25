import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/clientApp";
import {
  checkCommunityPermission,
  checkCommunityViewPermission,
  isSuperAdmin,
} from "@/lib/community/communityPermissions";
import type { Community } from "@/types/community";
import useCommunityState from "./useCommunityState";

/**
 * A custom hook that calculates various permission flags for the current user within a specific community.
 * It determines if the user is the creator, an admin, and whether they have rights to post, comment, or view the community.
 * @param communityData - The community object to check permissions against.
 * @returns An object containing boolean permission flags and a loading state indicator.
 */
const useCommunityPermissions = (communityData?: Community) => {
  const [user, loadingUser] = useAuthState(auth);
  const { communityStateValue } = useCommunityState();

  const loading =
    loadingUser || (!!user && !communityStateValue.snippetFetched);

  if (!communityData) {
    return {
      isCreator: false,
      isAdmin: false,
      canManageAdmins: false,
      canPost: false,
      canComment: false,
      canView: false,
      loading,
    };
  }

  const superAdmin = isSuperAdmin(user?.uid);
  const isCreator = user?.uid === communityData.creatorId;
  const isAdmin =
    superAdmin ||
    isCreator ||
    Boolean(communityData.adminIds?.includes(user?.uid || ""));

  const hasPermission =
    superAdmin ||
    checkCommunityPermission(
      communityData,
      communityStateValue.mySnippets,
      user?.uid,
    );

  const canView =
    superAdmin ||
    checkCommunityViewPermission(
      communityData,
      communityStateValue.mySnippets,
      user?.uid,
    );

  return {
    isCreator,
    isAdmin,
    canManageAdmins: isAdmin,
    canPost: hasPermission,
    canComment: hasPermission,
    canView,
    loading,
  };
};

export default useCommunityPermissions;
