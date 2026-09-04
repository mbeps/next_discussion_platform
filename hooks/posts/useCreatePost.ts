import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useCustomToast from "@/hooks/useCustomToast";
import { checkCommunityPermission } from "@/lib/community/communityPermissions";
import { createPost } from "@/lib/posts/createPost";
import useCommunityState from "../community/useCommunityState";

/**
 * A custom hook that provides functionality for creating a new post.
 * It handles permission checks for restricted communities, image uploads, and provides feedback via toasts.
 * @returns An object containing the `handleCreatePost` function, loading state, and error state.
 */
const useCreatePost = () => {
  const router = useRouter();
  const showToast = useCustomToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { communityStateValue } = useCommunityState();

  const handleCreatePost = async (
    user: User,
    communityId: string,
    communityImageURL: string | undefined,
    postData: { title: string; body: string },
    selectedFile?: string,
  ) => {
    if (!user) return;
    setLoading(true);

    // Check for restricted community permissions
    const currentCommunity = communityStateValue.currentCommunity;
    if (currentCommunity?.id === communityId) {
      const hasPermission = checkCommunityPermission(
        currentCommunity,
        communityStateValue.mySnippets,
      );

      if (!hasPermission) {
        showToast({
          title: "Restricted Community",
          description: "You must be a member to post in this community.",
          status: "error",
        });
        setLoading(false);
        return;
      }
    }

    try {
      await createPost(
        user,
        communityId,
        communityImageURL,
        postData,
        selectedFile,
      );

      router.back();
      showToast({
        title: "Post Created",
        description: "Your post has been created successfully",
        status: "success",
      });
    } catch (error: any) {
      console.log("handleCreatePost error", error);
      setError(true);
      showToast({
        title: "Error Creating Post",
        description: "There was an error creating your post",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    handleCreatePost,
    loading,
    error,
  };
};

export default useCreatePost;
