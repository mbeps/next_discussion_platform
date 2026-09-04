import { atom } from "jotai";
import { TiHome } from "react-icons/ti";
import type { DirectoryMenuItem } from "@/types/directoryMenu";

/**
 * Interface which describes the state of the directory menu.
 * @property isOpen - whether the directory menu is open or not
 * @property selectedMenuItem - the menu item that is currently selected
 */
interface DirectoryMenuState {
  isOpen: boolean;
  selectedMenuItem: DirectoryMenuItem;
}

export const defaultMenuItem = {
  displayText: "Home",
  link: "/",
  icon: TiHome,
  iconColor: { base: "black", _dark: "white" },
};

export const defaultMenuState: DirectoryMenuState = {
  isOpen: false,
  selectedMenuItem: defaultMenuItem,
};

/**
 * A Jotai atom that manages the state of the navigation directory menu.
 * It tracks whether the menu is open and which menu item is currently selected.
 */
export const directoryMenuAtom = atom<DirectoryMenuState>(defaultMenuState);
