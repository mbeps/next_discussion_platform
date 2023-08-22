import { atom } from "recoil";
import { IconType } from "react-icons";
import { TiHome } from "react-icons/ti";

/**
 * Interface which describes the state of the directory menu item.
 * Captures community information for the directory menu item.
 * @property {string} displayText - text to be displayed on the menu item
 * @property {string} link - link to be navigated to when the menu item is clicked
 * @property {IconType} icon - icon to be displayed on the menu item
 * @property {string} iconColor - color of the icon
 * @property {string} imageURL - URL of the image to be displayed on the menu item
 */
export type DirectoryMenuItem = {
  displayText: string;
  link: string;
  icon: IconType;
  iconColor: string;
  imageURL?: string;
};

/**
 * Interface which describes the state of the directory menu.
 * @property {boolean} isOpen - whether the directory menu is open or not
 * @property {DirectoryMenuItem} selectedMenuItem - the menu item that is currently selected
 */
interface DirectoryMenuState {
  isOpen: boolean;
  selectedMenuItem: DirectoryMenuItem;
}

/**
 * Default menu item when no community is selected (home page).
 * @property {string} displayText - "Home"
 * @property {string} link - "/" (home page)
 * @property {IconType} icon - TiHome (home icon)
 * @property {string} iconColor - "black"
 */
export const defaultMenuItem = {
  displayText: "Home",
  link: "/",
  icon: TiHome,
  iconColor: "black",
};

/**
 * Default state of the directory menu.
 * The directory menu is closed by default.
 * @property {boolean} isOpen - false by default
 * @property {DirectoryMenuItem} selectedMenuItem - default menu item (home page)
 */
export const defaultMenuState: DirectoryMenuState = {
  isOpen: false,
  selectedMenuItem: defaultMenuItem,
};

/**
 * Recoil atom which stores the state of the directory menu.
 * @property {"directoryMenuState"} key - "directoryMenuState"
 * @property {DirectoryMenuState} default - default state of the directory menu (closed and home page selected)
 */
export const directoryMenuState = atom<DirectoryMenuState>({
  key: "directoryMenuState",
  default: defaultMenuState,
});
