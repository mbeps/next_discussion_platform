import { collection, doc, writeBatch } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";
import type { Post, PostVote } from "@/types/post";

/**
 * Processes a vote (upvote or downvote) on a post and updates the aggregate vote count.
 * This function handles three scenarios:
 * 1. Creating a new vote if none exists.
 * 2. Removing an existing vote if the user clicks the same vote button again (toggle off).
 * 3. Updating an existing vote if the user switches from upvote to downvote or vice versa.
 * All operations are performed in a Firestore batch to ensure atomicity.
 * @param userId - The unique identifier of the user casting the vote.
 * @param post - The post object being voted on.
 * @param vote - The value of the vote (1 for upvote, -1 for downvote).
 * @param communityId - The identifier of the community where the post resides.
 * @param existingVote - The user's previous vote on this post, if any.
 * @returns A promise that resolves to an object containing the vote delta, the new vote record, and any deleted vote ID.
 */
export const handlePostVote = async (
  userId: string,
  post: Post,
  vote: number,
  communityId: string,
  existingVote?: PostVote,
) => {
  const batch = writeBatch(firestore);
  let voteChange = vote;
  let newVote: PostVote | undefined;
  let voteIdToDelete: string | undefined;

  if (!existingVote) {
    const postVoteRef = doc(
      collection(firestore, "users", `${userId}/postVotes`),
    );
    newVote = {
      id: postVoteRef.id,
      postId: post.id!,
      communityId,
      voteValue: vote,
    };

    batch.set(postVoteRef, newVote);
    voteChange = vote;
  } else {
    const postVoteRef = doc(
      firestore,
      "users",
      `${userId}/postVotes/${existingVote.id}`,
    );

    if (existingVote.voteValue === vote) {
      batch.delete(postVoteRef);
      voteChange = -vote;
      voteIdToDelete = existingVote.id;
    } else {
      batch.update(postVoteRef, {
        voteValue: vote,
      });
      voteChange = 2 * vote;
      newVote = {
        ...existingVote,
        voteValue: vote,
      };
    }
  }

  const postRef = doc(firestore, "posts", post.id!);
  batch.update(postRef, { voteStatus: post.voteStatus + voteChange });
  await batch.commit();

  return { voteChange, newVote, voteIdToDelete };
};
