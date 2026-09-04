import { Flex, Icon, MenuItem } from "@chakra-ui/react";

interface CustomMenuButtonProps {
  icon: React.ReactElement;
  text: string;
  onClick: () => void;
}

/**
 * A styled menu item component designed for use within Chakra UI menus.
 * Combines an icon and text with consistent hover states and layout.
 * @param icon - The icon element to display.
 * @param text - The label text for the menu item.
 * @param onClick - Callback triggered when the menu item is clicked.
 * @returns A themed menu item component.
 */
const CustomMenuButton: React.FC<CustomMenuButtonProps> = ({
  icon,
  text,
  onClick,
}) => {
  return (
    <MenuItem
      value={text}
      fontSize="10pt"
      fontWeight={700}
      onClick={onClick}
      height="40px"
      borderRadius={10}
      alignContent="center"
      _hover={{
        bg: { base: "gray.300", _dark: "gray.600" },
        color: { base: "black", _dark: "white" },
      }}
    >
      <Flex align="center">
        <Icon fontSize={20} mr={2} mt={1}>
          {icon}
        </Icon>
        {text}
      </Flex>
    </MenuItem>
  );
};

export default CustomMenuButton;
