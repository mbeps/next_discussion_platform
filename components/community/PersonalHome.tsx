import { Button, Flex, Image, Stack, Text } from "@chakra-ui/react";
import type React from "react";
import { useState } from "react";
import useCallCreatePost from "@/hooks/posts/useCallCreatePost";
import CreateCommunityModal from "../modal/create-community/CreateCommunityModal";

/**
 * A sidebar card that provides quick actions for the user's personal home feed.
 * Allows users to initiate post creation or open the community creation modal.
 * @returns A themed card with action buttons for home feed management.
 */
const PersonalHome: React.FC = () => {
  const [open, setOpen] = useState(false); // modal initially closed

  const { onClick } = useCallCreatePost();

  return (
    <>
      <CreateCommunityModal open={open} handleClose={() => setOpen(false)} />
      <Flex
        direction="column"
        bg={{ base: "white", _dark: "gray.800" }}
        borderRadius={10}
        cursor="pointer"
        border="1px solid"
        borderColor={{ base: "gray.300", _dark: "gray.700" }}
        position="sticky"
        shadow="md"
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
          <Stack gap={3}>
            <Text fontSize="9pt">
              Home page personalized based on your subscribed communities.
            </Text>
            <Button height="30px" onClick={onClick}>
              Create Post
            </Button>
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
