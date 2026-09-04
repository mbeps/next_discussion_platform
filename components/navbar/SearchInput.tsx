import {
  Button,
  Flex,
  Icon,
  Input,
  InputGroup,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import type React from "react";
import { useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import SearchModal from "./SearchModal";

/**
 * A search trigger component for the navbar that adapts its UI based on screen size.
 * On mobile, it displays as a button; on desktop, it shows a full-width search box.
 * @returns A search control that opens the global search modal.
 */
const SearchInput: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const onOpen = () => setIsModalOpen(true);
  const onClose = () => setIsModalOpen(false);

  return (
    // flexGrow uses the remaining space in the navbar
    // navbar limit is 600px when the user is logged in and automatic when not logged in
    <Flex flexGrow={1} maxWidth="auto" mr={2} align="center">
      {isMobile ? (
        <Button variant={"action" as any} onClick={onOpen}>
          <Icon as={AiOutlineSearch} fontSize={16} />
          <Text ml={2}>Search</Text>
        </Button>
      ) : (
        <SearchBox onClick={onOpen} />
      )}
      <SearchModal isOpen={isModalOpen} onClose={onClose} />
    </Flex>
  );
};
export default SearchInput;

/**
 * Read-only search input that opens the modal on click.
 * @param onClick - Handler to open the search modal.
 * @returns Input group styled for the navbar.
 */
const SearchBox: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <InputGroup
      startElement={
        <Icon as={AiOutlineSearch} color="gray.400" fontSize={16} />
      }
      startElementProps={{ pointerEvents: "none" }}
      onClick={onClick}
      cursor="pointer"
      width="100%"
    >
      <Input
        placeholder="Search"
        fontSize="10pt"
        _placeholder={{ color: { base: "gray.500", _dark: "gray.400" } }}
        _hover={{
          bg: { base: "white", _dark: "gray.700" },
          border: "1px solid",
          borderColor: { base: "red.500", _dark: "red.400" },
        }}
        _focus={{
          outline: "none",
          border: "1px solid",
          borderColor: { base: "red.500", _dark: "red.400" },
        }}
        height="40px"
        bg={{ base: "gray.100", _dark: "gray.800" }}
        borderColor={{ base: "gray.200", _dark: "gray.600" }}
        borderRadius={10}
        readOnly
      />
    </InputGroup>
  );
};
