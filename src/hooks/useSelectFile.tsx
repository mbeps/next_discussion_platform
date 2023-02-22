import React, { useState } from "react";

/**
 * Hook provides functionality to select a file.
 * The file size limit is 10MB and only allows image file types.
 * The file being uploaded must be an image.
 * The file must be within the specified dimensions.
 * @param maxHeight (number) - maximum height of the image
 * @param maxWidth (number) - maximum width of the image
 * @returns selectedFile - the selected file
 * @returns setSelectedFile - function to set the selected file
 * @returns onSelectFile - function to select a file
 */
const useSelectFile = (maxHeight: number, maxWidth: number) => {
  const [selectedFile, setSelectedFile] = useState<string>();

  /**
   * Allows user to select a file.
   * The file size limit is 10MB and only allows image file types.
   * The file being uploaded must be an image.
   * @param event (React.ChangeEvent<HTMLInputElement>) - event object
   */
  const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // get the first file
    const maxImageSize = 10; // 10MB
    const allowedFileTypes = ["image/jpeg", "image/png", "image/gif"]; // only allow image file types

    // check if file exists
    if (file) {
      // check if file size is too large
      if (file.size > maxImageSize * 1024 * 1024) {
        alert(
          `File size is too large. Maximum file size is ${maxImageSize}MB.`
        ); // alert user
        return; // exit function
      }
      // check if file type is allowed
      if (!allowedFileTypes.includes(file.type)) {
        alert(`Only image file types are allowed (.png / .jpeg / .gif).`); // alert user
        return; // exit function
      }

      // check image dimensions
      const image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = () => {
        if (image.width > maxWidth || image.height > maxHeight) {
          alert(
            `Image dimensions are too large. Maximum dimensions are ${maxWidth}x${maxHeight}.`
          ); // alert user
          return; // exit function
        }

        // resize image
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        ctx?.drawImage(image, 0, 0, image.width, image.height);
        const resizedImage = canvas.toDataURL("image/jpeg", 1.0);

        setSelectedFile(resizedImage); // set the selected file
      };
    }
  };
  return {
    selectedFile,
    setSelectedFile,
    onSelectFile,
  };
};
export default useSelectFile;
