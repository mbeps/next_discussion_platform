import { Flex, Icon, Input } from "@chakra-ui/react";
import type React from "react";
import { BsLink45Deg } from "react-icons/bs";
import { IoIosCreate } from "react-icons/io";
import { IoImageOutline } from "react-icons/io5";
import useCommunityPermissions from "@/hooks/community/useCommunityPermissions";
import useCommunityState from "@/hooks/community/useCommunityState";
import useCallCreatePost from "@/hooks/posts/useCallCreatePost";

type CreatePostProps = Record<string, never>;

/**
 * A call-to-action bar that provides a shortcut to the post creation page.
 * Automatically handles authentication checks and community-specific posting permissions.
 * @returns A styled input-like component that triggers navigation or the auth modal.
 */
const CreatePostLink: React.FC<CreatePostProps> = () => {
  const { onClick } = useCallCreatePost(); // hook for creating a new post
  const { communityStateValue } = useCommunityState();
  const { canPost } = useCommunityPermissions(
    communityStateValue.currentCommunity,
  );

  if (communityStateValue.currentCommunity && !canPost) {
    return null;
  }

  return (
    <Flex
      justify="space-evenly"
      align="center"
      bg={{ base: "white", _dark: "gray.800" }}
      height="56px"
      borderRadius={12}
      border="1px solid"
      borderColor={{ base: "gray.300", _dark: "gray.700" }}
      p={2}
      mb={4}
      shadow="md"
    >
      <Icon as={IoIosCreate} fontSize={36} color="gray.300" mr={4} />
      {/* Input for creating a new post */}
      <Input
        placeholder="Create Post"
        fontSize="10pt"
        _placeholder={{ color: { base: "gray.500", _dark: "gray.400" } }}
        _hover={{
          bg: { base: "white", _dark: "gray.700" },
          border: "1px solid",
          borderColor: "red.500",
        }}
        _focus={{
          outline: "none",
          bg: { base: "white", _dark: "gray.700" },
          border: "1px solid",
          borderColor: "red.500",
        }}
        bg={{ base: "gray.50", _dark: "gray.800" }}
        borderColor={{ base: "gray.200", _dark: "gray.600" }}
        height="36px"
        borderRadius={10}
        mr={4}
        onClick={onClick}
      />
      <Icon
        as={IoImageOutline}
        fontSize={24}
        mr={4}
        color="gray.400"
        cursor="pointer"
      />
      <Icon as={BsLink45Deg} fontSize={24} color="gray.400" cursor="pointer" />
    </Flex>
  );
};
export default CreatePostLink;
