import {
  Flex,
  Icon,
  Image,
  MenuContent,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  Stack,
  Text,
} from "@chakra-ui/react";
import type React from "react";
import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import CreateCommunityModal from "@/components/modal/create-community/CreateCommunityModal";
import useDirectory from "@/hooks/useDirectory";
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
  const { directoryState, setDirectoryOpen } = useDirectory();
  const [open, setOpen] = useState(false);

  return (
    <>
      <CreateCommunityModal open={open} handleClose={() => setOpen(false)} />
      <MenuRoot
        open={directoryState.isOpen}
        onOpenChange={({ open }: { open: boolean }) => setDirectoryOpen(open)}
      >
        <MenuTrigger
          cursor="pointer"
          padding="0px 6px"
          borderRadius={"xl"}
          mr={2}
          ml={{ base: 0, md: 2 }}
          _hover={{
            outline: "1px solid",
            outlineColor: { base: "gray.200", _dark: "gray.600" },
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
                  boxSize="34px"
                  mr={2}
                />
              ) : (
                <Icon
                  fontSize={34}
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
            {directoryState.isOpen ? <FiChevronUp /> : <FiChevronDown />}
          </Flex>
        </MenuTrigger>
        <MenuPositioner>
          <MenuContent
            borderRadius={"xl"}
            mt={2}
            shadow="lg"
            minW="260px"
            maxH="70vh"
            overflowY="auto"
            pt={2}
          >
            <Flex justifyContent="center">
              <Stack gap={1} width="95%">
                {/* Communities menu to open the community creation modal */}
                <Communities handleCreateCommunity={() => setOpen(true)} />
              </Stack>
            </Flex>
          </MenuContent>
        </MenuPositioner>
      </MenuRoot>
    </>
  );
};
export default UserMenu;
