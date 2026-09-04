import { useCallback } from "react";
import { findUserByEmail } from "@/lib/community/findUserByEmail";
import { searchUsersByEmail } from "@/lib/community/searchUsersByEmail";

/**
 * A custom hook that provides utility functions for searching and finding users by email.
 * This is primarily used in the admin management interface to identify users for promotion.
 * @returns An object containing functions for searching multiple users and finding a single user by email.
 */
const useAdminSearch = () => {
  const searchUsers = useCallback(async (emailQuery: string) => {
    try {
      return await searchUsersByEmail(emailQuery);
    } catch (error: any) {
      console.error("Error searching users", error);
      return [];
    }
  }, []);

  const findUser = useCallback(async (email: string) => {
    try {
      return await findUserByEmail(email);
    } catch (error: any) {
      console.error("Error finding user", error);
      throw error;
    }
  }, []);

  return {
    searchUsers,
    findUser,
  };
};

export default useAdminSearch;
