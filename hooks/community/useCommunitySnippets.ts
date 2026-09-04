import { collection, getDocs } from "firebase/firestore";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { communityStateAtom } from "@/atoms/communitiesAtom";
import { auth, firestore } from "@/firebase/clientApp";
import type { CommunitySnippet } from "@/types/community";
import useCustomToast from "../useCustomToast";

/**
 * A custom hook that fetches and manages the current user's community membership snippets.
 * These snippets are used to determine which communities the user has joined and their roles within them.
 * @returns An object containing the loading state and any error message encountered during fetching.
 */
export const useCommunitySnippets = () => {
  const [user] = useAuthState(auth);
  const setCommunityStateValue = useSetAtom(communityStateAtom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const showToast = useCustomToast();

  const getMySnippets = async () => {
    setLoading(true);
    try {
      const snippetDocs = await getDocs(
        collection(firestore, `users/${user?.uid}/communitySnippets`),
      );
      const snippets = snippetDocs.docs.map((doc) => ({ ...doc.data() }));
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: snippets as CommunitySnippet[],
        snippetFetched: true,
      }));
    } catch (error: any) {
      console.log("Error: getMySnippets", error);
      setError(error.message);
      showToast({
        title: "Subscriptions not Found",
        description: "There was an error fetching your subscriptions",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Fetch snippets only when user changes
  useEffect(() => {
    if (!user) {
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [],
        snippetFetched: false,
      }));
      return;
    }
    getMySnippets();
  }, [user]);

  return { loading, error };
};
