import React, { useState } from "react";

const useSelectFile = () => {
  const [selectedFile, setSelectedFile] = useState<string>();

  const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader: FileReader = new FileReader();
    // files in an array that can store multiple files if needed
    if (event.target.files?.[0]) {
      fileReader.readAsDataURL(event.target.files[0]); // passed to firebase storage
    }

    fileReader.onload = (readerEvent) => {
      if (readerEvent.target?.result) {
        setSelectedFile(readerEvent.target.result as string);
      }
    };
  };
  return {
    selectedFile,
    setSelectedFile,
    onSelectFile,
  };
};
export default useSelectFile;
