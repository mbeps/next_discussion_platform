import { Button } from "@chakra-ui/react";
import React from "react";
import { useSetRecoilState } from "recoil";

const AuthButtons: React.FC = () => {
  return (
    <>
      <Button
        variant="outline"
        height="28px"
        display={{ base: "none", md: "flex" }} // on mobile, this button is not displayed
        width={{ base: "70px", md: "110px" }} // on mobile the width is 70px, on desktop 110px
        mr={2}
        ml={2} 
      >
        Log In
      </Button>
      <Button
        height="28px"
        display={{ base: "none", md: "flex" }} // on mobile, this button is not displayed
        width={{ base: "70px", md: "110px" }} // on mobile the width is 70px, on desktop 110px
        mr={2} // margin right
      >
        Sign Up
      </Button>
    </>
  );
};
export default AuthButtons;
