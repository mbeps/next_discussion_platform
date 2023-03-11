import { SearchIcon } from "@chakra-ui/icons";
import { Flex, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { User } from "firebase/auth";
import React from "react";

/**
 * Search bar which would allow the user to carry out searches on the site.
 * Search bar dynamically resizes depending on the screen size.
 * It will use all the available space of the parent component (navbar).
 * @returns {React.FC} - Search bar
 *
 * @see https://chakra-ui.com/docs/components/input/usage
 */
const SearchInput: React.FC = () => {
  return (
    // flexGrow uses the remaining space in the navbar
    // navbar limit is 600px when the user is logged in and automatic when not logged in
    <Flex flexGrow={1} maxWidth="auto" mr={2} align="center">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>

        <Input
          placeholder="Search"
          fontSize="10pt"
          _placeholder={{ color: "gray.500" }}
          _hover={{
            bg: "white",
            border: "1px solid",
            borderColor: "red.500",
          }}
          _focus={{
            outline: "none",
            border: "1px solid",
            borderColor: "red.500",
          }}
          height="40px"
          bg="gray.100"
          borderRadius={10}
        />
      </InputGroup>
    </Flex>
  );
};
export default SearchInput;
