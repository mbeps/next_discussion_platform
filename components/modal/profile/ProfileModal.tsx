import {
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  Stack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useForm } from "react-hook-form";
import { auth } from "@/firebase/clientApp";
import useSelectFile from "@/hooks/useSelectFile";
import useUserProfile from "@/hooks/useUserProfile";
import { type EditProfileInput, editProfileSchema } from "@/schema/profile";
import UserImageSection from "./UserImageSection";
import UserInfoSection from "./UserInfoSection";

type ProfileModalProps = {
  open: boolean;
  handleClose: () => void;
};

/**
 * Modal for editing user profile information including display name and profile image.
 * @param open - Whether the modal is visible.
 * @param handleClose - Callback to close the modal.
 * @returns Dialog with profile editing form.
 */
const ProfileModal: React.FC<ProfileModalProps> = ({ open, handleClose }) => {
  const [user] = useAuthState(auth);
  const { updateImage, removeImage, updateName, loading } = useUserProfile();
  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile(
    300,
    300,
  );
  const selectFileRef = useRef<HTMLInputElement>(null);
  const [deleteImage, setDeleteImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (user?.displayName) {
      setValue("displayName", user.displayName);
    }
  }, [user, setValue]);

  const closeModal = () => {
    setSelectedFile("");
    setDeleteImage(false);
    setIsEditing(false);
    handleClose();
  };

  const onUpdateProfile = async (data: EditProfileInput) => {
    if (selectedFile) {
      await updateImage(selectedFile);
    }
    if (deleteImage) {
      await removeImage();
    }
    if (data.displayName !== user?.displayName) {
      await updateName(data.displayName);
    }
    closeModal();
  };

  return (
    <DialogRoot
      open={open}
      onOpenChange={({ open }: { open: boolean }) => {
        if (!open) handleClose();
      }}
    >
      <DialogBackdrop bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(6px)" />
      <DialogPositioner>
        <DialogContent borderRadius={10}>
          <DialogHeader
            display="flex"
            flexDirection="column"
            padding={3}
            textAlign="center"
          >
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
          <DialogCloseTrigger position="absolute" top={2} right={2} />
          <DialogBody display="flex" flexDirection="column" padding="10px 0px">
            <Stack p={5} gap={5}>
              <UserImageSection
                user={user}
                selectedFile={selectedFile}
                isEditing={isEditing}
                selectFileRef={selectFileRef}
                onSelectFile={onSelectFile}
                setDeleteImage={setDeleteImage}
                deleteImage={deleteImage}
              />
              <UserInfoSection
                user={user}
                isEditing={isEditing}
                register={register}
                errors={errors}
              />
            </Stack>
          </DialogBody>
          <DialogFooter
            bg={{ base: "gray.100", _dark: "gray.700" }}
            borderRadius="0px 0px 10px 10px"
          >
            <Stack direction="row" width="100%" gap={2}>
              <Button
                variant="outline"
                height="30px"
                flex={1}
                onClick={closeModal}
              >
                Cancel
              </Button>
              {isEditing ? (
                <Button
                  height="30px"
                  flex={1}
                  onClick={handleSubmit(onUpdateProfile)}
                  loading={loading}
                >
                  Save
                </Button>
              ) : (
                <Button
                  height="30px"
                  flex={1}
                  onClick={() => {
                    setIsEditing(true);
                  }}
                >
                  Edit
                </Button>
              )}
            </Stack>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};
export default ProfileModal;
