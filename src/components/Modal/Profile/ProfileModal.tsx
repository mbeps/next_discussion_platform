import { auth, firestore, storage } from "@/firebase/clientApp";
import useCustomToast from "@/hooks/useCustomToast";
import useSelectFile from "@/hooks/useSelectFile";
import {
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  query,
  collection,
  where,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";
import React, { useRef, useState } from "react";
import { useAuthState, useUpdateProfile } from "react-firebase-hooks/auth";
import { MdAccountCircle } from "react-icons/md";

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
  const [userName, setUserName] = useState(user?.displayName || "");
  const [isEditing, setIsEditing] = useState(false);

  const closeModal = () => {
    setSelectedFile("");
    setDeleteImage(false);
    setIsEditing(false);
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

  // Function to update creatorDisplayText in comments
  const updateUserNameInComments = async (
    userId: string,
    newUserName: string
  ) => {
    const commentsQuery = query(
      collection(firestore, "comments"),
      where("creatorId", "==", userId)
    );
    const commentsSnapshot = await getDocs(commentsQuery);

    const batch = writeBatch(firestore);

    commentsSnapshot.forEach((commentDoc) => {
      const commentRef = doc(firestore, "comments", commentDoc.id);
      batch.update(commentRef, { creatorDisplayText: newUserName });
    });

    await batch.commit();
  };

  // Function to update creatorUsername in posts
  const updateUserNameInPosts = async (userId: string, newUserName: string) => {
    const postsQuery = query(
      collection(firestore, "posts"),
      where("creatorId", "==", userId)
    );
    const postsSnapshot = await getDocs(postsQuery);

    const batch = writeBatch(firestore);

    postsSnapshot.forEach((postDoc) => {
      const postRef = doc(firestore, "posts", postDoc.id);
      batch.update(postRef, { creatorUsername: newUserName });
    });

    await batch.commit();
  };

  const onUpdateUserName = async () => {
    try {
      const success = await updateProfile({
        displayName: userName,
      });

      if (!success) {
        throw new Error("Failed to update profile name");
      }
      // Update the creatorDisplayText in comments and creatorUsername in posts
      await updateUserNameInComments(user!.uid, userName);
      await updateUserNameInPosts(user!.uid, userName);
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
    if (userName && userName !== user?.displayName) {
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
                      alt="User Photo"
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

                {isEditing && (
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
                  </Stack>
                )}
                {/*  */}

                {/* name */}
                {!isEditing && (
                  <Flex direction="column">
                    <Flex direction="row">
                      <Text
                        fontSize="12pt"
                        color="gray.600"
                        mr={1}
                        fontWeight={600}
                      >
                        Email:
                      </Text>
                      <Text fontSize="12pt">{user?.email}</Text>
                    </Flex>
                    <Flex direction="row">
                      <Text
                        fontSize="12pt"
                        color="gray.600"
                        mr={1}
                        fontWeight={600}
                      >
                        User Name:
                      </Text>
                      <Text fontSize="12pt">{user?.displayName || ""}</Text>
                    </Flex>
                  </Flex>
                )}
                {isEditing && (
                  <Flex direction="column">
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      User Name
                    </Text>
                    <Input
                      name="displayName"
                      placeholder="User Name"
                      value={userName}
                      type="text"
                      onChange={handleNameChange}
                      _hover={{
                        bg: "white",
                        border: "1px solid",
                        borderColor: "red.500",
                      }}
                      _focus={{
                        bg: "white",
                        border: "1px solid",
                        borderColor: "red.500",
                      }}
                      borderRadius={10}
                    />
                  </Flex>
                )}
                {/*  */}
              </Stack>
            </ModalBody>
          </Box>
          <ModalFooter bg="gray.100" borderRadius="0px 0px 10px 10px">
            <Button variant="outline" height="30px" mr={3} onClick={closeModal}>
              Cancel
            </Button>
            {isEditing ? (
              <Button height="30px" onClick={handleSaveButtonClick}>
                Save
              </Button>
            ) : (
              <Button
                height="30px"
                onClick={() => {
                  setIsEditing(true);
                }}
              >
                Edit
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default ProfileModal;
