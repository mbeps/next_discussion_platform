import { authModalState } from "@/atoms/authModalAtom";
import CustomMenuButton from "@/components/atoms/CustomMenuButton";
import ProfileModal from "@/components/Modal/Profile/ProfileModal";
import { auth } from "@/firebase/clientApp";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import {
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  Stack,
  Text,
  Image,
} from "@chakra-ui/react";
import { signOut, User } from "firebase/auth";
import React, { useState } from "react";
import { CgProfile } from "react-icons/cg";
import { MdAccountCircle, MdOutlineLogin } from "react-icons/md";
import { VscAccount } from "react-icons/vsc";
import { useSetRecoilState } from "recoil";

/**
 * @param {User | null} user - user currently logged in if any
 */
type UserMenuProps = {
  user?: User | null;
};

/**
 * User menu which has a button to show menu options.
 * Both the button and the options change depending on the authentication status of the user.
 * If the user is authenticated:
 *  - Menu button will display:
 *    - User icon
 *    - User name
 *  - Menu options will display:
 *    - Profile option
 *    - Log out option
 *
 * If the user is unauthenticated:
 *  - Menu button will display:
 *    - Generic user icon
 *    - Log in or sign up option
 * @param {User | null} user - user currently logged in if any
 *
 * @returns React user menu component
 *
 * @requires UserMenuButton - button which changes depending on the authentication status of the user
 * @requires UserMenuList - list of menu options which changes depending on the authentication status of the user
 */
const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  /**
   * Toggles the menu open and closed.
   */
  const toggle = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(true);
    }
  };

  return (
    <>
      <ProfileModal
        open={isProfileModalOpen}
        handleClose={() => setProfileModalOpen(false)}
      />

      <Menu isOpen={isMenuOpen} onOpen={toggle} onClose={toggle}>
        <UserMenuButton user={user} isMenuOpen={isMenuOpen} />
        <UserMenuList user={user} setProfileModalOpen={setProfileModalOpen} />
      </Menu>
    </>
  );
};
export default UserMenu;

/**
 * @param {User | null | undefined} user - user currently logged in if any
 * @param {boolean} isMenuOpen - whether the menu is open or not
 */
interface UserMenuButtonProps {
  user: User | null | undefined;
  isMenuOpen: boolean;
}

/**
 * Menu button which changes depending on the authentication status of the user.
 * The button is responsive:
 *  - Only icon is shown on mobile
 *  - Both icon and user name are shown on desktop
 *
 * If the user is authenticated, the button will display:
 *  - User icon
 *  - User name
 * If the user is unauthenticated, the button will display:
 *  - Generic user icon
 *  - If the user has a profile photo, the photo will be displayed
 * @param {User | null | undefined} user - user currently logged in if any
 * @param {boolean} isMenuOpen - whether the menu is open or not
 *
 * @returns {React.FC} - user menu button
 */
const UserMenuButton: React.FC<UserMenuButtonProps> = ({
  user,
  isMenuOpen,
}) => (
  <MenuButton
    cursor="pointer"
    height="100%"
    padding="0px 6px"
    borderRadius={10}
    _hover={{
      outline: "1px solid",
      outlineColor: "gray.200",
    }}
    maxWidth="150px"
  >
    <Flex align="center">
      {user ? (
        // If user is authenticated, display user icon and name
        <>
          {user.photoURL ? (
            <>
              <Image
                src={user.photoURL}
                alt="User Profile Photo"
                height="30px"
                borderRadius="full"
                mr={1}
              />
            </>
          ) : (
            <>
              <Icon
                fontSize={30}
                mr={1}
                color="gray.300"
                as={MdAccountCircle}
              />
            </>
          )}

          <Flex
            direction="column"
            display={{ base: "none", lg: "flex" }}
            fontSize="8pt"
            align="flex-start"
            mr={2}
          >
            <Text fontWeight={700}>
              {user?.displayName || user.email?.split("@")[0]}
            </Text>
          </Flex>
        </>
      ) : (
        // If user is unauthenticated, display generic user icon
        <Icon fontSize={24} color="gray.400" mr={1} as={VscAccount} />
      )}
      {isMenuOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
    </Flex>
  </MenuButton>
);

/**
 * @param {User} user - current user
 */
interface UserMenuListProps {
  user: User | null | undefined;
  setProfileModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  //todo pass open profile modal function
}

/**
 * Menu entries for the user menu.
 * If the user is authenticated, menu entries will be:
 *    - Profile
 *    - Log out
 * If the user is unauthenticated, menu entries will be:
 *    - Log in / Sign up
 * @param {User} user - current user
 *
 * @returns {React.FC} - user menu entries
 *
 * @requires CustomMenuButton
 */
const UserMenuList: React.FC<UserMenuListProps> = ({
  user,
  setProfileModalOpen,
}) => {
  const setAuthModalState = useSetRecoilState(authModalState);

  /**
   * Signs the user out of the app.
   * Once logged out, the state of the current logged in user is cleared globally.
   * This means that the community state is also reset updating the UI.
   */
  const logout = async () => {
    await signOut(auth);
    // clear community state so that after logging out the button subscribe button resets
  };

  return (
    <MenuList borderRadius={10} mt={2} shadow="lg">
      <Flex justifyContent="center">
        <Stack spacing={1} width="95%">
          {user ? (
            <>
              <CustomMenuButton
                icon={<CgProfile />}
                text="Profile"
                onClick={() => setProfileModalOpen(true)}
              />

              <CustomMenuButton
                icon={<MdOutlineLogin />}
                text="Log Out"
                onClick={logout}
              />
            </>
          ) : (
            <>
              <CustomMenuButton
                icon={<MdOutlineLogin />}
                text="Log In / Sign Up"
                onClick={() => setAuthModalState({ open: true, view: "login" })}
              />
            </>
          )}
        </Stack>
      </Flex>
    </MenuList>
  );
};
