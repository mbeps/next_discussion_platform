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
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useRecoilValue } from "recoil";

const usePosts = () => {
  const [user] = useAuthState(auth);
  const [postStateValue, setPostStateValue] = useRecoilState(postState);
  const currentCommunity = useRecoilValue(communityState).currentCommunity;
  // TODO: create postVote variable

  const onVote = async (post: Post, vote: number, communityId: string) => {
    // check for authentication
    try {
      const { voteStatus } = post;
      const existingVote = postStateValue.postVotes.find(
        (vote) => vote.postId === post.id
      );

      const batch = writeBatch(firestore);
      // copy of state which are updated at the end
      const updatedPost = { ...post };
      const updatedPosts = [...postStateValue.posts];
      let updatedPostVotes = [...postStateValue.postVotes];
      let voteChange = vote;
      // new vote
      if (!existingVote) {
        const postVoteRef = doc(
          collection(firestore, "users", `${user?.uid}/postVotes`)
        );
        const newVote: PostVote = {
          id: postVoteRef.id,
          postId: post.id!,
          communityId,
          voteValue: vote, // +1 or -1
        };

        batch.set(postVoteRef, newVote);

        // update ui state
        updatedPost.voteStatus = voteStatus + vote;
        updatedPostVotes = [...updatedPostVotes, newVote];
      } else {
        // existing vote
        const postVoteRef = doc(
          firestore,
          "users",
          `${user?.uid}/postVotes/${existingVote.id}`
        );

        // removing/undoing current vote
        if (existingVote.voteValue === vote) {
          // user tries to vote already voted vote

          // update vote +-1
          updatedPost.voteStatus = voteStatus - vote;
          updatedPostVotes = updatedPostVotes.filter(
            (vote) => vote.id !== existingVote.id
          );

          // delete document from user (user document stores which posts were voted)
          batch.delete(postVoteRef);

          voteChange *= -1;
        } else {
          // user flipping vote (like to dislike or dislike to like)
          updatedPost.voteStatus = voteStatus + 2 * vote;
          const voteIndexPosition = postStateValue.postVotes.findIndex(
            (vote) => vote.id === existingVote.id
          );

          updatedPostVotes[voteIndexPosition] = {
            ...existingVote,
            voteValue: vote,
          };

          // updating existing document
          batch.update(postVoteRef, {
            voteValue: vote,
          });
          voteChange = 2 * vote;
        }
      }
      // updated firestore
      const postRef = doc(firestore, "posts", post.id!);
      batch.update(postRef, { voteStatus: voteStatus + voteChange });
      await batch.commit();

      // update ui state
      const postIndexPosition = postStateValue.posts.findIndex(
        (item) => item.id === post.id
      );
      updatedPosts[postIndexPosition] = updatedPost;
      setPostStateValue((prev) => ({
        ...prev,
        posts: updatedPosts,
        postVotes: updatedPostVotes,
      }));
    } catch (error) {
      console.log("Error: onVote", error);
    }
  };
  const onSelectPost = () => {};
  const onDeletePost = async (post: Post): Promise<boolean> => {
    try {
      // check if post has image and delete it
      if (post.imageURL) {
        const imageRef = ref(storage, `posts/${post.id}/image`); // get reference to image
        await deleteObject(imageRef); // delete the image

        // delete post
        const postDocRef = doc(firestore, "posts", post.id!);
        await deleteDoc(postDocRef);

        // update recoil state to update the UI
        setPostStateValue((prev) => ({
          ...prev,
          posts: prev.posts.filter((item) => item.id !== post.id),
        }));
      }
      return true;
    } catch (error) {
      return false;
    }
  };
  /**
   * Fetches community status.
   * When reloading, the community status is no longer stored in state.
   * @param communityId `
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

  return {
    postStateValue,
    setPostStateValue,
    onSelectPost,
    onVote,
    onDeletePost,
  };
};
export default usePosts;
