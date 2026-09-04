import { Icon, IconButton } from "@chakra-ui/react";
import type React from "react";
import { useState } from "react";
import { FiUsers } from "react-icons/fi";
import CommunityMembersModal from "../../modal/community-members/CommunityMembersModal";

type CommunityMembersButtonProps = {
  communityId: string;
  isJoined: boolean;
};

/**
 * Button that opens the community members modal for subscribers.
 * @param communityId - Community whose members should be listed.
 * @param isJoined - Whether the current user is a member; hides button otherwise.
 * @returns Icon button and modal wiring.
 */
const CommunityMembersButton: React.FC<CommunityMembersButtonProps> = ({
  communityId,
  isJoined,
}) => {
  const [isModalOpen, setModalOpen] = useState(false);

  if (!isJoined) {
    return null;
  }

  return (
    <>
      <CommunityMembersModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        communityId={communityId}
      />
      <IconButton
        aria-label="Toggle color mode"
        variant="ghost"
        fontSize={20}
        onClick={() => setModalOpen(true)}
      >
        <Icon as={FiUsers} />
      </IconButton>
    </>
  );
};

export default CommunityMembersButton;
