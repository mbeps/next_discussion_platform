import { Button } from "@chakra-ui/react";
import type React from "react";
import { useState } from "react";
import CommunitySettingsModal from "@/components/modal/community-settings/CommunitySettings";
import useCommunityPermissions from "@/hooks/community/useCommunityPermissions";
import type { Community } from "@/types/community";

type AdminSectionAboutProps = {
  communityData: Community;
};

/**
 * Shows a community settings entry point when the viewer is an admin.
 * @param communityData - Community used to derive permissions and pass into the modal.
 * @returns Button and modal wiring for admin settings.
 */
const AdminSectionAbout: React.FC<AdminSectionAboutProps> = ({
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
          <Button
            width="100%"
            variant={"outline"}
            onClick={() => setCommunitySettingsModalOpen(true)}
          >
            Community Settings
          </Button>
        </>
      )}
    </>
  );
};

export default AdminSectionAbout;
