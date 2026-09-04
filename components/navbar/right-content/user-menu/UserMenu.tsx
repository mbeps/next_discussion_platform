import { MenuPositioner, MenuRoot } from "@chakra-ui/react";
import type { User } from "firebase/auth";
import type React from "react";
import { useState } from "react";
import ProfileModal from "@/components/modal/profile/ProfileModal";
import UserMenuButton from "./UserMenuButton";
import UserMenuList from "./UserMenuList";

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

  return (
    <>
      <ProfileModal
        open={isProfileModalOpen}
        handleClose={() => setProfileModalOpen(false)}
      />

      <MenuRoot
        open={isMenuOpen}
        onOpenChange={({ open }: { open: boolean }) => setIsMenuOpen(open)}
      >
        <UserMenuButton user={user} isMenuOpen={isMenuOpen} />
        <MenuPositioner>
          <UserMenuList user={user} setProfileModalOpen={setProfileModalOpen} />
        </MenuPositioner>
      </MenuRoot>
    </>
  );
};

export default UserMenu;
