import { authModalState } from "@/atoms/authModalAtom";
import { Flex } from "@chakra-ui/react";
import React from "react";
import { useRecoilValue } from "recoil";
import Login from "./Login";
import Signup from "./Signup";

type AuthInputsProps = {};

/**
 * Checks what the current view of the authentication modal state is.
 * If the state is `login`, the the modal will display the log in view.
 * If the state is `signup`, the modal will display the sign up view.
 * @returns  {React.FC} - authentication modal which has 2 different views
 *
 * @requires ./Login - log in view
 * @requires ./Signup - sign up view
 */
const AuthInputs: React.FC<AuthInputsProps> = () => {
  const modalState = useRecoilValue(authModalState);

  return (
    <Flex direction="column" align="center" width="100%" mt={4}>
      {modalState.view === "login" && <Login />}
      {modalState.view === "signup" && <Signup />}
    </Flex>
  );
};
export default AuthInputs;
