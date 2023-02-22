/* eslint-disable react-hooks/rules-of-hooks */
import useCallCreatePost from "@/hooks/useCallCreatePost";
import { Flex, Icon } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { IconType } from "react-icons";
import { GrAdd } from "react-icons/gr";
import { VscGithub } from "react-icons/vsc";

type IconProps = {
  icon: IconType;
  fontSize: number;
  onClick?: () => void;
};

const IconItem: React.FC<IconProps> = ({ icon, fontSize, onClick }) => {
  return (
    <Flex
      mr={1.5}
      ml={1.5}
      padding={1}
      cursor="pointer"
      borderRadius={4}
      _hover={{
        bg: "gray.200",
      }}
      onClick={onClick}
    >
      <Icon as={icon} fontSize={fontSize} />
    </Flex>
  );
};

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
        {/* <IconItem icon={BsArrowUpRightCircle} fontSize={20} /> */}
        {/* <IconItem icon={IoFilterCircleOutline} fontSize={22} /> */}
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
