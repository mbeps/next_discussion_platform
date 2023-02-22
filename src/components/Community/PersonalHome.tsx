import React, { useState } from "react";
import { Button, Flex, Icon, Stack, Text, Image } from "@chakra-ui/react";
import { FaReddit } from "react-icons/fa";
import { communityState } from "@/atoms/communitiesAtom";
import { useRecoilValue } from "recoil";
import CreateCommunityModal from "../Modal/CreateCommunity/CreateCommunityModal";

const PersonalHome: React.FC = () => {
  const [open, setOpen] = useState(false); // modal initially closed
  const mySnippets = useRecoilValue(communityState).mySnippets;

  return (
    <>
      <CreateCommunityModal open={open} handleClose={() => setOpen(false)} />
      <Flex
        direction="column"
        bg="white"
        borderRadius={10}
        cursor="pointer"
        border="1px solid"
        borderColor="gray.300"
        position="sticky"
      >
        <Flex
          align="flex-end"
          color="white"
          p="6px 10px"
          bg="blue.500"
          height="34px"
          borderRadius="10px 10px 0px 0px"
          fontWeight={600}
          bgImage="url(/images/banners/small.jpg)"
          backgroundSize="cover"
        ></Flex>
        <Flex direction="column" p="12px">
          <Flex align="center" mb={2}>
            <Image
              src="/images/logo.svg"
              height="50px"
              alt="Website logo"
              mr={2}
            />
            <Text fontWeight={600}>Home</Text>
          </Flex>
          <Stack spacing={3}>
            <Text fontSize="9pt">
              Home page personalized based on your subscribed communities.
            </Text>
            <Button height="30px">Create Post</Button>
            <Button
              variant="outline"
              height="30px"
              onClick={() => setOpen(true)}
            >
              Create Community
            </Button>
          </Stack>
        </Flex>
      </Flex>
    </>
  );
};
export default PersonalHome;
