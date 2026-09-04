import {
  collectionGroup,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { firestore, storage } from "@/firebase/clientApp";

/**
 * Deletes the community's profile image from Firebase Storage and updates all references.
 * This includes clearing the `imageURL` in the community document and all user membership snippets.
 * @param communityId - The unique identifier of the community whose image is being deleted.
 * @returns A promise that resolves when the image is deleted and all references are cleared.
 */
export const deleteCommunityImage = async (communityId: string) => {
  const imageRef = ref(storage, `communities/${communityId}/image`);
  await deleteObject(imageRef);

  const communityDocRef = doc(firestore, "communities", communityId);
  await updateDoc(communityDocRef, {
    imageURL: "",
  });

  const snippetsQuery = query(
    collectionGroup(firestore, "communitySnippets"),
    where("communityId", "==", communityId),
  );
  const snippetsSnapshot = await getDocs(snippetsQuery);

  const batch = writeBatch(firestore);
  snippetsSnapshot.docs.forEach((snippetDoc) => {
    batch.update(snippetDoc.ref, {
      imageURL: "",
    });
  });

  await batch.commit();
};
