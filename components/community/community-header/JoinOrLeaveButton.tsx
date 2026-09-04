import { Button } from "@chakra-ui/react";
import type React from "react";

type JoinOrLeaveButtonProps = {
  isJoined: boolean;
  onClick: () => void;
  isLoading?: boolean;
};

/**
 * Subscription toggle button for a community header.
 * @param isJoined - Whether the viewer is already subscribed.
 * @param onClick - Handler to join or leave.
 * @param isLoading - Shows loading state when membership is updating.
 * @returns Styled button with subscribe/unsubscribe label.
 */
const JoinOrLeaveButton: React.FC<JoinOrLeaveButtonProps> = ({
  isJoined,
  onClick,
  isLoading,
}) => {
  return (
    <Button
      variant={isJoined ? "outline" : "solid"}
      height="40px"
      pr={{ base: 2, md: 6 }}
      pl={{ base: 2, md: 6 }}
      onClick={onClick}
      shadow="md"
      width="120px"
      loading={isLoading}
    >
      {isJoined ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
};

export default JoinOrLeaveButton;
