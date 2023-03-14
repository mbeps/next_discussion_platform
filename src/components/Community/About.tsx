import { Community, communityState } from "@/atoms/communitiesAtom";
import { auth, firestore, storage } from "@/firebase/clientApp";
import useSelectFile from "@/hooks/useSelectFile";
import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Image,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { User } from "@firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { useSetRecoilState } from "recoil";

/**
 * @param {string} communityName - Name of the community
 */
type AboutProps = {
  communityData: Community;
};

/**
 * This about component is used for displaying general information about the community.
 * It displays the following data:
 *  - The number of subscribers in the community
 *  - Date when the community was created
 *  - Button for creating a new post
 *
 * Additional elements are displayed if the current user is an admin:
 *  - Button for changing image
 * @param {communityData} - data required to be displayed
 * @returns (React.FC<AboutProps>) - About component
 * @requires AboutHeaderBar - Header bar for the about section.
 * @requires AboutCommunity - Displays the number of subscribers and the date when the community was created.
 * @requires AdminSectionAbout - Displays some additional elements if the current user is an admin.
 */
const About: React.FC<AboutProps> = ({ communityData }) => {
  const [user] = useAuthState(auth);
  const router = useRouter();

  return (
    // sticky position for the about section
    <Box position="sticky" top="60px" borderRadius={10} shadow="md">
      <AboutHeaderBar communityName={communityData.id} />

      {/* about section */}
      <Flex
        direction="column"
        p={3}
        bg="white"
        borderRadius="0px 0px 10px 10px"
      >
        <Stack>
          <AboutCommunity communityData={communityData} />
          <Button
            width="100%"
            onClick={() => {
              router.push(`/community/${communityData.id}/submit`);
            }}
          >
            Create Post
          </Button>

          {/* upload icon for community if user is admin */}
          <AdminSectionAbout user={user} communityData={communityData} />
        </Stack>
      </Flex>
    </Box>
  );
};
export default About;

/**
 * @param {string} communityName - Name of the community
 */
interface AboutHeaderBarProps {
  communityName: string;
}

/**
 * Header bar for the about section.
 * Contains the name of the community and a button for more options.
 * @param {string} communityName - Name of the community
 * @returns {React.FC<AboutHeaderBarProps>} - Header bar for the about section
 */
const AboutHeaderBar: React.FC<AboutHeaderBarProps> = ({ communityName }) => (
  <Flex
    justify="space-between"
    align="center"
    bg="red.500"
    color="white"
    p={3}
    borderRadius="10px 10px 0px 0px"
  >
    <Text fontSize="10pt" fontWeight={700}>
      About {communityName}
    </Text>
    <Icon as={HiOutlineDotsHorizontal} />
  </Flex>
);

/**
 * @param {Community} communityData - data required to be displayed
 */
interface AboutCommunityProps {
  communityData: Community;
}

/**
 * Displays the number of subscribers and the date when the community was created.
 * @param {Community} communityData - data required to be displayed
 * @returns {React.FC<AboutCommunityProps>} - About community component
 */
const AboutCommunity: React.FC<AboutCommunityProps> = ({ communityData }) => (
  <Flex width="100%" p={2} fontSize="10pt">
    <Flex direction="column" flexGrow={1}>
      {/* number of subscribers and date created */}
      <Text fontWeight={700}>Subscribers</Text>
      <Text>{communityData.numberOfMembers.toLocaleString()}</Text>
    </Flex>

    {/* when the community was created */}
    <Flex direction="column" flexGrow={1}>
      <Text fontWeight={700}>Created</Text>
      <Text>
        {communityData.createdAt &&
          moment(new Date(communityData.createdAt.seconds * 1000)).format(
            "MMM DD, YYYY"
          )}
      </Text>
    </Flex>
  </Flex>
);

/**
 * @param {User | null | undefined} user - current user
 */
interface AdminSectionAboutProps {
  user: User | null | undefined;
  communityData: Community;
}

/**
 * Displays some additional elements if the current user is an admin:
 *  - Button for changing image
 * @param {User | null | undefined} user - current user
 * @returns {React.FC<AdminSectionAboutProps>} - Admin section component
 */
const AdminSectionAbout: React.FC<AdminSectionAboutProps> = ({
  user,
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
    <>
      {user?.uid === communityData?.creatorId && (
        <>
          <Divider />
          <Stack fontSize="10pt" spacing={1}>
            <Text fontWeight={600} fontSize="12pt">
              Admin
            </Text>
            <Text fontWeight={600} color="gray.500">
              Community Image Settings
            </Text>
            {/* change image button */}
            <Flex align="center" justify="space-between">
              <Text
                color="red.500"
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
                onClick={() => selectFileRef.current?.click()}
              >
                Change Image
              </Text>
              {/* image preview */}
              {communityData?.imageURL || selectedFile ? (
                // selected image
                <Image
                  borderRadius="full"
                  boxSize="40px"
                  src={selectedFile || communityData?.imageURL}
                  alt="Selected image"
                  shadow="md"
                />
              ) : (
                // default image
                <Image
                  src="/images/logo.svg"
                  height="40px"
                  alt="Website logo"
                  shadow="md"
                />
              )}
            </Flex>
            {/* save changes button */}
            {selectedFile &&
              (uploadingImage ? (
                // while image is loading show spinner for loading
                <Spinner />
              ) : (
                <Text cursor="pointer" onClick={onUpdateImage}>
                  Save Changes
                </Text>
              ))}
            <input
              id="file-upload"
              type="file"
              accept="image/png,image/gif,image/jpeg"
              hidden
              ref={selectFileRef}
              onChange={onSelectFile}
            />
          </Stack>
          {/* delete image button */}
          {communityData?.imageURL && (
            <Text
              fontSize="10pt"
              color="red.500"
              cursor="pointer"
              _hover={{ textDecoration: "underline" }}
              onClick={() => onDeleteImage(communityData.id)}
            >
              Delete Image
            </Text>
          )}
        </>
      )}
    </>
  );
};
