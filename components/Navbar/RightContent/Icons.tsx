/* eslint-disable react-hooks/rules-of-hooks */
import IconItem from "@/components/atoms/Icon";
import useCallCreatePost from "@/hooks/useCallCreatePost";
import { Flex, Icon } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { IconType } from "react-icons";
import { GrAdd } from "react-icons/gr";
import { VscGithub } from "react-icons/vsc";

/**
 * Displays icons in the right side of the navbar:
 *  - Github icon for the source code (not visible on mobile screen sizes)
 *  - Add icon for creating a new post (always visible)
 * @returns React.FC - icons in the right side of the navbar
 */
const icons: React.FC = () => {
  const router = useRouter();
  const { onClick } = useCallCreatePost();

  return (
    <Flex>
      <Flex
        // Not visible on mobile screen sizes
        display={{ base: "none", md: "flex" }}
        align="center"
        borderRight="1px solid"
        borderColor="gray.200"
      >
        <IconItem
          icon={VscGithub}
          fontSize={20}
          onClick={() => {
            router.push("https://github.com/mbeps/next_discussion_platform");
          }}
        />
      </Flex>
      <>
        {/* Always visible */}
        <IconItem icon={GrAdd} fontSize={20} onClick={onClick} />
      </>
    </Flex>
  );
};
export default icons;
