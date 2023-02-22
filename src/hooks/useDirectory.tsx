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
 *
 * @returns directoryState (DirectoryState) - object containing the current directory state
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
   * @param menuItem (DirectoryMenuItem) - object representing the menu item that was selected
   */
  const onSelectMenuItem = (menuItem: DirectoryMenuItem) => {
    setDirectoryState((prev) => ({
      ...prev,
      selectedMenuItem: menuItem,
    }));
    router.push(menuItem.link);
    if (directoryState.isOpen) {
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
    }));
  };

  useEffect(() => {
    const { currentCommunity } = communityStateValue;

    if (currentCommunity) {
      // if the user is currently in a community
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
    }
  }, [communityStateValue.currentCommunity]);

  return { directoryState, toggleMenuOpen, onSelectMenuItem };
};
export default useDirectory;
