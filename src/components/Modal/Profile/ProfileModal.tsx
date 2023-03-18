import React, { useRef, useState } from "react";
import { auth, firestore, storage } from "@/firebase/clientApp";
import { useAuthState, useUpdateProfile } from "react-firebase-hooks/auth";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Text,
  Flex,
  Image,
  Icon,
  Stack,
  Input,
} from "@chakra-ui/react";
import { MdAccountCircle } from "react-icons/md";
import { User } from "@firebase/auth";
import useCustomToast from "@/hooks/useCustomToast";
import useSelectFile from "@/hooks/useSelectFile";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";

type ProfileModalProps = {
  open: boolean;
  handleClose: () => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ open, handleClose }) => {
  const [user] = useAuthState(auth);
  const [updateProfile, updating, error] = useUpdateProfile(auth);
  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile(
    300,
    300
  );
  const selectFileRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteImage, setDeleteImage] = useState(false);
  const showToast = useCustomToast();
  const [userName, setUserName] = useState("");

  const closeModal = () => {
    setSelectedFile("");
    setDeleteImage(false);
    handleClose();
  };

  const onUpdateImage = async () => {
    if (!(user && selectedFile)) {
      return;
    }
    try {
      setUploadingImage(true);

      const imageRef = ref(storage, `users/${user?.uid}/profileImage`); // path to store image
      await uploadString(imageRef, selectedFile, "data_url"); // upload image
      const downloadURL = await getDownloadURL(imageRef); // get image url

      const success = await updateProfile({
        photoURL: downloadURL,
      });
      if (!success) {
        throw new Error("Failed to update profile image");
      }

      showToast({
        title: "Profile updated",
        description: "Your profile has been updated",
        status: "success",
      });
    } catch (error) {
      console.error("Error: onUpdateImage: ", error);
      showToast({
        title: "Image not Updated",
        description: "Failed to update profile image",
        status: "error",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const onDeleteImage = async () => {
    try {
      if (!user) {
        return;
      }
      const imageRef = ref(storage, `users/${user?.uid}/profileImage`);
      await deleteObject(imageRef);
      const success = await updateProfile({
        photoURL: "",
      });
      if (!success) {
        throw new Error("Failed to delete profile image");
      }

      showToast({
        title: "Profile updated",
        description: "Your profile has been updated",
        status: "success",
      });
    } catch (error) {
      console.error("Error: onDeleteImage: ", error);
      showToast({
        title: "Image not Deleted",
        description: "Failed to delete profile image",
        status: "error",
      });
    }
  };

  const onUpdateUserName = async () => {
    try {
      const success = await updateProfile({
        displayName: userName,
      });

      if (!success) {
        throw new Error("Failed to update profile name");
      }
    } catch (error) {
      console.error("Error: onUpdateUserName: ", error);
      showToast({
        title: "Name not Updated",
        description: "Failed to update profile name",
        status: "error",
      });
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  const handleSaveButtonClick = () => {
    if (selectedFile) {
      onUpdateImage();
    }
    if (deleteImage) {
      onDeleteImage();
    }
    if (userName) {
      onUpdateUserName();
    }
    closeModal();
  };

  return (
    <>
      <Modal isOpen={open} onClose={handleClose}>
        <ModalOverlay
          bg="rgba(0, 0, 0, 0.4)"
          backdropFilter="auto"
          backdropBlur="5px"
        />
        <ModalContent borderRadius={10}>
          <ModalHeader
            display="flex"
            flexDirection="column"
            padding={3}
            textAlign="center"
          >
            Profile
          </ModalHeader>
          <Box>
            <ModalCloseButton />
            <ModalBody display="flex" flexDirection="column" padding="10px 0px">
              <Stack p={5} spacing={5}>
                {/* image */}
                <Flex align="center" justify="center" p={2}>
                  {user?.photoURL || selectedFile ? (
                    <Image
                      src={selectedFile || (user?.photoURL as string)}
                      alt="Community Photo"
                      height="120px"
                      borderRadius="full"
                      shadow="md"
                    />
                  ) : (
                    <Icon
                      fontSize={120}
                      mr={1}
                      color="gray.300"
                      as={MdAccountCircle}
                    />
                  )}
                </Flex>

                <Stack spacing={1} direction="row" flexGrow={1}>
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
                      isDisabled={deleteImage}
                    >
                      Delete Image
                    </Button>
                  )}

                  {/*  */}
                </Stack>
                {/*  */}

                {/* name */}
                <Flex direction="column">
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    {`Email: ${user?.email}`}
                  </Text>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    {`Name: ${user?.displayName}`}
                  </Text>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    User Name
                  </Text>
                  <Input
                    name="displayName"
                    placeholder="User Name"
                    value={userName}
                    type="text"
                    onChange={handleNameChange}
                  />
                </Flex>
                {/*  */}
              </Stack>
            </ModalBody>
          </Box>
          <ModalFooter bg="gray.100" borderRadius="0px 0px 10px 10px">
            <Button variant="outline" height="30px" mr={3} onClick={closeModal}>
              Cancel
            </Button>
            <Button height="30px" onClick={handleSaveButtonClick}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default ProfileModal;
