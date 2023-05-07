/* eslint-disable react-hooks/exhaustive-deps */
import { authModalState } from "@/atoms/authModalAtom";
import { communityState } from "@/atoms/communitiesAtom";
import { Post, postState, PostVote } from "@/atoms/postsAtom";
import { auth, firestore, storage } from "@/firebase/clientApp";
import {
  collection,
  deleteDoc,
  doc,
  query,
  updateDoc,
  where,
  writeBatch,
} from "@firebase/firestore";
import { getDocs } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { Router, useRouter } from "next/router";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import useCustomToast from "./useCustomToast";

/**
 * Hook for managing posts from various components.
 * Functionality includes:
 *  - Voting on a post
 *  - Selecting a post
 *  - Deleting a post
 * @returns {PostState} postStateValue - object containing the current post state
 * @returns {(postState: PostState) => void} setPostStateValue - function that sets the post state
 * @returns {(post: Post) => void} onSelectPost - function that handles selecting a post
 * @return {(event: React.MouseEvent<SVGElement, MouseEvent>, post: Post, vote: number, communityId: string) => Promise<void>} onVote - function that handles voting on a post
 * @return {(post: Post) => Promise<boolean>} onDeletePost - function that handles deleting a post
 */
const usePosts = () => {
  const [user] = useAuthState(auth);
  const [postStateValue, setPostStateValue] = useRecoilState(postState);
  const currentCommunity = useRecoilValue(communityState).currentCommunity;
  const setAuthModalState = useSetRecoilState(authModalState);
  const router = useRouter();
  const showToast = useCustomToast();
  // TODO: create postVote variable

  /**
   * Allows the user to vote on a post from the main page or single view post page.
   * If the user is not authenticated, the login modal is opened.
   * If the user has already voted on the post, the vote is removed.
   * If the user has not voted on the post, the vote is added.
   *
   * @param event (React.MouseEvent<SVGElement, MouseEvent>) - event when clicking on the vote button
   * @param post (Post) - post to be voted on
   * @param vote (number) - vote value (1 or -1)
   * @param communityId (string) - community id
   */
  const onVote = async (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string
  ) => {
    /**
     * Voting on a post from the main page causes the post to be opened in single view.
     * This is because the voting buttons are children of the post item component which calls the redirection.
     * This prevents the parent from being called preventing the post from being opened.
     */
    event.stopPropagation();

    // check for authentication
    if (!user?.uid) {
      // user is not authenticated
      setAuthModalState({ open: true, view: "login" }); // open login modal
      return; // exit function
    }

    try {
      const { voteStatus } = post; // current vote status of post
      const existingVote = postStateValue.postVotes.find(
        (vote) => vote.postId === post.id
      ); // existing vote on post

      const batch = writeBatch(firestore);
      // copy of state which are updated at the end
      const updatedPost = { ...post }; // copy of post
      const updatedPosts = [...postStateValue.posts]; // copy of all posts
      let updatedPostVotes = [...postStateValue.postVotes]; // copy of all post votes
      let voteChange = vote; // change in vote status
      // new vote
      if (!existingVote) {
        // user has not voted on post
        const postVoteRef = doc(
          collection(firestore, "users", `${user?.uid}/postVotes`)
        ); // create new document in user collection
        const newVote: PostVote = {
          id: postVoteRef.id,
          postId: post.id!,
          communityId,
          voteValue: vote, // +1 or -1
        }; // new vote object

        batch.set(postVoteRef, newVote); // add new vote to user collection

        // update ui state
        updatedPost.voteStatus = voteStatus + vote; // update vote status
        updatedPostVotes = [...updatedPostVotes, newVote]; // add new vote to post votes
      } else {
        // existing vote
        const postVoteRef = doc(
          firestore,
          "users",
          `${user?.uid}/postVotes/${existingVote.id}`
        ); // get reference to existing vote document

        // removing/undoing current vote
        if (existingVote.voteValue === vote) {
          // user tries to vote already voted vote

          // update vote +-1
          updatedPost.voteStatus = voteStatus - vote; // update vote status
          updatedPostVotes = updatedPostVotes.filter(
            (vote) => vote.id !== existingVote.id
          ); // remove vote from post votes

          // delete document from user (user document stores which posts were voted)
          batch.delete(postVoteRef);

          voteChange *= -1; // update vote change
        } else {
          // user flipping vote (like to dislike or dislike to like)
          updatedPost.voteStatus = voteStatus + 2 * vote;
          const voteIndexPosition = postStateValue.postVotes.findIndex(
            (vote) => vote.id === existingVote.id
          ); // get index of existing vote

          updatedPostVotes[voteIndexPosition] = {
            ...existingVote,
            voteValue: vote,
          }; // update vote value

          // updating existing document
          batch.update(postVoteRef, {
            voteValue: vote,
          }); // update vote value
          voteChange = 2 * vote;
        }
      }
      // updated firestore
      const postRef = doc(firestore, "posts", post.id!); // get reference to post document
      batch.update(postRef, { voteStatus: voteStatus + voteChange }); // update vote status
      await batch.commit(); // commit batch

      // update ui state
      const postIndexPosition = postStateValue.posts.findIndex(
        (item) => item.id === post.id
      ); // get index of post
      updatedPosts[postIndexPosition] = updatedPost;
      setPostStateValue((prev) => ({
        ...prev,
        posts: updatedPosts,
        postVotes: updatedPostVotes,
      })); // update posts and post votes state on the ui

      // allow voting when a post is currently selected
      if (postStateValue.selectedPost) {
        setPostStateValue((prev) => ({
          ...prev,
          selectedPost: updatedPost,
        })); // update selected post
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

  /**
   * Redirects to post page and updates selected post state.
   * @param post (Post) - post that was selected
   */
  const onSelectPost = (post: Post) => {
    setPostStateValue((prev) => ({
      ...prev,
      selectedPost: post,
    })); // update selected post
    router.push(`/community/${post.communityId}/comments/${post.id}`); // redirect to post
  };

  /**
   * Deletes post. If post has an image, it is also deleted from storage.
   * @param post (Post) - post that was selected
   * @returns
   */
  const onDeletePost = async (post: Post): Promise<boolean> => {
    try {
      if (post.imageURL) {
        // delete the image if it exists
        const imageRef = ref(storage, `posts/${post.id}/image`);
        await deleteObject(imageRef);
      }

      // delete post from firestore
      const postDocRef = doc(firestore, "posts", post.id!);
      await deleteDoc(postDocRef);

      // update recoil state to remove the deleted post
      setPostStateValue((prev) => ({
        ...prev,
        posts: prev.posts.filter((item) => item.id !== post.id),
      }));

      return true; // post was deleted
    } catch (error) {
      return false; // post was not deleted
      showToast({
        title: "Could not Delete Post",
        description: "There was an error deleting your post",
        status: "error",
      });
    }
  };

  /**
   * Fetches community votes for the current user in the current community.
   * When reloading, the community status is no longer stored in state.
   * @param communityId (string) - id of the community
   */
  const getCommunityPostVotes = async (communityId: string) => {
    const postVotesQuery = query(
      collection(firestore, "users", `${user?.uid}/postVotes`),
      where("communityId", "==", communityId)
    );

    const postVoteDocs = await getDocs(postVotesQuery);
    const postVotes = postVoteDocs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPostStateValue((prev) => ({
      ...prev,
      postVotes: postVotes as PostVote[],
    }));
  };

  /**
   * Every time page reloads, the community votes are fetched.
   * @requires getCommunityPostVotes()
   */
  useEffect(() => {
    if (!user || !currentCommunity?.id) {
      return;
    }
    getCommunityPostVotes(currentCommunity?.id);
  }, [user, currentCommunity]);

  useEffect(() => {
    if (!user) {
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: [],
      }));
    }
  }, [user]);

  return {
    postStateValue,
    setPostStateValue,
    onSelectPost,
    onVote,
    onDeletePost,
  };
};
export default usePosts;
