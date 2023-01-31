import { Button, Flex, Image, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import {
  useSignInWithGoogle,
  useSignInWithGithub,
} from "react-firebase-hooks/auth";
import { auth } from "../../../firebase/clientApp";
import { FIREBASE_ERRORS } from "../../../firebase/errors";

/**
 * Displays third party authentication providers, in this case Google and GitHub. 
 * When a provider is clicked:
 *  - A new account is created if the user does not already exist
 *  - Signed in if it is an existing user
 *  - An error is displayed if the user already exist with a different provider. 
 * @returns 
 * @see https://github.com/CSFrequency/react-firebase-hooks/tree/master/auth
 */
const OAuthButtons: React.FC = ({}) => {
  const [signInWithGoogle, userGoogle, loadingGoogle, errorGoogle] =
    useSignInWithGoogle(auth);
  const [signInWithGithub, userGitHub, loadingGitHub, errorGitHub] =
    useSignInWithGithub(auth);

  return (
    <Flex direction="column" width="100%" mb={2} mt={2}>
      {/* Google */}
      <Button
        variant="oauth"
        mb={2}
        isLoading={loadingGoogle}
        onClick={() => signInWithGoogle()}
      >
        <Image
          src="/images/google.png"
          alt="Continue with Google"
          mr={2}
          height="20px"
        />
        Google
      </Button>

      {/* GitHub */}
      <Button
        variant="oauth"
        mb={2}
        isLoading={loadingGitHub}
        onClick={() => signInWithGithub()}
      >
        <Image
          src="/images/github.png"
          alt="Continue with GitHub"
          mr={2}
          height="20px"
        />
        GitHub
      </Button>

      {/* If there is error than the error is shown */}
      {errorGoogle && <Text textAlign="center" color="red" fontSize="10pt" fontWeight="800">{FIREBASE_ERRORS[errorGoogle?.message as keyof typeof FIREBASE_ERRORS]}</Text>}
      {errorGitHub && <Text textAlign="center" color="red" fontSize="10pt" fontWeight="800">{FIREBASE_ERRORS[errorGitHub?.message as keyof typeof FIREBASE_ERRORS]}</Text>}
    </Flex>
  );
};

export default OAuthButtons;
