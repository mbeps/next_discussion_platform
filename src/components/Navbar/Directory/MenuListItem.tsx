import useDirectory from "@/hooks/useDirectory";
import { Flex, Image, MenuItem } from "@chakra-ui/react";
import React from "react";
import { IconType } from "react-icons";

type MenuListItemProps = {
  displayText: string;
  link: string;
  icon: IconType;
  iconColor: string; // differentiate between admin and normal communities
  imageURL?: string;
};

const MenuListItem: React.FC<MenuListItemProps> = ({
  displayText,
  link,
  icon,
  iconColor,
  imageURL,
}) => {
  const { onSelectMenuItem } = useDirectory();

  return (
    <MenuItem
      mt={1}
      mb={1}
      fontSize="10pt"
      fontWeight={700}
      height="40px"
      borderRadius={10}
      alignContent="center"
      _hover={{
        bg: "gray.300",
        color: "black",
      }}
      onClick={() =>
        onSelectMenuItem({
          displayText,
          link,
          icon,
          imageURL,
          iconColor: "",
        })
      }
    >
      <Flex align="center">
        <Image
          src={imageURL ? imageURL : "/images/logo.svg"}
          alt="Community logo"
          borderRadius="full"
          boxSize="18px"
          mr={2}
        />
        {displayText}
      </Flex>
    </MenuItem>
  );
};
export default MenuListItem;
