import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";

import type { AdminUser } from "../../types/adminUser";

/**
 * Searches for a user in the Firestore 'users' collection by their exact email address.
 * This is primarily used for administrative tasks like adding a community admin.
 * @param email - The exact email address of the user to find.
 * @returns A promise that resolves to the user object if found, or null if no match exists.
 */
export const findUserByEmail = async (
  email: string,
): Promise<AdminUser | null> => {
  const usersQuery = query(
    collection(firestore, "users"),
    where("email", "==", email),
  );
  const userDocs = await getDocs(usersQuery);

  if (userDocs.empty) {
    return null;
  }

  const userDoc = userDocs.docs[0];
  return { uid: userDoc.id, ...userDoc.data() } as AdminUser;
};
