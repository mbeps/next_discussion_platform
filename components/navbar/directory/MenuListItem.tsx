import { Flex, Image, MenuItem } from "@chakra-ui/react";
import type React from "react";
import type { IconType } from "react-icons";
import useDirectory from "@/hooks/useDirectory";

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
  iconColor: _iconColor,
  imageURL,
}) => {
  const { onSelectMenuItem } = useDirectory();

  return (
    <MenuItem
      value={displayText}
      mt={1}
      mb={1}
      fontSize="10pt"
      fontWeight={700}
      height="40px"
      borderRadius={10}
      alignContent="center"
      _hover={{
        bg: { base: "gray.300", _dark: "gray.700" },
        color: { base: "black", _dark: "white" },
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
