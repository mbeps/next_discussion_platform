import { Flex, Image, Text } from "@chakra-ui/react";
import type React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { defaultMenuItem } from "@/atoms/directoryMenuAtom";
import { auth } from "@/firebase/clientApp";
import useDirectory from "@/hooks/useDirectory";
import Directory from "./directory/Directory";
import RightContent from "./right-content/RightContent";
import SearchInput from "./SearchInput";

/**
 * The primary navigation header for the application.
 * Contains the site logo, community directory (for logged-in users), search input, and user authentication controls.
 * @returns A sticky, responsive navbar component.
 */
const Navbar: React.FC = () => {
  const [user, loading] = useAuthState(auth); // will be passed to child components
  const { onSelectMenuItem } = useDirectory();

  return (
    <Flex
      bg={{ base: "white", _dark: "gray.900" }}
      height="62px"
      padding="10px 12px"
      justify={{ md: "space-between" }}
      position="sticky"
      top="4px"
      zIndex="999"
      // Rounded props
      border="1px solid"
      borderColor={{ base: "gray.300", _dark: "gray.700" }}
      borderRadius="xl"
      m={{ base: 1, md: 1.5 }}
      shadow="lg"
    >
      <Flex
        align="center"
        width={{ base: "40px", md: "auto" }}
        mr={{ base: 0, md: 2 }}
        onClick={() => onSelectMenuItem(defaultMenuItem)}
        cursor="pointer"
      >
        {/* Logo which is always visible */}
        <Image src="/images/logo.svg" height="30px" alt="Website logo" ml={1} />

        {/* Logo name not visible on mobile */}
        <Text
          display={{ base: "none", md: "unset" }}
          fontSize="20pt"
          fontWeight={800}
          ml={2}
        >
          Circus
        </Text>
      </Flex>
      {/* Community directory only visible when user is logged in */}
      {user && <Directory />}
      <SearchInput />
      {/* Changes depending on whether user is authenticated or not */}
      <RightContent user={user} loading={loading} />
    </Flex>
  );
};
export default Navbar;
