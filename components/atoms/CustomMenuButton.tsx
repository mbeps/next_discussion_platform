import { MenuItem, Flex, Icon } from "@chakra-ui/react";

/**
 * @param {React.ReactElement} icon - icon of the button
 * @param {string} text - text of the button
 * @param {() => void} onClick - function to be called when the button is clicked
 */
interface CustomMenuButtonProps {
  icon: React.ReactElement;
  text: string;
  onClick: () => void;
}

/**
 * Custom menu button component for various menus.
 * @param {React.ReactElement} icon - icon of the button
 * @param {string} text - text of the button
 * @param {() => void} onClick - function to be called when the button is clicked
 * @returns {React.FC} - the custom menu button component
 */
const CustomMenuButton: React.FC<CustomMenuButtonProps> = ({
  icon,
  text,
  onClick,
}) => {
  return (
    <MenuItem
      fontSize="10pt"
      fontWeight={700}
      onClick={onClick}
      height="40px"
      borderRadius={10}
      alignContent="center"
      _hover={{
        bg: "gray.300",
        color: "black",
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
