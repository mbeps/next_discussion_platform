import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";

import type { AdminUser } from "../../types/adminUser";

/**
 * Performs a prefix search for users by their email address.
 * This is used in administrative interfaces to find users for promotion or moderation.
 * @param emailQuery - The search string to match against user emails.
 * @returns A promise that resolves to an array of up to 5 matching user objects.
 */
export const searchUsersByEmail = async (
  emailQuery: string,
): Promise<AdminUser[]> => {
  if (emailQuery.length < 3) {
    return [];
  }

  const usersQuery = query(
    collection(firestore, "users"),
    where("email", ">=", emailQuery),
    where("email", "<=", `${emailQuery}\uf8ff`),
    limit(5),
  );

  const snapshot = await getDocs(usersQuery);
  return snapshot.docs.map(
    (doc) => ({ uid: doc.id, ...doc.data() }) as AdminUser,
  );
};
