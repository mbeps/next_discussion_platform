import { Button, Flex, Image, Stack } from "@chakra-ui/react";
import React, { useRef } from "react";

type ImageUploadProps = {
  selectedFile?: string; // user does not need to upload a file
  onSelectImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedTab: (value: string) => void; // after image is uploaded, return to post section
  setSelectedFile: (value: string) => void; // clear image and select a new one
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  selectedFile,
  onSelectImage,
  setSelectedTab,
  setSelectedFile,
}) => {
  // Button -> selectedFileRef -> input
  const selectedFileRef = useRef<HTMLInputElement>(null);

  return (
    <Flex justify="center" direction="column" align="center" width="100%">
      {selectedFile ? (
        // If the image is uploaded
        <>
          <Image
            src={selectedFile}
            alt="Uploaded image for post"
            maxWidth="400px"
            maxHeight="400px"
          />
          <Stack direction="row" mt={4}>
            <Button onClick={() => setSelectedTab("Post")} w="100%">
              Back to Post
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedFile("")} // clearing image state removed uploaded image
              w="100%"
            >
              Remove Content
            </Button>
          </Stack>
        </>
      ) : (
        // if the image is not uploaded
        <Flex
          justify="center"
          align="center"
          p={20}
          border="1px dashed"
          borderColor="red.200"
          width="100%"
          borderRadius={10}
        >
          <Button
            onClick={() => {
              selectedFileRef.current?.click();
            }}
          >
            Upload Content
          </Button>
          <input
            type="file"
            ref={selectedFileRef}
            hidden
            onChange={onSelectImage}
          />
          {/* <img src={selectedFile} /> */}
        </Flex>
      )}
    </Flex>
  );
};
export default ImageUpload;
