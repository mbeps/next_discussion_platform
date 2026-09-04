import { Flex, Spinner } from "@chakra-ui/react";
import type { User } from "firebase/auth";
import type React from "react";
import AuthModal from "@/components/modal/auth/AuthModal";
import SavedPostsModal from "@/components/modal/saved-posts/SavedPostsModal";
import AuthButtons from "./AuthButtons";
import Icons from "./Icons";
import UserMenu from "./user-menu/UserMenu";

type RightContentProps = {
  user?: User | null;
  loading?: boolean;
};

/**
 * Right content is a section of the navbar which dynamically adjusts based on state.
 * If the user is not authenticated, the right content will display log in and sign up buttons.
 * If the user is authenticated, the right content will display:
 *  - Create post button
 *  - GitHub project button
 * The user menu is always displayed but it changes depending on the authentication status of the user.
 * @param {User | null} user - User object from Firebase to determine whether user is authenticated
 * @param {boolean} loading - Whether the authentication state is loading
 *
 * @returns {React.FC} - Right content of the navbar
 *
 * @requires ./AuthButtons - log in and sign up buttons
 * @requires ./UserMenu - user menu which changed depending on whether user is authenticated
 * @requires ./AuthModal - authentication modal which is closed by default
 */
const RightContent: React.FC<RightContentProps> = ({ user, loading }) => {
  return (
    <>
      <AuthModal />
      <SavedPostsModal />
      <Flex justify="center" align="center">
        {/* If user is logged in, icons are shown
        If user is not logged in, authentication buttons are shown */}
        {loading ? (
          <Spinner size="sm" m={2} />
        ) : user ? (
          <Icons />
        ) : (
          <AuthButtons />
        )}
        <UserMenu user={user} />
      </Flex>
    </>
  );
};
export default RightContent;
