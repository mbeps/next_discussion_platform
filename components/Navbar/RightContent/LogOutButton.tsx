import { auth } from "@/firebase/clientApp";
import { Button } from "@chakra-ui/react";
import { signOut } from "firebase/auth";
import React from "react";

/**
 * Displays a log out button which signs out the currently logged in user.
 * @returns {React.FC} - Log out button
 */
const LogOutButton: React.FC = () => {
  return (
    <Button
      height="28px"
      display={{ base: "none", md: "flex" }} // on mobile, this button is not displayed
      width={{ base: "70px", md: "110px" }} // on mobile the width is 70px, on desktop 110px
      mr={2}
      ml={2}
      onClick={() => signOut(auth)}
    >
      Log Out
    </Button>
  );
};
export default LogOutButton;
