import { useAtomValue } from "jotai";
import type React from "react";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { communityStateAtom } from "@/atoms/communitiesAtom";
import { auth } from "@/firebase/clientApp";
import { getCommunityPostVotes as getCommunityPostVotesLib } from "@/lib/posts/getCommunityPostVotes";
import type { Post, PostVote } from "@/types/post";

type SetPostState = React.Dispatch<
  React.SetStateAction<{
    selectedPost: Post | null;
    posts: Post[];
    postVotes: PostVote[];
  }>
>;

/**
 * A custom hook that synchronizes the local post vote cache with the authenticated user's votes for the current community.
 * It automatically fetches votes when the user or the current community changes.
 * @param setPostStateValue - A state setter function to update the global post state with fetched votes.
 * @returns This hook does not return any values; it performs synchronization as a side effect.
 */
const usePostVoteSync = (setPostStateValue: SetPostState) => {
  const [user] = useAuthState(auth);
  const currentCommunity = useAtomValue(communityStateAtom).currentCommunity;

  useEffect(() => {
    if (!user || !currentCommunity?.id) {
      return;
    }
    const getCommunityPostVotes = async (communityId: string) => {
      const postVotes = await getCommunityPostVotesLib(user.uid, communityId);
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: postVotes as PostVote[],
      }));
    };

    getCommunityPostVotes(currentCommunity.id);
  }, [user, currentCommunity, setPostStateValue]);

  useEffect(() => {
    if (!user) {
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: [],
      }));
    }
  }, [user, setPostStateValue]);
};

export default usePostVoteSync;
