/* eslint-disable react-hooks/rules-of-hooks */
import { Flex, Icon } from "@chakra-ui/react";
import React from "react";
import { IconType } from "react-icons";

/**
 * @param {IconType} icon - Icon to be displayed
 * @param {number} fontSize - Font size of the icon
 * @param {() => void} onClick - Function to be executed when the button is clicked
 * @param {string} iconColor - Color of the icon
 */
type IconProps = {
  icon: IconType;
  fontSize: number;
  onClick?: () => void;
  iconColor?: string;
};

/**
 * Displays an icon with a hover effect.
 * Takes some props to render the icon and to execute a function when the icon is clicked.
 * @param {IconType} icon - Icon to be displayed
 * @param {number} fontSize - Font size of the icon
 * @param {() => void} onClick - Function to be executed when the button is clicked
 * @param {string} iconColor - Color of the icon (default: black)
 *
 * @returns {React.FC<IconProps>} - Icon with a hover effect
 */
const IconItem: React.FC<IconProps> = ({
  icon,
  fontSize,
  onClick,
  iconColor = "black",
}) => {
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
      <Icon as={icon} fontSize={fontSize} color={iconColor} />
    </Flex>
  );
};

export default IconItem;
