import { SearchIcon } from "@chakra-ui/icons";
import { Flex, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import React from "react";

type SearchInputProps = {
  // user:
};

const SearchInput: React.FC<SearchInputProps> = () => {
  return (
    // flexGrow uses the remaining space in the navbar
    <Flex flexGrow={1} mr={2} align='center'>
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
          children={<SearchIcon color="gray.400" mb={1} />}
        />
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
          height="34px"
          //todo: make height automatic based on the height of the navbar
          bg="gray.100"
        />
      </InputGroup>
    </Flex>
  );
};
export default SearchInput;
