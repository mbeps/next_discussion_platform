import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { firestore, storage } from "@/firebase/clientApp";
import type { Post } from "@/types/post";

/**
 * Deletes a post and all its associated data, including the image in Storage and all comments in Firestore.
 * This ensures that no orphaned data remains after a post is removed.
 * @param post - The post object to be deleted, containing its ID and optional image URL.
 * @returns A promise that resolves when the post and all its related data have been successfully deleted.
 */
export const deletePost = async (post: Post) => {
  if (post.imageURL) {
    const imageRef = ref(storage, `posts/${post.id}/image`);
    await deleteObject(imageRef);
  }

  const postDocRef = doc(firestore, "posts", post.id!);
  await deleteDoc(postDocRef);

  const commentsQuery = query(
    collection(firestore, "comments"),
    where("postId", "==", post.id),
  );
  const commentDocs = await getDocs(commentsQuery);
  const batch = writeBatch(firestore);
  commentDocs.docs.forEach((d) => {
    batch.delete(d.ref);
  });
  await batch.commit();
};
