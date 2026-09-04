import { useSetAtom } from "jotai";
import { useState } from "react";
import { communityStateAtom } from "@/atoms/communitiesAtom";
import { deleteCommunityImage } from "@/lib/community/deleteCommunityImage";
import { updateCommunityImage } from "@/lib/community/updateCommunityImage";
import type { Community } from "@/types/community";
import useCustomToast from "../useCustomToast";

/**
 * A custom hook that provides functionality for managing a community's profile image.
 * It handles uploading new images, deleting existing ones, and synchronizing these changes
 * across the community document and all user membership snippets.
 * @param communityData - The community object whose image is being managed.
 * @returns An object containing functions for updating and deleting the image, and an uploading state indicator.
 */
const useCommunityImage = (communityData: Community) => {
  const setCommunityStateValue = useSetAtom(communityStateAtom);
  const showToast = useCustomToast();
  const [uploadingImage, setUploadingImage] = useState(false);

  const onUpdateImage = async (selectedFile: string) => {
    if (!selectedFile) return;
    setUploadingImage(true);

    try {
      const downloadURL = await updateCommunityImage(
        communityData.id,
        selectedFile,
      );

      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          imageURL: downloadURL,
        } as Community,
      }));

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.map((snippet) => {
          if (snippet.communityId === communityData.id) {
            return {
              ...snippet,
              imageURL: downloadURL,
            };
          }
          return snippet;
        }),
      }));
    } catch (error) {
      console.log("Error: onUploadImage", error);
      showToast({
        title: "Image not Updated",
        description: "There was an error updating the image",
        status: "error",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const onDeleteCommunityImage = async () => {
    try {
      await deleteCommunityImage(communityData.id);

      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          imageURL: "",
        } as Community,
      }));

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.map((snippet) => {
          if (snippet.communityId === communityData.id) {
            return {
              ...snippet,
              imageURL: "",
            };
          }
          return snippet;
        }),
      }));
    } catch (error) {
      console.log("Error: onDeleteCommunityImage", error);
      showToast({
        title: "Image not Deleted",
        description: "There was an error deleting the image",
        status: "error",
      });
    }
  };

  return {
    updateImage: onUpdateImage,
    deleteCommunityImage: onDeleteCommunityImage,
    uploadingImage,
  };
};

export default useCommunityImage;
