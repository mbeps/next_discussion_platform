import { Button, Flex, Image, Text } from "@chakra-ui/react";
import React from "react";

const OAuthButtons: React.FC = ({}) => {

  return (
    <Flex direction="column" width="100%" mb={2} mt={2}>
      {/* Google */}
      <Button
        variant="oauth"
        mb={2}
        isLoading={false}
        onClick={() => {}}
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
        isLoading={false}
        onClick={() => {}}
      >
        <Image
          src="/images/github.png"
          alt="Continue with GitHub"
          mr={2}
          height="20px"
        />
        GitHub
      </Button>
    </Flex>
  );
};

export default OAuthButtons;