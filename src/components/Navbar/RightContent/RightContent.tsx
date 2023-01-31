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
 * If the user is authenticated, the right content will display the log out button.
 * @param {user} - to manage state and adjust the UI based on said state
 * @returns
 * @requires ./AuthButtons
 * @requires ./LogOutButton
 */
const RightContent: React.FC<RightContentProps> = ({ user }) => {
  return (
    <>
      <AuthModal />
      <Flex justify="center" align="center">
        {user ? <Icons /> : <AuthButtons />}
      </Flex>
    </>
  );
};
export default RightContent;
