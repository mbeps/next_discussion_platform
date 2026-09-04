import { Flex, Icon, IconButton } from "@chakra-ui/react";
import { useSetAtom } from "jotai";
import type React from "react";
import { BsBookmark } from "react-icons/bs";
import { GrAdd } from "react-icons/gr";
import { LuMoon, LuSun } from "react-icons/lu";
import { savedPostStateAtom } from "@/atoms/savedPostsAtom";
import { useColorMode } from "@/components/ui/color-mode";
import useCommunityPermissions from "@/hooks/community/useCommunityPermissions";
import useCommunityState from "@/hooks/community/useCommunityState";
import useCallCreatePost from "@/hooks/posts/useCallCreatePost";
import useCustomToast from "@/hooks/useCustomToast";

/**
 * Displays icons in the right side of the navbar:
 *  - Color mode toggle
 *  - Add icon for creating a new post (always visible)
 * @returns React.FC - icons in the right side of the navbar
 */
const Icons: React.FC = () => {
  const { onClick } = useCallCreatePost();
  const { colorMode, toggleColorMode } = useColorMode();
  const setSavedPostState = useSetAtom(savedPostStateAtom);
  const { communityStateValue } = useCommunityState();
  const { canPost } = useCommunityPermissions(
    communityStateValue.currentCommunity,
  );
  const showToast = useCustomToast();

  const handleCreatePostClick = () => {
    if (communityStateValue.currentCommunity && !canPost) {
      showToast({
        title: "Restricted Community",
        description: "You must be a member to post in this community.",
        status: "error",
      });
      return;
    }
    onClick();
  };

  return (
    <Flex align="center" p={1}>
      <Flex>
        <IconButton
          aria-label="Toggle color mode"
          variant="ghost"
          fontSize={22}
          onClick={toggleColorMode}
          mr={1.5}
          ml={1.5}
        >
          <Icon as={colorMode === "light" ? LuSun : LuMoon} />
        </IconButton>
      </Flex>
      <IconButton
        aria-label="Saved Posts"
        variant="ghost"
        fontSize={22}
        onClick={() => setSavedPostState((prev) => ({ ...prev, isOpen: true }))}
        mr={1.5}
        ml={1.5}
      >
        <Icon as={BsBookmark} />
      </IconButton>
      {/* Always visible */}
      <IconButton
        aria-label="Create post"
        variant="ghost"
        fontSize={22}
        onClick={handleCreatePostClick}
        mr={1.5}
        ml={1.5}
      >
        <Icon as={GrAdd} />
      </IconButton>
    </Flex>
  );
};
export default Icons;
