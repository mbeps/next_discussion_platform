import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";
import type { PostVote } from "@/types/post";

/**
 * Retrieves all post votes cast by a specific user within a particular community.
 * This is used to hydrate the voting state for posts when a user views a community's feed.
 * @param userId - The unique identifier of the user whose votes are being retrieved.
 * @param communityId - The unique identifier of the community to filter votes by.
 * @returns A promise that resolves to an array of post vote objects.
 */
export const getCommunityPostVotes = async (
  userId: string,
  communityId: string,
) => {
  const postVotesQuery = query(
    collection(firestore, "users", `${userId}/postVotes`),
    where("communityId", "==", communityId),
  );

  const postVoteDocs = await getDocs(postVotesQuery);
  const postVotes = postVoteDocs.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PostVote[];
  return postVotes;
};
