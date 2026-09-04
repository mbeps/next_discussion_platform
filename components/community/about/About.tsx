import { Box, Button, Flex, Stack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import useCommunityPermissions from "@/hooks/community/useCommunityPermissions";
import useCommunityState from "@/hooks/community/useCommunityState";
import type { Community } from "@/types/community";
import CommunityMembersModal from "../../modal/community-members/CommunityMembersModal";
import AboutCommunity from "./AboutCommunity";
import AboutHeaderBar from "./AboutHeaderBar";
import AdminSectionAbout from "./AdminSectionAbout";

/**
 * @param {string} communityName - Name of the community
 */
type AboutProps = {
  communityData: Community;
};

/**
 * This about component is used for displaying general information about the community.
 * It displays the following data:
 *  - The number of subscribers in the community
 *  - Date when the community was created
 *  - Button for creating a new post
 *
 * Additional elements are displayed if the current user is an admin:
 *  - Button for opening the community settings modal
 * @param {communityData} - data required to be displayed
 * @returns (React.FC<AboutProps>) - About component
 * @requires AboutHeaderBar - Header bar for the about section.
 * @requires AboutCommunity - Displays the number of subscribers and the date when the community was created.
 * @requires AdminSectionAbout - Displays some additional elements if the current user is an admin.
 */
const About: React.FC<AboutProps> = ({ communityData }) => {
  const router = useRouter();
  const { communityStateValue } = useCommunityState();
  const isJoined = !!communityStateValue.mySnippets.find(
    (item) => item.communityId === communityData.id,
  );
  const [isMembersModalOpen, setMembersModalOpen] = useState(false);
  const { canView, canPost } = useCommunityPermissions(communityData);

  if (!canView) {
    return null;
  }

  return (
    // sticky position for the about section
    <Box position="sticky" top="80px" borderRadius={10} shadow="md">
      <AboutHeaderBar communityName={communityData.id} />

      {/* about section */}
      <Flex
        direction="column"
        p={3}
        bg={{ base: "white", _dark: "gray.800" }}
        borderRadius="0px 0px 10px 10px"
      >
        {isJoined && (
          <CommunityMembersModal
            isOpen={isMembersModalOpen}
            onClose={() => setMembersModalOpen(false)}
            communityId={communityData.id}
          />
        )}
        <Stack>
          <AboutCommunity communityData={communityData} />
          {canPost && (
            <Button
              width="100%"
              onClick={() => {
                router.push(`/community/${communityData.id}/submit`);
              }}
            >
              Create Post
            </Button>
          )}
          {isJoined && (
            <Button
              width="100%"
              variant="outline"
              onClick={() => setMembersModalOpen(true)}
            >
              View Subscribers
            </Button>
          )}
          <AdminSectionAbout communityData={communityData} />
        </Stack>
      </Flex>
    </Box>
  );
};
export default About;
