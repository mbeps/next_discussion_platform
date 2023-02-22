import React from "react";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Flex, Icon } from "@chakra-ui/react";
import { BsArrowUpRightCircle, BsChatDots } from "react-icons/bs";
import { GrAdd } from "react-icons/gr";
import {
  IoFilterCircleOutline,
  IoNotificationsOutline,
  IoVideocam,
  IoVideocamOutline,
} from "react-icons/io5";

type IconProps = {
  as: React.ElementType;
  fontSize: number;
};

const IconItem: React.FC<IconProps> = ({ as: Icon, fontSize }) => {
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
    >
      <Icon fontSize={fontSize} />
    </Flex>
  );
};

const icons: React.FC = () => {
  return (
    <Flex>
      <Flex
        // Not visible on mobile screen sizes
        display={{ base: "none", md: "flex" }}
        align="center"
        borderRight="1px solid"
        borderColor="gray.200"
      >
        <IconItem as={BsArrowUpRightCircle} fontSize={20} />

        <IconItem as={IoFilterCircleOutline} fontSize={22} />

        <IconItem as={IoVideocamOutline} fontSize={22} />
      </Flex>
      <>
        {/* Always visible */}
        <IconItem as={GrAdd} fontSize={20} />
        <IconItem as={IoNotificationsOutline} fontSize={20} />
      </>
    </Flex>
  );
};
export default icons;
