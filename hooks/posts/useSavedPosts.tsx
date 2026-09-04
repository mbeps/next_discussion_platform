import { useAtom, useSetAtom } from "jotai";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { authModalStateAtom } from "@/atoms/authModalAtom";
import { savedPostStateAtom } from "@/atoms/savedPostsAtom";
import { auth } from "@/firebase/clientApp";
import { getSavedPosts as getSavedPostsLib } from "@/lib/posts/getSavedPosts";
import { savePost } from "@/lib/posts/savePost";
import { unsavePost } from "@/lib/posts/unsavePost";
import type { Post } from "@/types/post";
import useCustomToast from "../useCustomToast";

/**
 * A custom hook that manages the user's saved posts.
 * It provides functionality for fetching saved posts, toggling the saved status of a post,
 * and removing posts from the saved collection.
 * @returns An object containing the saved posts state, loading state, and associated handlers.
 */
const useSavedPosts = () => {
  const [user] = useAuthState(auth);
  const [savedPostState, setSavedPostState] = useAtom(savedPostStateAtom);
  const setAuthModalState = useSetAtom(authModalStateAtom);
  const [loading, setLoading] = useState(false);
  const showToast = useCustomToast();

  const fetchSavedPosts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const savedPosts = await getSavedPostsLib(user.uid);

      setSavedPostState((prev) => ({
        ...prev,
        savedPosts,
      }));
    } catch (error: any) {
      console.log("fetchSavedPosts error", error);
      showToast({
        title: "Error fetching saved posts",
        description: error.message,
        status: "error",
      });
    }
    setLoading(false);
  };

  const onSavePost = async (post: Post) => {
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    try {
      const isSaved = savedPostState.savedPosts.find(
        (item) => item.postId === post.id,
      );

      if (isSaved) {
        await unsavePost(user.uid, post.id!);
        setSavedPostState((prev) => ({
          ...prev,
          savedPosts: prev.savedPosts.filter((item) => item.postId !== post.id),
        }));
        showToast({
          title: "Post removed from saved",
          status: "success",
        });
      } else {
        const newSavedPost = await savePost(user.uid, post);
        setSavedPostState((prev) => ({
          ...prev,
          savedPosts: [...prev.savedPosts, newSavedPost],
        }));
        showToast({
          title: "Post saved",
          status: "success",
        });
      }
    } catch (error: any) {
      console.log("onSavePost error", error);
      showToast({
        title: "Error saving post",
        description: error.message,
        status: "error",
      });
    }
  };

  const onRemoveSavedPost = async (postId: string) => {
    if (!user) return;
    try {
      await unsavePost(user.uid, postId);
      setSavedPostState((prev) => ({
        ...prev,
        savedPosts: prev.savedPosts.filter((item) => item.postId !== postId),
      }));
      showToast({
        title: "Post removed from saved",
        status: "success",
      });
    } catch (error: any) {
      console.log("onRemoveSavedPost error", error);
      showToast({
        title: "Error removing saved post",
        description: error.message,
        status: "error",
      });
    }
  };

  const isPostSaved = (postId: string) => {
    return !!savedPostState.savedPosts.find((item) => item.postId === postId);
  };

  return {
    savedPostState,
    setSavedPostState,
    onSavePost,
    onRemoveSavedPost,
    isPostSaved,
    fetchSavedPosts,
    loading,
  };
};

export default useSavedPosts;
