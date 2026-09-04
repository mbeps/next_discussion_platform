import {
  collection,
  type DocumentData,
  getDocs,
  limit,
  orderBy,
  type QueryDocumentSnapshot,
  query,
  startAfter,
} from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";
import type { Community } from "@/types/community";

/**
 * Fetches a paginated list of communities, ordered by the number of members in descending order.
 * This is used for the community discovery feed and recommendations.
 * @param limitValue - The maximum number of communities to retrieve in a single request.
 * @param lastVisible - The Firestore document snapshot to start the query after (for pagination).
 * @returns A promise that resolves to an object containing the array of communities and the next pagination cursor.
 */
export const getCommunities = async (
  limitValue: number,
  lastVisible?: QueryDocumentSnapshot<DocumentData> | null,
) => {
  let communityQuery;
  if (!lastVisible) {
    communityQuery = query(
      collection(firestore, "communities"),
      orderBy("numberOfMembers", "desc"),
      limit(limitValue),
    );
  } else {
    communityQuery = query(
      collection(firestore, "communities"),
      orderBy("numberOfMembers", "desc"),
      startAfter(lastVisible),
      limit(limitValue),
    );
  }

  const communityDocs = await getDocs(communityQuery);
  const communities = communityDocs.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Community[];

  const newLastVisible =
    communityDocs.docs.length > 0
      ? communityDocs.docs[communityDocs.docs.length - 1]
      : null;

  return { communities, newLastVisible };
};
