import type { IconType } from "react-icons";

/**
 * Item used in the navbar directory dropdown to route between communities or home.
 * Holds label, link, and icon data for quick navigation.
 */
export type DirectoryMenuItem = {
  displayText: string;
  link: string;
  icon: IconType;
  iconColor: string | { base: string; _dark: string };
  imageURL?: string;
};
