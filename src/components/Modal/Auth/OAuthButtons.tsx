import { Box, Button, Image, Stack, Text } from "@chakra-ui/react";
import { AuthError } from "firebase/auth";
import React from "react";
import {
  useSignInWithGithub,
  useSignInWithGoogle,
  useSignInWithMicrosoft,
} from "react-firebase-hooks/auth";
import { auth } from "../../../firebase/clientApp";
import { FIREBASE_ERRORS } from "../../../firebase/errors";

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
  const [signInWithGoogle, userGoogle, loadingGoogle, errorGoogle] =
    useSignInWithGoogle(auth);
  const [signInWithGithub, userGitHub, loadingGitHub, errorGitHub] =
    useSignInWithGithub(auth);

  return (
    <Box width="100%">
      <Stack direction="row" spacing={2} width="100%" mb={1.5} mt={2}>
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
      </Stack>

      {/* If there is error than the error is shown */}
      <>
        <ErrorMessage error={errorGoogle} />
        <ErrorMessage error={errorGitHub} />
      </>
    </Box>
  );
};

export default OAuthButtons;

/**
 * @param {string} provider - The name of the provider
 * @param {boolean} isLoading - Whether the button is loading or not
 * @param {() => void} onClick - The function to execute when the button is clicked
 * @param {string} image - The image to display
 */
interface AuthButtonProps {
  provider: string;
  isLoading: boolean;
  onClick: () => void;
  image: string;
}

/**
 * Displays an authentication button for a third party provider.
 * The button displays:
 * - The provider's logo
 * - The provider's name
 * @param {string} provider - The name of the provider
 * @param {boolean} isLoading - Whether the button is loading or not
 * @param {() => void} onClick - The function to execute when the button is clicked
 * @param {string} image - The image to display
 *
 * @returns {React.FC} - AuthButton component
 */
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
      isLoading={isLoading}
      onClick={onClick}
      width="50%"
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

/**
 * @param {AuthError | undefined} error - The error to display
 */
interface ErrorMessageProps {
  error: AuthError | undefined;
}

/**
 * Displays an error message if there is an error.
 * @param {AuthError | undefined} error - The error to display
 *
 * @returns {React.FC} - ErrorMessage component
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  return error ? (
    <Text textAlign="center" color="red" fontSize="10pt" fontWeight="800">
      {FIREBASE_ERRORS[error.message as keyof typeof FIREBASE_ERRORS]}
    </Text>
  ) : null;
};
