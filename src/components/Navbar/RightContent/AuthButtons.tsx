import { authModalState } from "@/atoms/authModalAtom";
import { Button } from "@chakra-ui/react";
import React from "react";
import { useSetRecoilState } from "recoil";

/**
 * Displays 2 authentication buttons which open the authentication modal when clicked:
 *  - `Log In`: opens the log in modal
 *  - `Sign Up`: opens the sign up modal
 * @returns {React.FC} - Authentication buttons (log in and sign up)
 */
const AuthButtons: React.FC = () => {
  const setAuthModalState = useSetRecoilState(authModalState); // Set global state
  return (
    <>
      <Button
        variant="outline"
        height="28px"
        display={{ base: "none", md: "flex" }} // on mobile, this button is not displayed
        width={{ base: "70px", md: "110px" }} // on mobile the width is 70px, on desktop 110px
        mr={2}
        ml={2}
        onClick={() => setAuthModalState({ open: true, view: "login" })} // When clicked execute this function, the modal is opened in the log in view
      >
        Log In
      </Button>
      <Button
        height="28px"
        display={{ base: "none", md: "flex" }} // on mobile, this button is not displayed
        width={{ base: "70px", md: "110px" }} // on mobile the width is 70px, on desktop 110px
        mr={2} // margin right
        onClick={() => setAuthModalState({ open: true, view: "signup" })} // When clicked execute this function, the modal is opened in the sign up view
      >
        Sign Up
      </Button>
    </>
  );
};
export default AuthButtons;
