import { Community, communityState } from "@/atoms/communitiesAtom";
import { auth, firestore, storage } from "@/firebase/clientApp";
import useCustomToast from "@/hooks/useCustomToast";
import useSelectFile from "@/hooks/useSelectFile";
import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";
import React, { useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { BsFillPeopleFill } from "react-icons/bs";
import { useRecoilState } from "recoil";

/**
 * @param {boolean} open - boolean to determine if the modal is open or not
 * @param {function} handleClose - function to close the modal
 * @param {Community} communityData - data required to be displayed
 */
type CommunitySettingsModalProps = {
  open: boolean;
  handleClose: () => void;
  communityData: Community;
};

/**
 * Allows the admin to change the settings of the community.
 * The following settings can be changed:
 *  - Community image
 *  - Visibility of the community
 * @param {open} - boolean to determine if the modal is open or not
 * @param {handleClose} - function to close the modal
 * @param {communityData} - data required to be displayed
 * @returns {React.FC<CommunitySettingsModalProps>} - CommunitySettingsModal component
 */
const CommunitySettingsModal: React.FC<CommunitySettingsModalProps> = ({
  open,
  handleClose,
  communityData,
}) => {
  const [user] = useAuthState(auth);

  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile(
    300,
    300
  );
  const selectFileRef = useRef<HTMLInputElement>(null);
  // const setCommunityStateValue = useSetRecoilState(communityState);
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteImage, setDeleteImage] = useState(false);
  const showToast = useCustomToast();

  /**
   * Allows admin to change the image of the community.
   */
  const onUpdateImage = async () => {
    if (!selectedFile) {
      // if no file is selected, do nothing
      return;
    }
    setUploadingImage(true); // set uploading image to true

    try {
      // update image in the community collection
      const imageRef = ref(storage, `communities/${communityData.id}/image`); // create reference to image in storage
      await uploadString(imageRef, selectedFile, "data_url"); // upload image to storage
      const downloadURL = await getDownloadURL(imageRef); // get download url of image
      await updateDoc(doc(firestore, "communities", communityData.id), {
        imageURL: downloadURL,
      }); // update imageURL in firestore

      // update imageURL in all users communitySnippets
      const usersSnapshot = await getDocs(collection(firestore, "users")); // get all users
      usersSnapshot.forEach(async (userDoc) => {
        // loop through all users
        const communitySnippetDoc = await getDoc(
          doc(
            firestore,
            "users",
            userDoc.id,
            "communitySnippets",
            communityData.id
          ) // get communitySnippet of the community
        );
        if (communitySnippetDoc.exists()) {
          // if the communitySnippet exists, update the imageURL
          await updateDoc(
            doc(
              firestore,
              "users",
              userDoc.id,
              "communitySnippets",
              communityData.id
            ),
            {
              imageURL: downloadURL,
            }
          );
        }
      });

      // update imageURL in current community recoil state
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          imageURL: downloadURL,
        } as Community,
      }));

      // update mySnippet imageURL in recoil state
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.map((snippet) => {
          if (snippet.communityId === communityData.id) {
            return {
              ...snippet,
              imageURL: downloadURL,
            };
          }
          return snippet;
        }),
      }));
    } catch (error) {
      console.log("Error: onUploadImage", error);
      showToast({
        title: "Image not Updated",
        description: "There was an error updating the image",
        status: "error",
      });
    } finally {
      setUploadingImage(false); // set uploading image to false
      setSelectedFile(""); // clear selected file
    }
  };

  /**
   * Deletes the image of the community.
   * @param {string} communityId - id of the community
   */
  const onDeleteImage = async (communityId: string) => {
    try {
      const imageRef = ref(storage, `communities/${communityId}/image`); // create reference to image in storage
      await deleteObject(imageRef);
      // await deleteDoc(doc(firestore, "communities", communityId)); // delete image from storage
      await updateDoc(doc(firestore, "communities", communityId), {
        imageURL: "",
      }); // update imageURL in firestore

      // delete imageURL in communitySnippets for all users
      const usersSnapshot = await getDocs(collection(firestore, "users")); // get all users
      usersSnapshot.forEach(async (userDoc) => {
        const communitySnippetDoc = await getDoc(
          doc(firestore, "users", userDoc.id, "communitySnippets", communityId)
        ); // get communitySnippet of the community
        if (communitySnippetDoc.exists()) {
          // if the communitySnippet exists, update the imageURL
          await updateDoc(
            doc(
              firestore,
              "users",
              userDoc.id,
              "communitySnippets",
              communityId
            ),
            {
              imageURL: "",
            }
          ); // update imageURL in firestore
        }
      });

      // update imageURL in current community recoil state
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          imageURL: "",
        } as Community,
      })); // update imageURL in recoil state

      // update mySnippet imageURL in recoil state
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.map((snippet) => {
          if (snippet.communityId === communityId) {
            return {
              ...snippet,
              imageURL: "",
            };
          }
          return snippet;
        }),
      }));
    } catch (error) {
      console.log("Error: onDeleteImage", error);
      showToast({
        title: "Image not Deleted",
        description: "There was an error deleting the image",
        status: "error",
      });
    }
  };

  const [selectedPrivacyType, setSelectedPrivacyType] = useState("");

  /**
   * Changes the privacy type of the current community.
   * @param {string} privacyType - privacy type to be changed to
   */
  const onUpdateCommunityPrivacyType = async (privacyType: string) => {
    try {
      await updateDoc(doc(firestore, "communities", communityData.id), {
        privacyType,
      });
      // update privacyType in current community recoil state
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          privacyType: privacyType,
        } as Community,
      }));
    } catch (error) {
      console.log("Error: onUpdateCommunityPrivacyType", error);
      showToast({
        title: "Privacy Type not Updated",
        description: "There was an error updating the community privacy type",
        status: "error",
      });
    }
  };

  /**
   * Handles changes to the privacy type select input.
   * @param {React.ChangeEvent<HTMLInputElement>} event - event when user selects a file
   */
  const handlePrivacyTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedPrivacyType(event.target.value); // set selected privacy type
  };

  /**
   * Handles applying changes to the community settings.
   * Changes can be:
   * - Changing the privacy type
   * - Changing the community image
   * - Deleting the community image
   */
  const handleSaveButtonClick = () => {
    // Save privacy type change
    if (selectedPrivacyType) {
      onUpdateCommunityPrivacyType(selectedPrivacyType);
    }
    if (selectedFile) {
      onUpdateImage();
    }
    if (deleteImage) {
      onDeleteImage(communityData.id);
    }
    showToast({
      title: "Settings Updated",
      description: "Your settings have been updated",
      status: "success",
    });
    closeModal();
  };

  /**
   * Closes the modal and resets the state.
   */
  const closeModal = () => {
    setSelectedFile("");
    setSelectedPrivacyType("");
    setDeleteImage(false);
    handleClose();
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
            Community Settings
          </ModalHeader>
          <Box>
            <ModalCloseButton />
            <ModalBody display="flex" flexDirection="column" padding="10px 0px">
              <>
                <Stack fontSize="10pt" spacing={2} p={5}>
                  {/* community image */}
                  <Flex align="center" justify="center" p={2}>
                    {communityStateValue.currentCommunity?.imageURL ||
                    selectedFile ? (
                      <Image
                        src={
                          selectedFile ||
                          communityStateValue.currentCommunity?.imageURL
                        }
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
                        as={BsFillPeopleFill}
                      />
                    )}
                  </Flex>
                  <Flex align="center" justify="center">
                    <Text fontSize="14pt" fontWeight={600} color="gray.600">
                      {communityData.id}
                    </Text>
                  </Flex>

                  <Stack spacing={1} direction="row" flexGrow={1}>
                    <Button
                      flex={1}
                      height={34}
                      onClick={() => selectFileRef.current?.click()}
                    >
                      {communityStateValue.currentCommunity?.imageURL
                        ? "Change Image"
                        : "Add Image"}
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/png,image/gif,image/jpeg"
                      hidden
                      ref={selectFileRef}
                      onChange={onSelectFile}
                    />
                    {communityStateValue.currentCommunity?.imageURL && (
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
                  <Divider />
                  {/* Change community privacy type */}
                  <Flex direction="column">
                    <Stack spacing={2} direction="column" flexGrow={1}>
                      <Text fontWeight={600} fontSize="12pt" color="gray.500">
                        Community Type
                      </Text>
                      <Text fontWeight={500} fontSize="10pt" color="gray.500">
                        {`Currently ${communityStateValue.currentCommunity?.privacyType}`}
                      </Text>

                      <Select
                        placeholder="Select option"
                        mt={2}
                        onChange={handlePrivacyTypeChange}
                      >
                        <option value="public">Public</option>
                        <option value="restricted">Restricted</option>
                        <option value="private">Private</option>
                      </Select>
                    </Stack>
                  </Flex>
                </Stack>
              </>
            </ModalBody>
          </Box>

          <ModalFooter bg="gray.100" borderRadius="0px 0px 10px 10px">
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Button
                width="100%"
                variant="outline"
                height="30px"
                mr={3}
                onClick={closeModal}
                flex={1}
              >
                Cancel
              </Button>
              <Button
                width="100%"
                height="30px"
                onClick={handleSaveButtonClick}
                flex={1}
              >
                Save
              </Button>
            </Stack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CommunitySettingsModal;
