"use client";

import { useCallback, useState } from "react";
import { fetchCommunityMembers } from "@/lib/community/fetchCommunityMembers";
import type { CommunityMember } from "@/types/communityMember";

/**
 * A custom hook that manages the retrieval and state of a community's member list.
 * It provides a loading state and a function to fetch member details from Firestore.
 * @returns An object containing the members array, loading and error states, and the fetch function.
 */
const useCommunityMembers = () => {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async (communityId: string) => {
    setLoading(true);
    try {
      const result = await fetchCommunityMembers(communityId);
      setMembers(result);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load community members", err);
      setMembers([]);
      setError(err?.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    members,
    loading,
    error,
    loadMembers,
  };
};

export default useCommunityMembers;
