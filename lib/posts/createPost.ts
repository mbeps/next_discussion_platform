import type { User } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  type Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { firestore, storage } from "@/firebase/clientApp";
import type { Post } from "@/types/post";

/**
 * Creates a new post within a community and optionally uploads an associated image.
 * This function handles the creation of the post document in Firestore and the image upload to Firebase Storage.
 * @param user - The Firebase Auth user object of the post creator.
 * @param communityId - The unique identifier of the community where the post is being created.
 * @param communityImageURL - The current image URL of the community, used for display in feeds.
 * @param postData - An object containing the title and body text of the post.
 * @param selectedFile - An optional base64 encoded image string to be uploaded with the post.
 * @returns A promise that resolves to the unique identifier of the newly created post.
 */
export const createPost = async (
  user: User,
  communityId: string,
  communityImageURL: string | undefined,
  postData: { title: string; body: string },
  selectedFile?: string,
) => {
  const newPost: Post = {
    communityId,
    communityImageURL: communityImageURL || "",
    creatorId: user.uid,
    creatorUsername: user.displayName || user.email!.split("@")[0],
    title: postData.title,
    body: postData.body,
    numberOfComments: 0,
    voteStatus: 0,
    createTime: serverTimestamp() as Timestamp,
  };

  const postDocRef = await addDoc(collection(firestore, "posts"), newPost);

  if (selectedFile) {
    const imageRef = ref(storage, `posts/${postDocRef.id}/image`);
    await uploadString(imageRef, selectedFile, "data_url");
    const downloadURL = await getDownloadURL(imageRef);

    await updateDoc(doc(firestore, "posts", postDocRef.id), {
      imageURL: downloadURL,
    });
  }
  return postDocRef.id;
};
