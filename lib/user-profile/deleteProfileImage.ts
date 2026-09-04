import { deleteObject, ref } from "firebase/storage";
import { storage } from "@/firebase/clientApp";

/**
 * Deletes a user's profile image from Firebase Storage.
 * This is typically called when a user resets their profile picture to the default.
 * @param userId - The unique identifier of the user whose profile image is being deleted.
 * @returns A promise that resolves when the image has been successfully removed from storage.
 */
export const deleteProfileImage = async (userId: string) => {
  const imageRef = ref(storage, `users/${userId}/profileImage`);
  await deleteObject(imageRef);
};
