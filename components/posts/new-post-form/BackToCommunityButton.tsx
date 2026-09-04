import { Button, Icon } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import type React from "react";
import { MdOutlineArrowBackIos } from "react-icons/md";

interface BackToCommunityButtonProps {
  communityId?: string;
}

/**
 * Button that navigates back to the community page from the new post form.
 * @param communityId - Target community id for the route.
 * @returns Outline button with back icon.
 */
const BackToCommunityButton: React.FC<BackToCommunityButtonProps> = ({
  communityId,
}) => {
  const router = useRouter();
  const communityLink = `/community/${communityId}`;

  return (
    <Button
      variant="outline"
      mt={4}
      ml={4}
      mr={4}
      justifyContent="left"
      width="fit-content"
      onClick={() => router.push(communityLink)}
    >
      <Icon as={MdOutlineArrowBackIos} mr={2} />
      {`Back to ${communityId}`}
    </Button>
  );
};

export default BackToCommunityButton;
