import { Button, Icon, Image, Stack, Text } from "@chakra-ui/react";
import type { User } from "firebase/auth";
import type React from "react";
import type { RefObject } from "react";
import { MdAccountCircle } from "react-icons/md";

type UserImageSectionProps = {
  user: User | null | undefined;
  selectedFile: string | undefined;
  isEditing: boolean;
  selectFileRef: RefObject<HTMLInputElement>;
  onSelectFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setDeleteImage: (value: boolean) => void;
  deleteImage: boolean;
};

/**
 * Avatar block for the profile modal with upload and delete controls.
 * @param user - Current Firebase user for existing photo and name.
 * @param selectedFile - Pending upload preview.
 * @param isEditing - Toggles visibility of upload/delete buttons.
 * @param selectFileRef - Ref to the hidden file input.
 * @param onSelectFile - Handler when a file is chosen.
 * @param setDeleteImage - Setter to mark deletion intent.
 * @param deleteImage - Whether delete is in progress or requested.
 * @returns Image preview and editing controls.
 */
const UserImageSection: React.FC<UserImageSectionProps> = ({
  user,
  selectedFile,
  isEditing,
  selectFileRef,
  onSelectFile,
  setDeleteImage,
  deleteImage,
}) => {
  return (
    <>
      <Stack direction="column" align="center" justify="center" p={2}>
        {user?.photoURL || selectedFile ? (
          <Image
            src={selectedFile || (user?.photoURL as string)}
            alt="User Photo"
            height="120px"
            borderRadius="full"
            shadow="md"
          />
        ) : (
          <Icon fontSize={120} mr={1} color="gray.300" as={MdAccountCircle} />
        )}
        <Text fontSize="xl" color={{ base: "gray.700", _dark: "gray.200" }}>
          {user?.displayName}
        </Text>
      </Stack>

      {isEditing && (
        <Stack gap={1} direction="row" flexGrow={1}>
          <Button
            flex={1}
            height={34}
            onClick={() => selectFileRef.current?.click()}
          >
            {user?.photoURL ? "Change Image" : "Add Image"}
          </Button>
          <input
            id="file-upload"
            type="file"
            accept="image/png,image/gif,image/jpeg"
            hidden
            ref={selectFileRef}
            onChange={onSelectFile}
          />
          {user?.photoURL && (
            <Button
              flex={1}
              height={34}
              variant="outline"
              onClick={() => setDeleteImage(true)}
              disabled={deleteImage}
            >
              Delete Image
            </Button>
          )}
        </Stack>
      )}
    </>
  );
};

export default UserImageSection;
