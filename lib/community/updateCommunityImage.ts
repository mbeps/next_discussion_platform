import {
  collectionGroup,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { firestore, storage } from "@/firebase/clientApp";

/**
 * Uploads a new profile image for a community and updates all associated references.
 * This includes updating the community document and all user membership snippets.
 * @param communityId - The unique identifier of the community.
 * @param selectedFile - The base64 encoded image data to be uploaded.
 * @returns A promise that resolves to the public download URL of the uploaded image.
 */
export const updateCommunityImage = async (
  communityId: string,
  selectedFile: string,
) => {
  const imageRef = ref(storage, `communities/${communityId}/image`);
  await uploadString(imageRef, selectedFile, "data_url");
  const downloadURL = await getDownloadURL(imageRef);

  const communityDocRef = doc(firestore, "communities", communityId);
  await updateDoc(communityDocRef, {
    imageURL: downloadURL,
  });

  const snippetsQuery = query(
    collectionGroup(firestore, "communitySnippets"),
    where("communityId", "==", communityId),
  );
  const snippetsSnapshot = await getDocs(snippetsQuery);

  const batch = writeBatch(firestore);
  snippetsSnapshot.docs.forEach((snippetDoc) => {
    batch.update(snippetDoc.ref, {
      imageURL: downloadURL,
    });
  });

  await batch.commit();

  return downloadURL;
};
