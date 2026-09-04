import { Button, Flex, Icon, Stack } from "@chakra-ui/react";
import type React from "react";
import { BsFillPeopleFill } from "react-icons/bs";
import type { Community } from "@/types/community";

type CommunityItemButtonMembersSectionProps = {
  community: Community;
  onJoinOrLeaveCommunity: (community: Community, isJoined: boolean) => void;
  isJoined: boolean;
};

/**
 * Shows member count and a subscribe/unsubscribe button for a community list row.
 * @param community - Community data including member count.
 * @param onJoinOrLeaveCommunity - Handler for join/leave clicks.
 * @param isJoined - Membership flag to toggle variant and label.
 * @returns Row with count icon and action button.
 */
const CommunityItemButtonMembersSection: React.FC<
  CommunityItemButtonMembersSectionProps
> = ({ community, onJoinOrLeaveCommunity, isJoined }) => {
  return (
    <Stack direction="row" align="center" justifyContent="space-between">
      <Flex
        fontSize={18}
        color={{ base: "gray.500", _dark: "gray.400" }}
        justify="center"
        align="center"
        mr={2}
      >
        <Icon as={BsFillPeopleFill} mr={1} />
        {community.numberOfMembers}
      </Flex>
      <Button
        height="30px"
        width="130px"
        fontSize="10pt"
        variant={isJoined ? "outline" : "solid"}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation(); // stop the event from bubbling up
          onJoinOrLeaveCommunity(community, isJoined);
        }}
      >
        {isJoined ? "Unsubscribe" : "Subscribe"}
      </Button>
    </Stack>
  );
};

export default CommunityItemButtonMembersSection;
