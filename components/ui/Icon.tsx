import { Flex, Icon } from "@chakra-ui/react";
import type React from "react";
import type { IconType } from "react-icons";

type IconProps = {
  icon: IconType;
  fontSize: number;
  onClick?: () => void;
  iconColor?: string;
  label?: string;
};

/**
 * A wrapper component for rendering icons with consistent hover effects and accessibility attributes.
 * Supports optional click handlers and custom coloring.
 * @param icon - The icon component from `react-icons` to render.
 * @param fontSize - The size of the icon.
 * @param onClick - Optional callback for click events.
 * @param iconColor - Optional custom color for the icon.
 * @param label - Optional aria-label for accessibility.
 * @returns A styled flex container wrapping the icon.
 */
const IconItem: React.FC<IconProps> = ({
  icon,
  fontSize,
  onClick,
  iconColor,
  label,
}) => {
  return (
    <Flex
      mr={1.5}
      ml={1.5}
      padding={1}
      cursor="pointer"
      borderRadius={4}
      _hover={{
        bg: { base: "gray.200", _dark: "gray.700" },
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={label}
    >
      <Icon
        as={icon}
        fontSize={fontSize}
        color={iconColor || { base: "black", _dark: "white" }}
      />
    </Flex>
  );
};

export default IconItem;
