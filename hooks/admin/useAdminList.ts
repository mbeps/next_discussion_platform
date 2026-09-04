import { useCallback, useState } from "react";
import { fetchCommunityAdmins } from "@/lib/community/fetchCommunityAdmins";
import type { AdminUser } from "@/types/adminUser";

/**
 * A custom hook that manages the retrieval and storage of a community's administrator list.
 * It provides a loading state and a function to fetch admin details from Firestore.
 * @returns An object containing the admin list, a setter for the list, a loading flag, and the fetch function.
 */
const useAdminList = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAdmins = useCallback(
    async (creatorId: string, adminIds?: string[]) => {
      setLoading(true);
      try {
        const result = await fetchCommunityAdmins(creatorId, adminIds);
        setAdmins(result);
      } catch (error: any) {
        console.error("Error fetching admins", error);
        setAdmins([]);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { admins, setAdmins, loading, loadAdmins };
};

export default useAdminList;
