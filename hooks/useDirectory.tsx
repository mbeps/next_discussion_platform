import { useAtom, useAtomValue } from "jotai";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { IoPeopleCircleOutline } from "react-icons/io5";
import { communityStateAtom } from "@/atoms/communitiesAtom";
import { defaultMenuItem, directoryMenuAtom } from "@/atoms/directoryMenuAtom";
import type { DirectoryMenuItem } from "@/types/directoryMenu";

/**
 * A custom hook that manages the state and behavior of the navigation directory menu.
 * It synchronizes the selected menu item with the current URL path and community context,
 * and provides functions for toggling the menu and navigating between different sections of the app.
 * @returns An object containing the directory state and functions for menu interaction.
 */
const useDirectory = () => {
  const [directoryState, setDirectoryState] = useAtom(directoryMenuAtom);
  const router = useRouter();
  const pathname = usePathname();
  const communityStateValue = useAtomValue(communityStateAtom);

  /**
   * Updates the selected menu item and routes to the chosen page.
   * @param menuItem - Item the user clicked in the directory list.
   * @returns Closes the menu if it was open and navigates to the link.
   */
  const onSelectMenuItem = (menuItem: DirectoryMenuItem) => {
    setDirectoryState((prev) => ({
      ...prev,
      selectedMenuItem: menuItem,
    }));

    router.push(menuItem.link);
    if (directoryState.isOpen) {
      setDirectoryOpen(false);
    }
  };

  /**
   * Toggles the directory menu open or closed.
   * @param isOpen - Whether the menu should be open.
   */
  const setDirectoryOpen = (isOpen: boolean) => {
    setDirectoryState((prev) => ({
      ...prev,
      isOpen,
    }));
  };

  const toggleMenuOpen = () => {
    setDirectoryOpen(!directoryState.isOpen);
  };

  /**
   * If the user is currently in a community, then the directory menu will be set to the community menu item.
   * This is done to ensure that the user can navigate back to the community page from any page.
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: Sync directory menu with community and route
  useEffect(() => {
    const { currentCommunity } = communityStateValue;

    if (currentCommunity && pathname !== "/" && pathname !== "/communities") {
      // if the user is currently in a community and not on the home page
      setDirectoryState((prev) => ({
        ...prev,
        selectedMenuItem: {
          displayText: currentCommunity?.id,
          link: `community/${currentCommunity?.id}`,
          imageURL: currentCommunity?.imageURL,
          icon: IoPeopleCircleOutline,
          iconColor: { base: "red.500", _dark: "red.400" },
        },
      }));
    } else if (pathname === "/communities") {
      // if the user is on the communities page
      setDirectoryState((prev) => ({
        ...prev,
        selectedMenuItem: {
          displayText: "Communities",
          link: "/communities",
          imageURL: "",
          icon: IoPeopleCircleOutline,
          iconColor: { base: "red.500", _dark: "red.400" },
        },
      }));
    } else if (pathname === "/") {
      setDirectoryState((prev) => ({
        ...prev,
        selectedMenuItem: defaultMenuItem,
      }));
    }
  }, [communityStateValue.currentCommunity, pathname]);

  return { directoryState, toggleMenuOpen, setDirectoryOpen, onSelectMenuItem };
};
export default useDirectory;
