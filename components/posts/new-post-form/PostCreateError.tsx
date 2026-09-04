import {
  AlertContent,
  AlertIndicator,
  AlertRoot,
  Text,
} from "@chakra-ui/react";
import type React from "react";

type Props = {
  error: boolean;
};

/**
 * Error alert shown when post creation fails.
 * @param error - Whether to render the alert.
 * @returns Alert component or null.
 */
const PostCreateError: React.FC<Props> = ({ error }) => {
  return (
    <>
      {error && (
        <AlertRoot status="error" borderRadius={10} p={2} mt={2}>
          <AlertIndicator />
          <AlertContent>
            <Text mr={2} fontWeight={600} color="red.500">
              There has been an error when creating your post
            </Text>
          </AlertContent>
        </AlertRoot>
      )}
    </>
  );
};

export default PostCreateError;
