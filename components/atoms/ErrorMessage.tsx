import {
  Flex,
  AlertContent,
  AlertIndicator,
  AlertRoot,
  Text,
} from "@chakra-ui/react";
import React from "react";

/**
 * @param {boolean} error - Error state
 * @param {string} message - Error message
 */
interface PostItemErrorProps {
  error: boolean;
  message: string;
}

/**
 * Displays an error message. 
 * @param {boolean} error - Error state 
 * @param {string} message - Error message
 * @returns React.FC: post item error component
 */
const PostItemError: React.FC<PostItemErrorProps> = ({ error, message }) => {
  return (
    <>
      {error && (
        <Flex align="center" justifyContent="center">
          <AlertRoot status="error" borderRadius={10} m={2} width="95%">
            <AlertIndicator />
            <AlertContent>
              <Text mr={2} fontWeight={600} color="red.500">
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
