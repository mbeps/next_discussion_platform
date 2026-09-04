import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";
import type { PostVote } from "@/types/post";

/**
 * Retrieves the voting status for a specific set of posts for a given user.
 * This function handles large sets of post IDs by chunking them into batches to comply with Firestore's 'in' query limits.
 * @param userId - The unique identifier of the user whose votes are being retrieved.
 * @param postIds - An array of post identifiers to check for votes.
 * @returns A promise that resolves to an array of post vote objects for the specified posts.
 */
export const getPostVotes = async (userId: string, postIds: string[]) => {
  const chunks = [];
  const chunkSize = 10;
  for (let i = 0; i < postIds.length; i += chunkSize) {
    chunks.push(postIds.slice(i, i + chunkSize));
  }

  const promises = chunks.map((chunk) => {
    const postVotesQuery = query(
      collection(firestore, `users/${userId}/postVotes`),
      where("postId", "in", chunk),
    );
    return getDocs(postVotesQuery);
  });

  const querySnapshots = await Promise.all(promises);

  const postVotes = querySnapshots.flatMap((snapshot) =>
    snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })),
  );

  return postVotes as PostVote[];
};
