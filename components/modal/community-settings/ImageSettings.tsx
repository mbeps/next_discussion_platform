import { Box, Button, Flex, Image, Input, Stack, Text } from "@chakra-ui/react";
import type React from "react";
import type { Community } from "@/types/community";

type ImageSettingsProps = {
  selectedFile: string;
  onSelectFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectFileRef: React.RefObject<HTMLInputElement | null>;
  currentCommunity: Community | null;
  deleteImage: boolean;
  setDeleteImage: (value: boolean) => void;
};

/**
 * Component for managing community image settings
 */
const ImageSettings: React.FC<ImageSettingsProps> = ({
  selectedFile,
  onSelectFile,
  selectFileRef,
  currentCommunity,
  deleteImage,
  setDeleteImage,
}) => {
  const imageToDisplay = selectedFile || currentCommunity?.imageURL;

  return (
    <Stack>
      <Text fontWeight={600} fontSize="12pt">
        Community Image
      </Text>
      <Flex direction="column" align="center" width="100%">
        {imageToDisplay ? (
          <Image
            borderRadius="full"
            boxSize="100px"
            src={imageToDisplay}
            alt="Community Image"
          />
        ) : (
          <Box
            borderRadius="full"
            boxSize="100px"
            border="4px dashed"
            borderColor="gray.200"
          />
        )}
        <Stack direction="row" mt={4}>
          <Button height="28px" onClick={() => selectFileRef.current?.click()}>
            Change Image
          </Button>
          {(currentCommunity?.imageURL || selectedFile) && (
            <Button
              height="28px"
              onClick={() => setDeleteImage(!deleteImage)}
              variant={deleteImage ? "solid" : "outline"}
            >
              {deleteImage ? "Undo Delete" : "Delete Image"}
            </Button>
          )}
        </Stack>
        <Input ref={selectFileRef} type="file" hidden onChange={onSelectFile} />
      </Flex>
    </Stack>
  );
};

export default ImageSettings;
