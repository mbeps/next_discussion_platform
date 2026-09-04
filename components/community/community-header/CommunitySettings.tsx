import { Icon, IconButton } from "@chakra-ui/react";
import type React from "react";
import { useState } from "react";
import { FiSettings } from "react-icons/fi";
import useCommunityPermissions from "@/hooks/community/useCommunityPermissions";
import type { Community } from "@/types/community";
import CommunitySettingsModal from "../../modal/community-settings/CommunitySettings";

type CommunitySettingsProps = {
  communityData: Community;
};

/**
 * Settings gear shown to community admins.
 * @param communityData - Community used for permission checks and modal context.
 * @returns Icon button that opens the community settings modal.
 */
const CommunitySettings: React.FC<CommunitySettingsProps> = ({
  communityData,
}) => {
  const [isCommunitySettingsModalOpen, setCommunitySettingsModalOpen] =
    useState(false);
  const { isAdmin } = useCommunityPermissions(communityData);

  return (
    <>
      {isAdmin && (
        <>
          <CommunitySettingsModal
            open={isCommunitySettingsModalOpen}
            handleClose={() => setCommunitySettingsModalOpen(false)}
            communityData={communityData}
          />
          <IconButton
            aria-label="Toggle color mode"
            variant="ghost"
            fontSize={20}
            onClick={() => setCommunitySettingsModalOpen(true)}
          >
            <Icon as={FiSettings} />
          </IconButton>
        </>
      )}
    </>
  );
};

export default CommunitySettings;
