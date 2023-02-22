import React, { useState } from "react";

/**
 * Hook provides functionality to select a file.
 * @returns selectedFile - the selected file
 * @returns setSelectedFile - function to set the selected file
 * @returns onSelectFile - function to select a file
 */
const useSelectFile = () => {
  const [selectedFile, setSelectedFile] = useState<string>();

  /**
   * Allows user to select a file.
   * The file size limit is 10MB.
   * @param event (React.ChangeEvent<HTMLInputElement>) - event object
   */
  const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // get the first file
    const maxImageSize = 10; // 10MB
    if (file) {
      // check if file exists
      if (file.size > maxImageSize * 1024 * 1024) {
        // check if file size is too large
        alert(
          `File size is too large. Maximum file size is ${maxImageSize}MB.`
        ); // alert user
        return; // exit function
      }
      const fileReader: FileReader = new FileReader();
      fileReader.readAsDataURL(file); // passed to firebase storage

      fileReader.onload = (readerEvent) => {
        if (readerEvent.target?.result) {
          // check if fileReader has a result
          setSelectedFile(readerEvent.target.result as string); // set the selected file
        }
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
