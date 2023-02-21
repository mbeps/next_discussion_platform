import useDirectory from "@/hooks/useDirectory";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  Text,
  Image,
} from "@chakra-ui/react";
import React from "react";
import { TiHome } from "react-icons/ti";
import Communities from "./Communities";

/**
 * Displays a menu item for community.
 * It displays the option to create a community (opens the community create modal).
 * The directory button itself is responsive:
 *    - Only icon is shown on mobile
 *    - Both icon and community name are shown on desktop
 * todo: Displays a list of all communities the user is subscribed to.
 * @requires ./Communities - community creation modal
 * @returns (React.FC) - community directory menu
 */
const UserMenu: React.FC = () => {
  const { directoryState, toggleMenuOpen } = useDirectory();

  return (
    <Menu isOpen={directoryState.isOpen}>
      <MenuButton
        onClick={toggleMenuOpen}
        cursor="pointer"
        padding="0px 6px"
        borderRadius={4}
        mr={2}
        ml={{ base: 0, md: 2 }}
        _hover={{
          outline: "1px solid",
          outlineColor: "gray.200",
        }}
      >
        <Flex
          align="center"
          justify="space-between"
          width={{ base: "auto", lg: "200px" }}
        >
          <Flex align="center">
            {directoryState.selectedMenuItem.imageURL ? (
              <Image
                src={directoryState.selectedMenuItem.imageURL}
                alt="Community logo"
                borderRadius="full"
                boxSize="24px"
                mr={2}
              />
            ) : (
              <Icon
                fontSize={24}
                mr={{ base: 1, md: 2 }}
                as={directoryState.selectedMenuItem.icon}
                color={directoryState.selectedMenuItem.iconColor}
              />
            )}
            <Flex display={{ base: "none", lg: "flex" }}>
              <Text fontWeight={600} fontSize="10pt">
                {directoryState.selectedMenuItem.displayText}
              </Text>
            </Flex>
          </Flex>
          <ChevronDownIcon />
        </Flex>
      </MenuButton>
      <MenuList>
        {/* Communities menu to open the community creation modal */}
        <Communities />
      </MenuList>
    </Menu>
  );
};
export default UserMenu;
