import CreateCommunityModal from "@/components/Modal/CreateCommunity/CreateCommunityModal";
import { Flex, Icon, MenuItem } from "@chakra-ui/react";
import React, { useState } from "react";
import { GrAdd } from "react-icons/gr";

type CommunitiesProps = {};

/**
 * Option in the community directory.
 * This option will open the community creation modal.
 * @requires ./Directory - child of directory
 * @returns
 */
const Communities: React.FC<CommunitiesProps> = () => {
  const [open, setOpen] = useState(false); // modal initially closed
  return (
    <>
      {/* Sets the state of the community creation modal to true which opens the modal */}
      <CreateCommunityModal open={open} handleClose={() => setOpen(false)} />
      <MenuItem
        width="100%"
        fontSize="10pt"
        _hover={{ bg: "gray.100" }}
        onClick={() => setOpen(true)}
      >
        <Flex align="center">
          <Icon fontSize={20} mr={2} as={GrAdd} />
          Create Community
        </Flex>
      </MenuItem>
    </>
  );
};
export default Communities;
