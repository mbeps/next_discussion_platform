import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCommunity } from "@/lib/community/deleteCommunity";
import type { Community } from "@/types/community";
import useCustomToast from "../useCustomToast";

/**
 * A custom hook that provides functionality for deleting a community and all its associated data.
 * It handles the cascading deletion process and provides feedback via toasts and navigation.
 * @param communityData - The community object to be deleted.
 * @returns An object containing the `deleteCommunity` function and a loading state indicator.
 */
const useDeleteCommunity = (communityData: Community) => {
  const router = useRouter();
  const showToast = useCustomToast();
  const [loading, setLoading] = useState(false);

  const onDeleteCommunity = async () => {
    setLoading(true);
    try {
      await deleteCommunity(communityData);

      showToast({
        title: "Community Deleted",
        description: "Community has been deleted successfully",
        status: "success",
      });

      router.push("/");
    } catch (error) {
      console.log("Error: deleteCommunity", error);
      showToast({
        title: "Community not Deleted",
        description: "There was an error deleting the community",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return { deleteCommunity: onDeleteCommunity, loading };
};

export default useDeleteCommunity;
