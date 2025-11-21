/* eslint-disable react-hooks/exhaustive-deps */
import { authModalState } from "@/atoms/authModalAtom";
import { auth } from "@/firebase/clientApp";
import {
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  Flex,
  Separator,
  Text,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState } from "recoil";
import AuthInputs from "./AuthInputs";
import OAuthButtons from "./OAuthButtons";
import ResetPassword from "./ResetPassword";

/**
 * Displays an authentication modal while `open` is `true`.
 * If the `open` is `false`, then the modal is closed.
 * The modal has 3 different views as described by `authModalAtom`:
 *  - `login`: displays the log in view
 *  - `signup`: displays the signup view
 *  - `resetPassword`: displays the reset password view
 *
 * If the user is trying to log in or sign up,
 *  Third party authentication providers are displayed and
 *  sign up or log in forms are displayed.
 * If the user is resetting the password,
 *  only the reset password elements are shown and
 *  Third party authentication providers and log in or sign up forms are not displayed.
 * @returns {React.FC} - authentication modal which has 3 different views
 *
 * @requires ./AuthInputs - display correct form depending on `login` or `signup` state
 * @requires ./OAuthButtons - third party authentication providers such as Google or GitHub
 * @requires ./ResetPassword - display reset password view
 *
 * @see https://chakra-ui.com/docs/components/modal/usage
 */
const AuthModal: React.FC = () => {
  const [modalState, setModalState] = useRecoilState(authModalState);
  /**
   * Keeps track of whether a user is authenticated via Firebase.
   * It returns the `user` details, if it fails then `null` is stored.
   * While communicating with Firebase, `loading` (boolean) is set to `true` and
   * once the communication is complete it is set to `false`.
   * `error` is null until an error takes place while communicating with Firebase.
   */
  const [user, loading, error] = useAuthState(auth);

  /**
   * If a user is authenticated, the modal will automatically close.
   * This is used after signing up or logging in as once the user is authenticated,
   * the modal does not need to be open.
   */
  useEffect(() => {
    if (user) handleClose();
  }, [user]);

  /**
   * Closes the authentication modal by setting its state to `open` state to false.
   */
  const handleClose = () => {
    setModalState((prev) => ({
      ...prev,
      open: false,
    }));
  };
  return (
    <DialogRoot
      open={modalState.open}
      onOpenChange={({ open }: { open: boolean }) => {
        if (!open) handleClose();
      }}
    >
      <DialogBackdrop
        bg="rgba(0, 0, 0, 0.4)"
        backdropFilter="blur(6px)"
      />
      <DialogPositioner>
        <DialogContent borderRadius={10}>
          <DialogHeader textAlign="center">
            <DialogTitle>
              {modalState.view === "login" && "Login"}
              {modalState.view === "signup" && "Sign Up"}
              {modalState.view === "resetPassword" && "Reset Password"}
            </DialogTitle>
          </DialogHeader>

          <DialogCloseTrigger position="absolute" top={2} right={2} />

          <DialogBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            pb={6}
          >
            <Flex
              direction="column"
              align="center"
              justify="center"
              width="75%"
            >
              {/* If user is trying to authenticate (log in or sign up) */}
              {modalState.view === "login" || modalState.view === "signup" ? (
                <>
                  <OAuthButtons />
                  {/* <Text color='gray.500' fontWeight={700}>OR</Text> */}
                  <Separator />
                  <AuthInputs />
                </>
              ) : (
                // If user is trying to reset password
                <ResetPassword />
              )}
            </Flex>
          </DialogBody>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};
export default AuthModal;
