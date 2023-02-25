import { Button, Flex, Image, Stack, Text } from "@chakra-ui/react";
import { FirebaseError } from "@firebase/app";
import { AuthError, User } from "firebase/auth";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  useSignInWithGoogle,
  useSignInWithGithub,
} from "react-firebase-hooks/auth";
import { auth, firestore } from "../../../firebase/clientApp";
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
    <Stack direction="column" spacing={1} width="100%" mb={2} mt={2}>
      {/* Google */}

      <AuthButton
        provider="Google"
        isLoading={loadingGoogle}
        onClick={() => signInWithGoogle()}
        image="/images/google.png"
      />

      {/* GitHub */}
      <AuthButton
        provider="GitHub"
        isLoading={loadingGitHub}
        onClick={() => signInWithGithub()}
        image="/images/github.png"
      />

      {/* If there is error than the error is shown */}
      <>
        <ErrorMessage error={errorGoogle} />
        <ErrorMessage error={errorGitHub} />
      </>
    </Stack>
  );
};

export default OAuthButtons;

interface AuthButtonProps {
  provider: string;
  isLoading: boolean;
  onClick: () => void;
  image: string;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  provider,
  isLoading,
  onClick,
  image,
}) => {
  return (
    <Button
      flexGrow={1}
      variant="oauth"
      mb={2}
      isLoading={isLoading}
      onClick={onClick}
    >
      <Image
        src={image}
        alt={`Continue with ${provider}`}
        mr={2}
        height="20px"
      />
      {provider}
    </Button>
  );
};

interface ErrorMessageProps {
  error: AuthError | undefined;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  return error ? (
    <Text textAlign="center" color="red" fontSize="10pt" fontWeight="800">
      {FIREBASE_ERRORS[error.message as keyof typeof FIREBASE_ERRORS]}
    </Text>
  ) : null;
};
