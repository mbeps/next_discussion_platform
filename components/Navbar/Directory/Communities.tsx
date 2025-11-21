import { communityState } from "@/atoms/communitiesAtom";
import CustomMenuButton from "@/components/atoms/CustomMenuButton";
import useDirectory from "@/hooks/useDirectory";
import { Box, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { BsFillPeopleFill } from "react-icons/bs";
import { GrAdd } from "react-icons/gr";
import { IoPeopleCircleOutline } from "react-icons/io5";
import { useRecoilValue } from "recoil";
import MenuListItem from "./MenuListItem";

type CommunitiesProps = {
  handleCreateCommunity: () => void;
};

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
const Communities: React.FC<CommunitiesProps> = ({ handleCreateCommunity }) => {
  const mySnippets = useRecoilValue(communityState).mySnippets;
  const router = useRouter();
  const { toggleMenuOpen } = useDirectory();

  return (
    <>
      <CustomMenuButton
        icon={<GrAdd />}
        text="Create Community"
        onClick={() => {
          handleCreateCommunity();
          toggleMenuOpen();
        }}
      />

      <CustomMenuButton
        icon={<BsFillPeopleFill />}
        text="View All Communities"
        onClick={() => {
          router.push("/communities");
          toggleMenuOpen();
        }}
      />

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
