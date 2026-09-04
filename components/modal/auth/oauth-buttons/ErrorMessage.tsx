import { Text } from "@chakra-ui/react";
import type { AuthError } from "firebase/auth";
import type React from "react";
import { FIREBASE_ERRORS } from "@/firebase/errors";

interface ErrorMessageProps {
  error: AuthError | undefined;
}

/**
 * Maps Firebase auth errors to friendly strings in the OAuth block.
 * @param error - Firebase auth error from the provider attempt.
 * @returns Text element when an error exists, otherwise null.
 */
const AuthenticationErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  if (!error) return null;
  const message =
    FIREBASE_ERRORS[error.code as keyof typeof FIREBASE_ERRORS] ||
    error.message;
  return (
    <Text textAlign="center" color="red" fontSize="10pt" fontWeight="800">
      {message}
    </Text>
  );
};

export default AuthenticationErrorMessage;
