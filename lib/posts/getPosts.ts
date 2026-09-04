import {
  collection,
  type DocumentData,
  getDocs,
  limit,
  orderBy,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";
import type { Post } from "@/types/post";

/**
 * Fetches a paginated list of posts based on various filtering criteria.
 * Supports fetching posts for a specific community, a personalized home feed for subscribed users,
 * or a generic home feed for guest users.
 * @param communityId - Optional identifier to fetch posts from a single community.
 * @param communityIds - Optional array of identifiers to fetch posts from multiple subscribed communities.
 * @param isGenericHome - Optional flag to fetch posts for the generic home feed (sorted by vote status).
 * @param lastVisible - Optional Firestore document snapshot for pagination.
 * @returns A promise that resolves to an object containing the array of posts and the next pagination cursor.
 */
export const getPosts = async (
  communityId?: string,
  communityIds?: string[],
  isGenericHome?: boolean,
  lastVisible?: QueryDocumentSnapshot<DocumentData> | null,
) => {
  const constraints: QueryConstraint[] = [];

  if (communityId) {
    constraints.push(where("communityId", "==", communityId));
    constraints.push(orderBy("createTime", "desc"));
  } else if (communityIds && communityIds.length > 0) {
    constraints.push(where("communityId", "in", communityIds));
    constraints.push(orderBy("createTime", "desc"));
  } else if (isGenericHome) {
    constraints.push(orderBy("voteStatus", "desc"));
  }

  if (lastVisible) {
    constraints.push(startAfter(lastVisible));
  }

  constraints.push(limit(10));

  const postQuery = query(collection(firestore, "posts"), ...constraints);
  const postDocs = await getDocs(postQuery);
  const posts = postDocs.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Post[];

  const newLastVisible =
    postDocs.docs.length > 0 ? postDocs.docs[postDocs.docs.length - 1] : null;

  return { posts, newLastVisible };
};
