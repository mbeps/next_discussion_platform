import { Button, Flex, Link, Stack, Text } from "@chakra-ui/react";
import React from "react";

const PageNotFound: React.FC = () => {
  return (
    <Flex
      direction="column"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
    >
      <Text fontSize="2xl" fontWeight="bold" color="gray.600">
        Sorry, this page does not exist!
      </Text>
      <Stack direction="row" spacing={4} mt={4}>
        <Link href="/">
          <Button mt={4} width="150px">
            Home
          </Button>
        </Link>
        <Link href="/communities">
          <Button mt={4} width="150px">
            All Communities
          </Button>
        </Link>
      </Stack>
    </Flex>
  );
};

export default PageNotFound;
