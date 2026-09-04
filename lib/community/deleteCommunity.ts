import {
  collection,
  collectionGroup,
  type DocumentReference,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { firestore, storage } from "@/firebase/clientApp";
import type { Community } from "@/types/community";

/**
 * Performs a cascading deletion of a community and all its associated data.
 * This includes deleting the community document, all posts, comments, post images,
 * the community image, and all user membership snippets.
 * Deletions are performed in chunked batches to respect Firestore limits.
 * @param communityData - The community object containing the ID and image URL to be deleted.
 * @returns A promise that resolves when all associated data has been successfully removed.
 */
export const deleteCommunity = async (communityData: Community) => {
  const postsQuery = query(
    collection(firestore, "posts"),
    where("communityId", "==", communityData.id),
  );
  const postsSnapshot = await getDocs(postsQuery);

  const deletePostImagePromises: Promise<void>[] = [];
  postsSnapshot.docs.forEach((doc) => {
    const post = doc.data();
    if (post.imageURL) {
      const imageRef = ref(storage, `posts/${post.id}/image`);
      deletePostImagePromises.push(deleteObject(imageRef));
    }
  });
  await Promise.all(deletePostImagePromises);

  if (communityData.imageURL) {
    const imageRef = ref(storage, `communities/${communityData.id}/image`);
    await deleteObject(imageRef).catch((e) =>
      console.log("Error deleting community image", e),
    );
  }

  const docsToDelete: DocumentReference[] = [];
  docsToDelete.push(doc(firestore, "communities", communityData.id));
  postsSnapshot.docs.forEach((d) => {
    docsToDelete.push(d.ref);
  });

  for (const postDoc of postsSnapshot.docs) {
    const commentsQuery = query(
      collection(firestore, "comments"),
      where("postId", "==", postDoc.id),
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    commentsSnapshot.docs.forEach((d) => {
      docsToDelete.push(d.ref);
    });
  }

  const snippetsQuery = query(
    collectionGroup(firestore, "communitySnippets"),
    where("communityId", "==", communityData.id),
  );
  const snippetsSnapshot = await getDocs(snippetsQuery);
  snippetsSnapshot.docs.forEach((d) => {
    docsToDelete.push(d.ref);
  });

  const chunkArray = (arr: any[], size: number) => {
    const chunked_arr = [];
    let index = 0;
    while (index < arr.length) {
      chunked_arr.push(arr.slice(index, size + index));
      index += size;
    }
    return chunked_arr;
  };

  const chunks = chunkArray(docsToDelete, 450);
  for (const chunk of chunks) {
    const batch = writeBatch(firestore);
    chunk.forEach((docRef: DocumentReference) => {
      batch.delete(docRef);
    });
    await batch.commit();
  }
};
