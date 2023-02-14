import { auth } from "@/firebase/clientApp";
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
 * @returns navbar component
 * @requires ./RightContent - content displaying authentication buttons or actions
 * @requires ./SearchInput - Search field
 * @requires ./Directory - showing community menu button
 */
const Navbar: React.FC = () => {
  const [user, loading, error] = useAuthState(auth); // will be passed to child components
  return (
    <Flex
      bg="white"
      height="44px"
      padding="6px 12px"
      justify={{ md: "space-between" }}
    >
      <Flex
        align="center"
        width={{ base: "40px", md: "auto" }}
        mr={{ base: 0, md: 2 }}
      >
        {/* Logo which is always visible */}
        <Image src="/images/logo.svg" height="30px" alt="Website logo" />

        {/* Logo name not visible on mobile */}
        <Image
          src="/images/logo_text.svg"
          height="46px"
          display={{ base: "none", md: "unset" }}
          alt="Website text logo"
        />
      </Flex>
      {/* Community directory only visible when user is logged in */}
      {user && <Directory />}
      <SearchInput user={user} />
      {/* Changes depending on whether user is authenticated or not */}
      <RightContent user={user} />
    </Flex>
  );
};
export default Navbar;
