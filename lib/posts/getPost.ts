import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";
import type { Post } from "@/types/post";

/**
 * Retrieves a single post by its unique identifier from Firestore.
 * Unlike the SSR version, this returns the raw Firestore data without JSON stringification.
 * @param postId - The unique identifier of the post to be retrieved.
 * @returns A promise that resolves to the post object if found, or null if it does not exist.
 */
export const getPost = async (postId: string) => {
  const postDocRef = doc(firestore, "posts", postId);
  const postDoc = await getDoc(postDocRef);
  if (postDoc.exists()) {
    return { id: postDoc.id, ...(postDoc.data() as Post) };
  }
  return null;
};
