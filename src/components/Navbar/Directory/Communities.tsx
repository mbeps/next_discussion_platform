import { communityState } from "@/atoms/communitiesAtom";
import CreateCommunityModal from "@/components/Modal/CreateCommunity/CreateCommunityModal";
import useDirectory from "@/hooks/useDirectory";
import { Box, Flex, Icon, MenuItem, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { BsFillPeopleFill } from "react-icons/bs";
import { GrAdd } from "react-icons/gr";
import { IoPeopleCircleOutline } from "react-icons/io5";
import { useRecoilValue } from "recoil";
import MenuListItem from "./MenuListItem";

type CommunitiesProps = {};

/**
 * In the `Directory` component, a list of communities the user is subscribed to is displayed.
 * The list is sectioned into two parts: `Privileged` and `Subscribed Communities`:
 *  - `Privileged` communities are communities the user is an admin of.
 *  - `Subscribed Communities` are communities the user is a member of.
 *
 * @returns {React.FC<CommunitiesProps>} - React Functional Component
 *
 * @requires ./MenuListItem - menu item for each community
 */
const Communities: React.FC<CommunitiesProps> = () => {
  const [open, setOpen] = useState(false); // modal initially closed
  const mySnippets = useRecoilValue(communityState).mySnippets;
  const router = useRouter();
  const { toggleMenuOpen } = useDirectory();

  return (
    <>
      {/* Sets the state of the community creation modal to true which opens the modal */}
      <CreateCommunityModal open={open} handleClose={() => setOpen(false)} />
      <MenuItem
        fontSize="10pt"
        fontWeight={700}
        height="40px"
        borderRadius={10}
        alignContent="center"
        _hover={{
          bg: "gray.300",
          color: "black",
        }}
        onClick={() => {
          setOpen(true);
          toggleMenuOpen();
        }}
      >
        <Flex align="center">
          <Icon fontSize={20} mr={2} as={GrAdd} />
          Create Community
        </Flex>
      </MenuItem>

      <MenuItem
        fontSize="10pt"
        fontWeight={700}
        height="40px"
        borderRadius={10}
        alignContent="center"
        _hover={{
          bg: "gray.300",
          color: "black",
        }}
        onClick={() => {
          router.push("/communities");
          toggleMenuOpen();
        }}
      >
        <Flex align="center">
          <Icon fontSize={20} mr={2} as={BsFillPeopleFill} />
          View All Communities
        </Flex>
      </MenuItem>

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
