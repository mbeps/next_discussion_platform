import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuItem,
  Icon,
  Flex,
  MenuDivider,
  Text,
  Stack,
} from "@chakra-ui/react";
import { signOut, User } from "firebase/auth";
import React from "react";
import { MdAccountCircle } from "react-icons/md";
import { VscAccount } from "react-icons/vsc";
import { IoSparkles } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { MdOutlineLogin } from "react-icons/md";
import { auth } from "@/firebase/clientApp";
import { useResetRecoilState, useSetRecoilState } from "recoil";
import { authModalState } from "@/atoms/authModalAtom";
import { communityState } from "@/atoms/communitiesAtom";
import CustomMenuButton from "@/components/Menu/CustomMenuButton";

type UserMenuProps = {
  user?: User | null;
};

/**
 * User menu which has a button to show menu options.
 * Both the button and the options change depending on the authentication status of the user.
 * If the user is authenticated:
 *  - Menu button will display:
 *      - User icon
 *      - User name
 *  - Menu options will display:
 *      - Profile option
 *      - Log out option
 *
 * If the user is unauthenticated:
 *  - Menu button will display:
 *      - Generic user icon
 *      - Log in or sign up option
 * @param {user} - User
 * @returns React user menu component
 */
const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
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
    <Menu>
      {/* Actual menu button that opens the menu of options */}
      <MenuButton
        cursor="pointer"
        height="100%"
        padding="0px 6px"
        borderRadius={4}
        _hover={{
          outline: "1px solid",
          outlineColor: "gray.200",
        }}
      >
        <Flex align="center">
          <Flex align="center">
            {user ? (
              // If user is logged in
              <>
                <Icon
                  fontSize={24}
                  mr={1}
                  color="gray.300"
                  as={MdAccountCircle}
                />

                <Flex
                  direction="column"
                  display={{ base: "none", lg: "flex" }}
                  fontSize="8pt"
                  align="flex-start"
                  mr={2}
                >
                  <Text fontWeight={700}>
                    {/* Displays name and surname if available or generates username from email (name before `@`) */}
                    {user?.displayName || user.email?.split("@")[0]}
                  </Text>
                  {/* <Flex>
                    <Icon as={IoSparkles} color='brand.100' mr={1}/>
                    <Text color='gray.400'>1 KARMA</Text>
                  </Flex> */}
                </Flex>
              </>
            ) : (
              // If user is not logged in
              <Icon fontSize={24} color="gray.400" mr={1} as={VscAccount} />
            )}
          </Flex>
          <ChevronDownIcon />
        </Flex>
      </MenuButton>
      <MenuList borderRadius={10} mt={2}>
        <Flex justifyContent="center">
          <Stack spacing={1} width="95%">
            {user ? (
              // If the user is logged in
              <>
                {/* Profile option */}
                <CustomMenuButton
                  icon={<CgProfile />}
                  text="Profile"
                  onClick={() => console.log("Profile clicked")}
                />

                <CustomMenuButton
                  icon={<MdOutlineLogin />}
                  text="Log Out"
                  onClick={logout}
                />
              </>
            ) : (
              // If user is not logged in
              <>
                {/* Log out button */}
                <CustomMenuButton
                  icon={<MdOutlineLogin />}
                  text="Log In / Sign Up"
                  onClick={() =>
                    setAuthModalState({ open: true, view: "login" })
                  }
                />
              </>
            )}
          </Stack>
        </Flex>
      </MenuList>
    </Menu>
  );
};
export default UserMenu;
