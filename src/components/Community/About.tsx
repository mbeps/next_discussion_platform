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

type AboutProps = {
  communityData: Community;
};

const About: React.FC<AboutProps> = ({ communityData }) => {
  const [user] = useAuthState(auth);
  const selectFileRef = useRef<HTMLInputElement>(null);
  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();
  const [uploadingImage, setUploadingImage] = useState(false);
  const setCommunityStateValue = useSetRecoilState(communityState);

  const onUpdateImage = async () => {
    if (!selectedFile) {
      return;
    }
    setUploadingImage(true);

    try {
      const imageRef = ref(storage, `communities/${communityData.id}/image`);
      await uploadString(imageRef, selectedFile, "data_url");
      const downloadURL = await getDownloadURL(imageRef);
      await updateDoc(doc(firestore, "communities", communityData.id), {
        imageURL: downloadURL,
      });

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
      setUploadingImage(false);
    }
  };

  return (
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

      <Flex
        direction="column"
        p={3}
        bg="white"
        borderRadius="0px 0px 10px 10px"
      >
        <Stack>
          <Flex width="100%" p={2} fontSize="10pt">
            <Flex direction="column" flexGrow={1}>
              <Text fontWeight={700}>Subscribers</Text>
              <Text>{communityData.numberOfMembers.toLocaleString()}</Text>
            </Flex>
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
                <Flex align="center" justify="space-between">
                  <Text
                    color="red.500"
                    cursor="pointer"
                    _hover={{ textDecoration: "underline" }}
                    onClick={() => selectFileRef.current?.click()}
                  >
                    Change Image
                  </Text>
                  {communityData?.imageURL || selectedFile ? (
                    <Image
                      borderRadius="full"
                      boxSize="40px"
                      src={selectedFile || communityData?.imageURL}
                      alt="Dan Abramov"
                    />
                  ) : (
                    <Image
                      src="/images/logo.svg"
                      height="40px"
                      alt="Website logo"
                    />
                  )}
                </Flex>
                {selectedFile &&
                  (uploadingImage ? (
                    <Spinner />
                  ) : (
                    <Text cursor="pointer" onClick={onUpdateImage}>
                      Save Changes
                    </Text>
                  ))}
                <input
                  id="file-upload"
                  type="file"
                  accept="image/x-png,image/gif,image/jpeg"
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
