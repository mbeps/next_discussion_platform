import { Flex, Icon, Image, MenuTrigger, Text } from "@chakra-ui/react";
import type { User } from "firebase/auth";
import type React from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { MdAccountCircle } from "react-icons/md";
import { VscAccount } from "react-icons/vsc";

interface UserMenuButtonProps {
  user: User | null | undefined;
  isMenuOpen: boolean;
}

/**
 * Trigger button for the user dropdown showing avatar and name when signed in.
 * @param user - Firebase user or null.
 * @param isMenuOpen - Controls chevron direction for affordance.
 * @returns Menu trigger styled for the navbar.
 */
const UserMenuButton: React.FC<UserMenuButtonProps> = ({
  user,
  isMenuOpen,
}) => (
  <MenuTrigger
    cursor="pointer"
    height="100%"
    padding="0px 6px"
    borderRadius={10}
    _hover={{
      outline: "1px solid",
      outlineColor: { base: "gray.200", _dark: "gray.600" },
    }}
    maxWidth="200px"
  >
    <Flex align="center">
      {user ? (
        <>
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt="User Profile Photo"
              height="36px"
              borderRadius="full"
              mr={1}
            />
          ) : (
            <Icon fontSize={36} mr={1} color="gray.300" as={MdAccountCircle} />
          )}

          <Flex
            direction="column"
            display={{ base: "none", lg: "flex" }}
            fontSize="10pt"
            align="flex-start"
            mr={2}
          >
            <Text fontWeight={700} whiteSpace="normal" wordBreak="break-word">
              {user?.displayName || user.email?.split("@")[0]}
            </Text>
          </Flex>
        </>
      ) : (
        <Icon fontSize={24} color="gray.400" mr={1} as={VscAccount} />
      )}
      {isMenuOpen ? <FiChevronUp /> : <FiChevronDown />}
    </Flex>
  </MenuTrigger>
);

export default UserMenuButton;
