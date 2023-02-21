import { communityState } from "@/atoms/communitiesAtom";
import CreateCommunityModal from "@/components/Modal/CreateCommunity/CreateCommunityModal";
import { Box, Flex, Icon, MenuItem, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { GrAdd } from "react-icons/gr";
import { IoPeopleCircleOutline } from "react-icons/io5";
import { useRecoilValue } from "recoil";
import MenuListItem from "./MenuListItem";

type CommunitiesProps = {};

/**
 * Option in the community directory.
 * This option will open the community creation modal.
 * @requires ./Directory - child of directory
 * @returns
 */
const Communities: React.FC<CommunitiesProps> = () => {
  const [open, setOpen] = useState(false); // modal initially closed
  const mySnippets = useRecoilValue(communityState).mySnippets;

  return (
    <>
      {/* Sets the state of the community creation modal to true which opens the modal */}
      <CreateCommunityModal open={open} handleClose={() => setOpen(false)} />
      <Box>
        <Text pl={3} mb={1} fontSize="7pt" fontWeight={500} color="gray.500">
          PRIVILEGED
        </Text>
        {mySnippets
          .filter((snippet) => snippet.isAdmin)
          .map((snippet) => (
            <MenuListItem
              key={snippet.communityId}
              icon={IoPeopleCircleOutline}
              displayText={snippet.communityId}
              link={`/community/${snippet.communityId}`}
              iconColor={"red.500"}
              imageURL={snippet.imageURL}
            />
          ))}
      </Box>

      <Box>
        <Text pl={3} mb={1} fontSize="7pt" fontWeight={500} color="gray.500">
          SUBSCRIBED COMMUNITIES
        </Text>
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
        {mySnippets.map((snippet) => (
          <MenuListItem
            key={snippet.communityId}
            icon={IoPeopleCircleOutline}
            displayText={snippet.communityId}
            link={`/community/${snippet.communityId}`}
            iconColor={"red.500"}
            imageURL={snippet.imageURL}
          />
        ))}
      </Box>
    </>
  );
};
export default Communities;
