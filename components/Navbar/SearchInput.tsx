import { SearchIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import React from "react";
import { AiOutlineSearch } from "react-icons/ai";

/**
 * Search bar which would allow the user to carry out searches on the site.
 * Search bar dynamically resizes depending on the screen size.
 * It will use all the available space of the parent component (navbar).
 * On mobile screen sizes, the search bar will be displayed as a button which will open a popover.
 * On desktop screen sizes, the search bar will be displayed as a normal input.
 * @returns {React.FC} - Search bar
 *
 * @see https://chakra-ui.com/docs/components/input/usage
 */
const SearchInput: React.FC = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    // flexGrow uses the remaining space in the navbar
    // navbar limit is 600px when the user is logged in and automatic when not logged in
    <Flex flexGrow={1} maxWidth="auto" mr={2} align="center">
      {isMobile && (
        <Popover>
          <PopoverTrigger>
            <Button variant="action">
              <Icon as={AiOutlineSearch} fontSize={16} />
              <Text ml={2}>Search</Text>
            </Button>
          </PopoverTrigger>
          <Portal>
            <PopoverContent borderRadius={10} mt={2}>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody>
                <SearchBox />
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
      )}
      {!isMobile && <SearchBox />}
    </Flex>
  );
};
export default SearchInput;

/**
 * Displays an input field for the search bar.
 * @returns {React.FC} - Search bar
 */
const SearchBox: React.FC = () => {
  return (
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
  );
};
