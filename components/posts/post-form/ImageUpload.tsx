import { Button, Flex, Image, Stack } from "@chakra-ui/react";
import type React from "react";
import { useRef } from "react";

/**
 * Interface for the ImageUpload component properties.
 * @param selectedFile - Data URL of the currently selected image.
 * @param onSelectImage - Callback triggered when a file is chosen.
 * @param setSelectedTab - Callback to switch between form tabs.
 * @param setSelectedFile - Callback to clear or update the selected file.
 */
type ImageUploadProps = {
  selectedFile?: string;
  onSelectImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedTab: (value: string) => void;
  setSelectedFile: (value: string) => void;
};

/**
 * Handles image selection and preview for new posts.
 * Provides a drag-and-drop style interface for uploading and options to remove or confirm the selection.
 * @param props - Component properties.
 * @returns A preview of the selected image or an upload trigger.
 */
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
            maxWidth="90%"
            maxHeight="400px"
            borderRadius={10}
            shadow="md"
          />
          <Stack direction="row" mt={4} justify="center" gap={4} width="100%">
            <Button
              onClick={() => setSelectedTab("Post")}
              shadow="md"
              flex={1}
              maxW="200px"
            >
              Back to Post
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedFile("")} // clearing image state removed uploaded image
              flex={1}
              maxW="200px"
              shadow="md"
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
          {/* Upload button */}
          <Button
            shadow="md"
            onClick={() => {
              selectedFileRef.current?.click();
            }}
          >
            Upload Content
          </Button>
          {/* Hidden input */}
          <input
            type="file"
            accept="image/png,image/gif,image/jpeg"
            ref={selectedFileRef}
            hidden
            onChange={onSelectImage}
          />
        </Flex>
      )}
    </Flex>
  );
};
export default ImageUpload;
