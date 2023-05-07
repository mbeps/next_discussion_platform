/* eslint-disable react-hooks/exhaustive-deps */
import { communityState } from "@/atoms/communitiesAtom";
import {
  DirectoryMenuItem,
  directoryMenuState,
} from "@/atoms/directoryMenuAtom";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { IoPeopleCircleOutline } from "react-icons/io5";
import { useRecoilState, useRecoilValue } from "recoil";

/**
 * Hook for managing the directory menu from various components.
 * Functionality includes:
 * - Selecting a community from the directory menu
 * - Toggling the directory menu open or closed
 * @returns {DirectoryMenuState} directoryState - object containing the current directory state
 */
const useDirectory = () => {
  const [directoryState, setDirectoryState] =
    useRecoilState(directoryMenuState);
  const router = useRouter();
  const communityStateValue = useRecoilValue(communityState);

  /**
   * Allows the user to select a menu item from the directory menu.
   * If the user is already on the page that the menu item links to, then the menu will close.
   * If the user is not on the page that the menu item links to, then the user will be redirected to the page.
   * @param {DirectoryMenuItem} menuItem - object representing the menu item that was selected
   */
  const onSelectMenuItem = (menuItem: DirectoryMenuItem) => {
    // updates the selected menu item on state
    setDirectoryState((prev) => ({
      ...prev,
      selectedMenuItem: menuItem,
    })); // set the selected menu item on state

    router.push(menuItem.link); // redirect the user to the page
    if (directoryState.isOpen) {
      // if the menu is open, then close it
      toggleMenuOpen();
    }
  };

  /**
   * Toggles the directory menu open or closed.
   * If the menu is open, then the menu will close.
   */
  const toggleMenuOpen = () => {
    setDirectoryState((prev) => ({
      ...prev,
      isOpen: !directoryState.isOpen,
    })); // toggle the menu open or closed
  };

  /**
   * If the user is currently in a community, then the directory menu will be set to the community menu item.
   * This is done to ensure that the user can navigate back to the community page from any page.
   */
  useEffect(() => {
    const { currentCommunity } = communityStateValue;

    if (
      currentCommunity &&
      router.pathname !== "/" &&
      router.pathname !== "/communities"
    ) {
      // if the user is currently in a community and not on the home page
      setDirectoryState((prev) => ({
        ...prev,
        selectedMenuItem: {
          displayText: currentCommunity?.id,
          link: `community/${currentCommunity?.id}`,
          imageURL: currentCommunity?.imageURL,
          icon: IoPeopleCircleOutline,
          iconColor: "red.500",
        },
      }));
    } else if (router.pathname === "/communities") {
      // if the user is on the communities page
      setDirectoryState((prev) => ({
        ...prev,
        selectedMenuItem: {
          displayText: "Communities",
          link: "/communities",
          imageURL: "",
          icon: IoPeopleCircleOutline,
          iconColor: "red.500",
        },
      }));
    }
  }, [communityStateValue.currentCommunity, router.pathname]);

  return { directoryState, toggleMenuOpen, onSelectMenuItem };
};
export default useDirectory;
