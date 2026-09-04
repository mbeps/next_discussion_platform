import { Box, Flex } from "@chakra-ui/react";
import type React from "react";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import ConfirmationDialog from "@/components/modal/ConfirmationDialog";
import { auth } from "@/firebase/clientApp";
import useCommunityMembershipActions from "@/hooks/community/useCommunityMembershipActions";
import useCommunityState from "@/hooks/community/useCommunityState";
import type { Community } from "@/types/community";
import CommunityIcon from "./CommunityIcon";
import CommunityMembersButton from "./CommunityMembersButton";
import CommunityName from "./CommunityName";
import CommunitySettings from "./CommunitySettings";
import JoinOrLeaveButton from "./JoinOrLeaveButton";

/**
 * @param {communityData} - data required to be displayed
 */
type HeaderProps = {
  communityData: Community;
};

/**
 * Displays a community header which is responsive.
 * Community header contains:
 *  - Community logo
 *  - Community name
 *  - Subscribe and unsubscribe button
 * @param {communityData} - data required to be displayed
 *
 * @returns {React.FC<HeaderProps>} - Header component
 *
 * @requires CommunityIcon - Displays the community icon.
 * @requires CommunityName - Displays the name of the community.
 * @requires JoinOrLeaveButton - Displays the subscribe and unsubscribe button.
 */
const CommunityHeader: React.FC<HeaderProps> = ({ communityData }) => {
  const { communityStateValue } = useCommunityState();
  const { onJoinOrLeaveCommunity, loading } = useCommunityMembershipActions();
  const [user, authLoading] = useAuthState(auth);
  const isJoined = !!communityStateValue.mySnippets.find(
    (item) => item.communityId === communityData.id,
  );
  const [leaveConfirmationOpen, setLeaveConfirmationOpen] = useState(false);

  const isGlobalLoading =
    authLoading || (!!user && !communityStateValue.snippetFetched);

  const handleJoinOrLeave = () => {
    if (isJoined) {
      setLeaveConfirmationOpen(true);
    } else {
      onJoinOrLeaveCommunity(communityData, isJoined);
    }
  };

  const onConfirmLeave = async () => {
    await onJoinOrLeaveCommunity(communityData, isJoined);
    setLeaveConfirmationOpen(false);
  };

  return (
    <Flex direction="column" width="100%" height="120px">
      <Box height="30%" bg="red.500" />
      <Flex
        justify="center"
        bg={{ base: "white", _dark: "gray.800" }}
        flexGrow={1}
      >
        <Flex width="95%" maxWidth="1200px" align="center">
          {/* using state instead of fetching from db as no refresh of the page is required */}
          <CommunityIcon
            imageURL={communityStateValue.currentCommunity?.imageURL}
          />

          <Flex padding="10px 16px" width="100%">
            <CommunityName id={communityData.id} />
            <Flex
              direction="row"
              flexGrow={1}
              align="center"
              justify="end"
              gap={2}
            >
              <CommunityMembersButton
                communityId={communityData.id}
                isJoined={isJoined}
              />
              <CommunitySettings communityData={communityData} />
              <JoinOrLeaveButton
                isJoined={isJoined}
                onClick={handleJoinOrLeave}
                isLoading={loading || isGlobalLoading}
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <ConfirmationDialog
        open={leaveConfirmationOpen}
        onClose={() => setLeaveConfirmationOpen(false)}
        onConfirm={onConfirmLeave}
        title="Unsubscribe from Community"
        body={`Are you sure you want to unsubscribe from r/${communityData.id}?`}
        confirmButtonText="Unsubscribe"
        isLoading={loading}
      />
    </Flex>
  );
};
export default CommunityHeader;
