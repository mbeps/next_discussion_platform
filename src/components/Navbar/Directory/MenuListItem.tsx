import useDirectory from "@/hooks/useDirectory";
import { Flex, Image, MenuItem } from "@chakra-ui/react";
import React from "react";
import { IconType } from "react-icons";

/**
 * @param {string} displayText - text to be displayed in the menu item
 * @param {string} link - link to be navigated to when the menu item is clicked
 * @param {IconType} icon - icon to be displayed in the menu item
 * @param {string} iconColor - color of the icon
 * @param {string} imageURL - image to be displayed in the menu item
 */
type MenuListItemProps = {
  displayText: string;
  link: string;
  icon: IconType;
  iconColor: string; // differentiate between admin and normal communities
  imageURL?: string;
};

/**
 * Displays a menu item for each community entry in the directory.
 * @param {string} displayText - text to be displayed in the menu item
 * @param {string} link - link to be navigated to when the menu item is clicked
 * @param {IconType} icon - icon to be displayed in the menu item
 * @param {string} iconColor - color of the icon
 * @param {string} imageURL - image to be displayed in the menu item
 *
 * @returns {React.FC<MenuListItemProps>} - menu item for each community entry in the directory
 */
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
