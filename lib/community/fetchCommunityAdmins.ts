import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";

import type { AdminUser } from "../../types/adminUser";

/**
 * Retrieves the profile information for all administrators of a community.
 * This includes the community creator and any users explicitly added as admins.
 * @param creatorId - The unique identifier of the community creator.
 * @param adminIds - An optional array of unique identifiers for additional community admins.
 * @returns A promise that resolves to an array of admin user objects.
 */
export const fetchCommunityAdmins = async (
  creatorId: string,
  adminIds?: string[],
): Promise<AdminUser[]> => {
  const allAdminIds = [creatorId, ...(adminIds || [])];
  const uniqueAdminIds = Array.from(new Set(allAdminIds));

  const adminPromises = uniqueAdminIds.map((uid) =>
    getDoc(doc(firestore, "users", uid)),
  );
  const adminDocs = await Promise.all(adminPromises);

  const adminUsers = adminDocs
    .map((doc) => {
      if (doc.exists()) {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
        } as AdminUser;
      }
      return null;
    })
    .filter((user): user is AdminUser => user !== null);

  return adminUsers;
};
