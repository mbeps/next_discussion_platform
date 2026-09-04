import { useSetAtom } from "jotai";
import type React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { authModalStateAtom } from "@/atoms/authModalAtom";
import { auth } from "@/firebase/clientApp";
import { getCommunityData } from "@/lib/community/getCommunityData";
import { getPost as getPostLib } from "@/lib/posts/getPost";
import { getPostVotes as getPostVotesLib } from "@/lib/posts/getPostVotes";
import { handlePostVote } from "@/lib/posts/handlePostVote";
import type { Post, PostVote } from "@/types/post";
import useCommunityState from "../community/useCommunityState";
import useCustomToast from "../useCustomToast";

type SetPostState = React.Dispatch<
  React.SetStateAction<{
    selectedPost: Post | null;
    posts: Post[];
    postVotes: PostVote[];
  }>
>;

/**
 * A custom hook that manages the voting logic for posts.
 * It handles permission checks for restricted communities, processes upvotes and downvotes,
 * and synchronizes the local post state with the backend voting results.
 * @param postStateValue - The current state of posts and their associated votes.
 * @param setPostStateValue - A state setter function to update the global post state.
 * @returns An object containing functions for voting, loading votes, and fetching post data.
 */
const usePostVote = (
  postStateValue: {
    selectedPost: Post | null;
    posts: Post[];
    postVotes: PostVote[];
  },
  setPostStateValue: SetPostState,
) => {
  const [user] = useAuthState(auth);
  const setAuthModalState = useSetAtom(authModalStateAtom);
  const showToast = useCustomToast();
  const { communityStateValue } = useCommunityState();

  const onVote = async (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string,
  ) => {
    event.stopPropagation();

    if (!user?.uid) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    // Check permissions
    const isMember = !!communityStateValue.mySnippets.find(
      (snippet) => snippet.communityId === communityId,
    );

    if (!isMember) {
      let community = communityStateValue.currentCommunity;

      if (!community || community.id !== communityId) {
        try {
          community = await getCommunityData(communityId);
        } catch (error) {
          console.log(
            "Error fetching community data for vote permission",
            error,
          );
        }
      }

      if (
        community &&
        (community.privacyType === "restricted" ||
          community.privacyType === "private")
      ) {
        showToast({
          title: "Restricted Community",
          description: "You must be a member to vote in this community.",
          status: "error",
        });
        return;
      }
    }

    try {
      const existingVote = postStateValue.postVotes.find(
        (v) => v.postId === post.id,
      );

      const { voteChange, newVote, voteIdToDelete } = await handlePostVote(
        user.uid,
        post,
        vote,
        communityId,
        existingVote,
      );

      let updatedPostVotes = [...postStateValue.postVotes];
      const updatedPost = { ...post, voteStatus: post.voteStatus + voteChange };
      const updatedPosts = [...postStateValue.posts];

      if (voteIdToDelete) {
        updatedPostVotes = updatedPostVotes.filter(
          (v) => v.id !== voteIdToDelete,
        );
      } else if (newVote) {
        if (existingVote) {
          const voteIndexPosition = postStateValue.postVotes.findIndex(
            (v) => v.id === existingVote.id,
          );
          updatedPostVotes[voteIndexPosition] = newVote;
        } else {
          updatedPostVotes = [...updatedPostVotes, newVote];
        }
      }

      const postIndexPosition = postStateValue.posts.findIndex(
        (item) => item.id === post.id,
      );
      updatedPosts[postIndexPosition] = updatedPost;
      setPostStateValue((prev) => ({
        ...prev,
        posts: updatedPosts,
        postVotes: updatedPostVotes,
      }));

      if (postStateValue.selectedPost) {
        setPostStateValue((prev) => ({
          ...prev,
          selectedPost: updatedPost,
        }));
      }
    } catch (error) {
      console.log("Error: onVote", error);
      showToast({
        title: "Could not Vote",
        description: "There was an error voting on the post",
        status: "error",
      });
    }
  };

  const getPostVotes = async (postIds: string[]) => {
    if (!user || !postIds.length) return;
    try {
      const postVotes = await getPostVotesLib(user.uid, postIds);

      setPostStateValue((prev) => ({
        ...prev,
        postVotes: postVotes as PostVote[],
      }));
    } catch (error) {
      console.log("Error: getPostVotes", error);
      showToast({
        title: "Could not Get Post Votes",
        description: "There was an error while getting your post votes",
        status: "error",
      });
    }
  };

  const getPost = async (postId: string) => {
    try {
      const post = await getPostLib(postId);
      if (post) {
        setPostStateValue((prev) => ({
          ...prev,
          selectedPost: post,
        }));
        return post;
      }
      return null;
    } catch (error) {
      console.log("Error: getPost", error);
      return null;
    }
  };

  return { onVote, getPostVotes, getPost };
};

export default usePostVote;
