"use client";
import type React from "react";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/clientApp";
import { useCommunitySnippets } from "@/hooks/community/useCommunitySnippets";
import useSavedPosts from "@/hooks/posts/useSavedPosts";

/**
 * A headless component that initializes global data based on the user's authentication state.
 * Bootstraps community subscriptions and saved posts into global state atoms.
 * @returns null, as this component only performs side effects.
 */
const GlobalHooks: React.FC = () => {
  useCommunitySnippets();
  const { fetchSavedPosts, setSavedPostState } = useSavedPosts();
  const [user] = useAuthState(auth);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run effect when user authentication state changes
  useEffect(() => {
    if (user) {
      fetchSavedPosts();
    } else {
      setSavedPostState((prev) => ({
        ...prev,
        savedPosts: [],
        fetched: false,
      }));
    }
  }, [user]);

  return null;
};
export default GlobalHooks;
