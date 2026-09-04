import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";
import type { Community } from "@/types/community";
import type { Post } from "@/types/post";

/**
 * Preloads a dataset of public communities and recent posts to facilitate client-side search.
 * This function retrieves all public communities and the 100 most recent posts to provide
 * a responsive search experience without frequent network requests.
 * @returns A promise that resolves to an object containing arrays of communities and posts.
 */
export const getSearchData = async () => {
  const communitiesQuery = query(
    collection(firestore, "communities"),
    where("privacyType", "==", "public"),
  );
  const communitiesSnap = await getDocs(communitiesQuery);
  const communities = communitiesSnap.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Community,
  );

  const postsQuery = query(
    collection(firestore, "posts"),
    orderBy("createTime", "desc"),
    limit(100),
  );
  const postsSnap = await getDocs(postsQuery);
  const posts = postsSnap.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Post,
  );

  return { communities, posts };
};
