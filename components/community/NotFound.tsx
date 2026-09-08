import { Button, Flex, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";
import type React from "react";
import { ROUTES } from "@/constants/routes";

/**
 * Friendly empty state shown when a community id is invalid.
 * @returns Message with links back to home and discovery.
 */
const CommunityNotFound: React.FC = () => {
  return (
    <Flex
      direction="column"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
    >
      <Text
        fontSize="2xl"
        fontWeight="bold"
        color={{ base: "gray.600", _dark: "gray.400" }}
      >
        Sorry, this community does not exist!
      </Text>
      <Stack direction="row" gap={4} mt={4}>
        <Link href={ROUTES.HOME.path}>
          <Button mt={4} width="150px">
            Home
          </Button>
        </Link>
        <Link href={ROUTES.COMMUNITIES.path}>
          <Button mt={4} width="150px">
            All Communities
          </Button>
        </Link>
      </Stack>
    </Flex>
  );
};

export default CommunityNotFound;
