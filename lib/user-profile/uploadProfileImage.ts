import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { storage } from "@/firebase/clientApp";

/**
 * Uploads a new profile image for a user to Firebase Storage.
 * This function handles the storage of the image file and returns the public download URL.
 * @param userId - The unique identifier of the user whose profile image is being uploaded.
 * @param selectedFile - The base64 encoded image data to be uploaded.
 * @returns A promise that resolves to the public download URL of the uploaded image.
 */
export const uploadProfileImage = async (
  userId: string,
  selectedFile: string,
) => {
  const imageRef = ref(storage, `users/${userId}/profileImage`);
  await uploadString(imageRef, selectedFile, "data_url");
  return await getDownloadURL(imageRef);
};
