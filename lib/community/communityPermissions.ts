import { env } from "@/lib/env";
import type { Community, CommunitySnippet } from "@/types/community";

/**
 * Checks if a user is the global super administrator configured in NEXT_PUBLIC_SUPER_ADMIN_UID.
 *
 * @param userId - UID of the authenticated user to check.
 * @returns True if the user is the super administrator, otherwise false.
 */
export const isSuperAdmin = (userId?: string | null): boolean => {
  if (!userId) return false;
  const configuredAdminUid = env.NEXT_PUBLIC_SUPER_ADMIN_UID?.trim().replace(
    /^['"]|['"]$/g,
    "",
  );
  if (!configuredAdminUid) return false;
  return userId.trim() === configuredAdminUid;
};

/**
 * Checks if a user has permission to perform an action in a community.
 * Currently supports checking for 'post' and 'comment' actions based on community privacy settings.
 *
 * @param community - The community to check permissions for.
 * @param userSnippets - The list of community snippets for the user (indicating membership).
 * @param userId - Optional UID of the authenticated user.
 * @returns True if the user has permission, otherwise false.
 */
export const checkCommunityPermission = (
  community: Community,
  userSnippets: CommunitySnippet[],
  userId?: string | null,
): boolean => {
  if (isSuperAdmin(userId)) {
    return true;
  }
  if (
    community.privacyType === "restricted" ||
    community.privacyType === "private"
  ) {
    return !!userSnippets.find(
      (snippet) => snippet.communityId === community.id,
    );
  }
  // Public communities allow everyone to post/comment (assuming they are authenticated, which is checked elsewhere)
  return true;
};

/**
 * Checks if a user has permission to view content in a community.
 *
 * @param community - The community to check permissions for.
 * @param userSnippets - The list of community snippets for the user (indicating membership).
 * @param userId - Optional UID of the authenticated user.
 * @returns True if the user has permission to view, otherwise false.
 */
export const checkCommunityViewPermission = (
  community: Community,
  userSnippets: CommunitySnippet[],
  userId?: string | null,
): boolean => {
  if (isSuperAdmin(userId)) {
    return true;
  }
  if (community.privacyType === "private") {
    return !!userSnippets.find(
      (snippet) => snippet.communityId === community.id,
    );
  }
  // Public and restricted communities allow everyone to view content
  return true;
};
