import { doc, setDoc } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";
import type { Post } from "@/types/post";
import type { SavedPost } from "@/types/savedPost";

/**
 * Saves a post to a user's personal collection for later viewing.
 * This creates a document in the user's 'savedPosts' subcollection with essential post metadata.
 * @param userId - The unique identifier of the user saving the post.
 * @param post - The post object to be saved.
 * @returns A promise that resolves to the newly created saved post object.
 */
export const savePost = async (userId: string, post: Post) => {
  const savedPostRef = doc(firestore, `users/${userId}/savedPosts`, post.id!);
  const newSavedPost: SavedPost = {
    id: post.id!,
    postId: post.id!,
    communityId: post.communityId,
    postTitle: post.title,
    communityImageURL: post.communityImageURL || "",
  };
  await setDoc(savedPostRef, newSavedPost);
  return newSavedPost;
};
