import {
  AlertContent,
  AlertIndicator,
  AlertRoot,
  Flex,
  Text,
} from "@chakra-ui/react";
import type React from "react";

interface PostItemErrorProps {
  error: boolean;
  message: string;
}

/**
 * A reusable error alert component for displaying inline error messages.
 * Typically used within list items or forms to provide feedback on failed operations.
 * @param error - Whether to display the error message.
 * @param message - The error message text to display.
 * @returns An alert component if an error exists, otherwise null.
 */
const PostItemError: React.FC<PostItemErrorProps> = ({ error, message }) => {
  return (
    <>
      {error && (
        <Flex align="center" justifyContent="center">
          <AlertRoot status="error" borderRadius={10} m={2} width="95%">
            <AlertIndicator />
            <AlertContent>
              <Text
                mr={2}
                fontWeight={600}
                color={{ base: "red.500", _dark: "red.400" }}
              >
                {message}
              </Text>
            </AlertContent>
          </AlertRoot>
        </Flex>
      )}
    </>
  );
};

export default PostItemError;
