import { Community, communityState } from "@/atoms/communitiesAtom";
import { auth, firestore, storage } from "@/firebase/clientApp";
import useSelectFile from "@/hooks/useSelectFile";
import {
  Box,
  Button,
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
import { doc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";
import React, { useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { BsFillPeopleFill } from "react-icons/bs";
import { useSetRecoilState } from "recoil";

type CommunitySettingsModalProps = {
  open: boolean;
  handleClose: () => void;
  communityData: Community;
};

const CommunitySettingsModal: React.FC<CommunitySettingsModalProps> = ({
  open,
  handleClose,
  communityData,
}) => {
  const [user] = useAuthState(auth);

  return (
    <>
      <Modal isOpen={open} onClose={handleClose}>
        <ModalOverlay />
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
                <Stack fontSize="10pt" spacing={1} p={5}>
                  <CommunityModalPicture communityData={communityData} />
                  <Flex direction="column" pt={4}>
                    <CommunityTypeSettings communityData={communityData} />
                  </Flex>
                </Stack>
              </>
            </ModalBody>
          </Box>

          <ModalFooter bg="gray.100" borderRadius="0px 0px 10px 10px">
            <Button
              variant="outline"
              height="30px"
              mr={3}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button height="30px">Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default CommunitySettingsModal;

type CommunityModalPictureProps = {
  communityData: Community;
};

const CommunityModalPicture: React.FC<CommunityModalPictureProps> = ({
  communityData,
}) => {
  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile(
    300,
    300
  );
  const selectFileRef = useRef<HTMLInputElement>(null);
  const setCommunityStateValue = useSetRecoilState(communityState);
  const [uploadingImage, setUploadingImage] = useState(false);

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
      // update image in firebase
      const imageRef = ref(storage, `communities/${communityData.id}/image`); // create reference to image in storage
      await uploadString(imageRef, selectedFile, "data_url"); // upload image to storage
      const downloadURL = await getDownloadURL(imageRef); // get download url of image
      await updateDoc(doc(firestore, "communities", communityData.id), {
        imageURL: downloadURL,
      }); // update imageURL in firestore

      // update imageURL in recoil state
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          imageURL: downloadURL,
        } as Community,
      }));
    } catch (error) {
      console.log("Error: onUploadImage", error);
    } finally {
      setUploadingImage(false); // set uploading image to false
    }
  };

  /**
   * Deletes the image of the community.
   * @param communityId (string) - id of the community
   */
  const onDeleteImage = async (communityId: string) => {
    try {
      const imageRef = ref(storage, `communities/${communityId}/image`); // create reference to image in storage
      await deleteObject(imageRef);
      // await deleteDoc(doc(firestore, "communities", communityId)); // delete image from storage
      await updateDoc(doc(firestore, "communities", communityId), {
        imageURL: "",
      }); // update imageURL in firestore

      // updates the state to change the ui
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          imageURL: "",
        } as Community,
      })); // update imageURL in recoil state
    } catch (error) {
      console.log("Error: onDeleteImage", error);
    }
  };

  return (
    <Box>
      <Flex align="center" justify="center" p={2}>
        {communityData?.imageURL || selectedFile ? (
          <Image
            src={selectedFile || communityData?.imageURL}
            alt="Community Photo"
            height="120px"
            borderRadius="full"
            shadow="md"
          />
        ) : (
          <Icon fontSize={120} mr={1} color="gray.300" as={BsFillPeopleFill} />
        )}
      </Flex>

      <Stack spacing={1} direction="row" flexGrow={1}>
        <Button
          flex={1}
          height={34}
          onClick={() => selectFileRef.current?.click()}
        >
          Change Image
        </Button>

        {/* save changes button */}
        {selectedFile && (
          <Button
            flex={1}
            height={34}
            variant="outline"
            onClick={onUpdateImage}
            isLoading={uploadingImage}
          >
            Save Changes
          </Button>
        )}
        <input
          id="file-upload"
          type="file"
          accept="image/png,image/gif,image/jpeg"
          hidden
          ref={selectFileRef}
          onChange={onSelectFile}
        />
        {communityData?.imageURL && (
          <Button
            flex={1}
            height={34}
            variant="outline"
            onClick={() => onDeleteImage(communityData.id)}
          >
            Delete Image
          </Button>
        )}
      </Stack>
    </Box>
  );
};

type CommunityTypeSettingsProps = {
  communityData: Community;
};

const CommunityTypeSettings: React.FC<CommunityTypeSettingsProps> = ({
  communityData,
}) => {
  const [selectedPrivacyType, setSelectedPrivacyType] = useState("");

  const onUpdateCommunityPrivacyType = async (privacyType: string) => {
    try {
      await updateDoc(doc(firestore, "communities", communityData.id), {
        privacyType,
      });
    } catch (error) {
      console.log("Error: onUpdateCommunityPrivacyType", error);
    }
  };

  const handlePrivacyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPrivacyType(e.target.value);
  };

  const handleSaveButtonClick = () => {
    if (selectedPrivacyType) {
      onUpdateCommunityPrivacyType(selectedPrivacyType);
    }
  };

  return (
    <>
      <Stack spacing={2} direction="column" flexGrow={1}>
        <Text fontWeight={600} color="gray.500">
          Community Type
        </Text>
        <Text>
          Currently{" "}
          {communityData.privacyType === "public"
            ? "Public"
            : communityData?.privacyType === "restricted"
            ? "Restricted"
            : "Private"}
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
        <Button onClick={handleSaveButtonClick}>Save</Button>
      </Stack>
    </>
  );
};
