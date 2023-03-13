import { defaultMenuItem } from "@/atoms/directoryMenuAtom";
import { auth } from "@/firebase/clientApp";
import useDirectory from "@/hooks/useDirectory";
import { Flex, Image } from "@chakra-ui/react";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Directory from "./Directory/Directory";
import RightContent from "./RightContent/RightContent";
import SearchInput from "./SearchInput";

/**
 * Creates a navbar component which contains the following elements:
 *
 * 	- Logo which is visible on mobile and desktop sizes
 * 	- Logo name which is visible only on desktop sizes
 * 	- Search bar which is visible on mobile and desktop sizes and resizes dynamically
 *  - Directory of communities that the user is subscribed to (only displayed when authenticated)
 *
 *
 * Navbar changes depending on whether the user is authenticated.
 * If the user is authenticated, it will display the:
 *  - User menu with name or username
 *  - Buttons (create post, notifications, messages, etc)
 *  - Community directory menu which would display all the subscribed communities and create community option
 *
 * If the user is not authenticated, it will display the:
 *  - Authentication buttons (log in and sing up)
 *  - User menu with different options
 * @returns {React.FC} - Navbar component
 *
 * @requires ./RightContent - content displaying authentication buttons or actions
 * @requires ./SearchInput - Search field
 * @requires ./Directory - showing community menu button
 */
const Navbar: React.FC = () => {
  const [user, loading, error] = useAuthState(auth); // will be passed to child components
  const { onSelectMenuItem } = useDirectory();

  return (
    <Flex
      bg="white"
      height="50px"
      padding="6px 10px"
      justify={{ md: "space-between" }}
      position="sticky"
      top="4px"
      zIndex="999"
      // Rounded props
      border="1px solid"
      borderColor="gray.300"
      borderRadius={10}
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
        <Image
          src="/images/logo_text.svg"
          height="30px"
          display={{ base: "none", md: "unset" }}
          alt="Website text logo"
        />
      </Flex>
      {/* Community directory only visible when user is logged in */}
      {user && <Directory />}
      <SearchInput />
      {/* Changes depending on whether user is authenticated or not */}
      <RightContent user={user} />
    </Flex>
  );
};
export default Navbar;
