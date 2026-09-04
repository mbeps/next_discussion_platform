import { Box, Stack } from "@chakra-ui/react";
import type React from "react";
import {
  useSignInWithGithub,
  useSignInWithGoogle,
} from "react-firebase-hooks/auth";
import { auth } from "../../../../firebase/clientApp";
import AuthButton from "./AuthButton";
import AuthenticationErrorMessage from "./ErrorMessage";

/**
 * Displays third party authentication providers, in this case Google and GitHub.
 * When a provider is clicked:
 *  - A new account is created if the user does not already exist
 *  - Logs in if it is an existing user
 *  - An error is displayed if the user already exist with a different provider.
 * @returns {React.FC} - OAuthButtons component
 *
 * @see https://github.com/CSFrequency/react-firebase-hooks/tree/master/auth
 */
const OAuthButtons: React.FC = () => {
  const [signInWithGoogle, _userGoogle, loadingGoogle, errorGoogle] =
    useSignInWithGoogle(auth);
  const [signInWithGithub, _userGitHub, loadingGitHub, errorGitHub] =
    useSignInWithGithub(auth);

  return (
    <Box width="100%">
      <Stack direction="row" gap={2} width="100%" mb={1.5} mt={2}>
        {/* Google */}
        <AuthButton
          provider="Google"
          loading={loadingGoogle}
          onClick={() => signInWithGoogle()}
          image="/images/google.png"
        />

        {/* GitHub */}
        <AuthButton
          provider="GitHub"
          loading={loadingGitHub}
          onClick={() => signInWithGithub()}
          image="/images/github.png"
        />
      </Stack>

      {/* If there is error than the error is shown */}
      <AuthenticationErrorMessage error={errorGoogle} />
      <AuthenticationErrorMessage error={errorGitHub} />
    </Box>
  );
};

export default OAuthButtons;
