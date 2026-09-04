import { doc, getDoc } from "firebase/firestore";
import safeJsonStringify from "safe-json-stringify";
import { firestore } from "@/firebase/clientApp";
import type { Post } from "@/types/post";

/**
 * Retrieves a single post by its unique identifier from Firestore.
 * The returned object is serialized using `safe-json-stringify` to ensure it is safe for Next.js server-side props.
 * @param postId - The unique identifier of the post to be retrieved.
 * @returns A promise that resolves to the post object if found, or null if it does not exist or an error occurs.
 */
export async function getPost(postId: string) {
  try {
    const postDocRef = doc(firestore, "posts", postId);
    const postDoc = await getDoc(postDocRef);

    if (!postDoc.exists()) {
      return null;
    }

    return JSON.parse(
      safeJsonStringify({ id: postDoc.id, ...postDoc.data() }),
    ) as Post;
  } catch (error) {
    console.log("Error: getPost", error);
    return null;
  }
}
