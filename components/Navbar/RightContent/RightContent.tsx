import AuthModal from "@/components/Modal/Auth/AuthModal";
import { Flex } from "@chakra-ui/react";
import { User } from "firebase/auth";
import React from "react";
import AuthButtons from "./AuthButtons";
import Icons from "./Icons";
import LogOutButton from "./LogOutButton";
import UserMenu from "./UserMenu";

type RightContentProps = {
  user?: User | null;
};

/**
 * Right content is a section of the navbar which dynamically adjusts based on state.
 * If the user is not authenticated, the right content will display log in and sign up buttons.
 * If the user is authenticated, the right content will display:
 *  - Create post button
 *  - GitHub project button
 * The user menu is always displayed but it changes depending on the authentication status of the user.
 * @param {User | null} user - User object from Firebase to determine whether user is authenticated
 *
 * @returns {React.FC} - Right content of the navbar
 *
 * @requires ./AuthButtons - log in and sign up buttons
 * @requires ./UserMenu - user menu which changed depending on whether user is authenticated
 * @requires ./AuthModal - authentication modal which is closed by default
 */
const RightContent: React.FC<RightContentProps> = ({ user }) => {
  return (
    <>
      <AuthModal />
      <Flex justify="center" align="center">
        {/* If user is logged in, icons are shown
        If user is not logged in, authentication buttons are shown */}
        {user ? <Icons /> : <AuthButtons />}
        <UserMenu user={user} />
      </Flex>
    </>
  );
};
export default RightContent;
