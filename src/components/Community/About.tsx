import { Community, communityState } from "@/atoms/communitiesAtom";
import { auth, firestore, storage } from "@/firebase/clientApp";
import useSelectFile from "@/hooks/useSelectFile";
import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Stack,
  Image,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { useSetRecoilState } from "recoil";

/**
 * Props for About component.
 */
type AboutProps = {
  communityData: Community;
};

/**
 * About component displaying:
 *    - The number of subscribers in the community
 *    - Date when the community was created
 *    - Button for creating a new post
 *
 * Additional elements are displayed if the current user is an admin:
 *    - Button for changing image
 * @param {communityData} - data required to be displayed
 * @returns (React.FC<AboutProps>) - About component
 */
const About: React.FC<AboutProps> = ({ communityData }) => {
  const [user] = useAuthState(auth);
  const selectFileRef = useRef<HTMLInputElement>(null);
  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile(
    300,
    300
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const setCommunityStateValue = useSetRecoilState(communityState);

  /**
   * Allows admin to change the image of the community.
   * @returns null if no file is selected
   */
  const onUpdateImage = async () => {
    if (!selectedFile) {
      // if no file is selected, do nothing
      return;
    }
    setUploadingImage(true); // set uploading image to true

    try {
      const imageRef = ref(storage, `communities/${communityData.id}/image`); // create reference to image in storage
      await uploadString(imageRef, selectedFile, "data_url"); // upload image to storage
      const downloadURL = await getDownloadURL(imageRef); // get download url of image
      await updateDoc(doc(firestore, "communities", communityData.id), {
        imageURL: downloadURL,
      }); // update imageURL in firestore

      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          imageURL: downloadURL,
        } as Community,
      })); // update imageURL in recoil state
    } catch (error) {
      console.log("Error: onUploadImage", error);
    } finally {
      setUploadingImage(false); // set uploading image to false
    }
  };

  return (
    // sticky position for the about section
    <Box position="sticky" top="50px">
      <Flex
        justify="space-between"
        align="center"
        bg="red.500"
        color="white"
        p={3}
        borderRadius="10px 10px 0px 0px"
      >
        <Text fontSize="10pt" fontWeight={700}>
          About Circus
        </Text>
        <Icon as={HiOutlineDotsHorizontal} />
      </Flex>

      {/* about section */}
      <Flex
        direction="column"
        p={3}
        bg="white"
        borderRadius="0px 0px 10px 10px"
      >
        <Stack>
          <Flex width="100%" p={2} fontSize="10pt">
            <Flex direction="column" flexGrow={1}>
              {/* number of subscribers and date created */}
              <Text fontWeight={700}>Subscribers</Text>
              <Text>{communityData.numberOfMembers.toLocaleString()}</Text>
            </Flex>

            {/* when the community was created */}
            <Flex direction="column" flexGrow={1}>
              <Text fontWeight={700}>Created</Text>
              <Text>{communityData.createdAt && "Not Working :("}</Text>
            </Flex>
          </Flex>
          {/* create post button */}
          <Link href={`/community/${communityData.id}/submit`}>
            <Button width="100%">Create Post</Button>
          </Link>

          {/* upload icon for community if user is admin */}
          {user?.uid === communityData?.creatorId && (
            <>
              <Divider />
              <Stack fontSize="10pt" spacing={1}>
                <Text fontWeight={600}>Admin</Text>
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
                    />
                  ) : (
                    // default image
                    <Image
                      src="/images/logo.svg"
                      height="40px"
                      alt="Website logo"
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
            </>
          )}
        </Stack>
      </Flex>
    </Box>
  );
};
export default About;
