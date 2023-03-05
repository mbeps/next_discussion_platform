import { Flex, Alert, AlertIcon, Text } from "@chakra-ui/react";
import React from "react";

interface PostItemErrorProps {
  error: boolean;
  message: string;
}

const PostItemError: React.FC<PostItemErrorProps> = ({ error, message }) => {
  return (
    <>
      {error && (
        <Flex align="center" justifyContent="center">
          <Alert status="error" borderRadius={10} m={2} width="95%">
            <AlertIcon />
            <Text mr={2} fontWeight={600} color="red.500">
              {message}
            </Text>
          </Alert>
        </Flex>
      )}
    </>
  );
};

export default PostItemError;
