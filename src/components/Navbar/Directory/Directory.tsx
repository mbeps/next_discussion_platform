import useDirectory from "@/hooks/useDirectory";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import {
  Flex,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuList,
  Stack,
  Text,
} from "@chakra-ui/react";
import React from "react";
import Communities from "./Communities";

/**
 * Component for displaying the directory menu.
 * It displays:
 *  - Button to create a community (opens community creation modal)
 *  - List of communities the user is subscribed to
 * The directory button itself is responsive:
 *  - Only icon is shown on mobile
 *  - Both icon and community name are shown on desktop
 * @requires ./Communities - community creation modal
 *
 * @returns {React.FC} - button to open the directory menu and the directory menu itself
 */
const UserMenu: React.FC = () => {
  const { directoryState, toggleMenuOpen } = useDirectory();

  return (
    <Menu isOpen={directoryState.isOpen}>
      <MenuButton
        onClick={toggleMenuOpen}
        cursor="pointer"
        padding="0px 6px"
        borderRadius={10}
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
            {/* if community is selected */}
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
          {directoryState.isOpen ? (
            <>
              <ChevronUpIcon />
            </>
          ) : (
            <>
              <ChevronDownIcon />
            </>
          )}
        </Flex>
      </MenuButton>
      <MenuList borderRadius={10} mt={2} shadow="lg">
        <Flex justifyContent="center">
          <Stack spacing={1} width="95%">
            {/* Communities menu to open the community creation modal */}
            <Communities />
          </Stack>
        </Flex>
      </MenuList>
    </Menu>
  );
};
export default UserMenu;
