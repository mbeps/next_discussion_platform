import { Flex, Stack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import type React from "react";
import type { Community } from "@/types/community";
import CommunityItemButtonMembersSection from "./CommunityItemButtonMembersSection";
import CommunityItemNameIconSection from "./CommunityItemNameIconSection";

/**
 * @param {Community} community - community object
 * @param {boolean} isJoined - whether the user is joined to the community
 * @param {(community: Community, isJoined: boolean) => void} onJoinOrLeaveCommunity - function to join or leave a community
 */
interface CommunityItemProps {
  community: Community;
  isJoined: boolean;
  onJoinOrLeaveCommunity: (community: Community, isJoined: boolean) => void;
}

/**
 * Card displaying a community (name and logo) with the subscribe button and the number of members.
 * The card is clickable and will redirect to the community page.
 * If the screen size is mobile, the name and logo will be on top of the subscribe button and the number of members.
 * If the screen size is desktop, the name and logo will be on the left side of the card and the subscribe button and the number of members will be on the right side.
 * @param {Community} community - community object
 * @param {boolean} isJoined - whether the user is joined to the community
 * @param {(community: Community, isJoined: boolean) => void} onJoinOrLeaveCommunity - function to join or leave a community
 *
 * @returns {React.FC} - the community item component
 */
const CommunityItem: React.FC<CommunityItemProps> = ({
  community,
  isJoined,
  onJoinOrLeaveCommunity,
}) => {
  const router = useRouter();

  return (
    <Flex
      align="center"
      fontSize="10pt"
      borderColor={{ base: "white", _dark: "gray.700" }}
      borderWidth="1px"
      p="14px 12px"
      borderRadius={10}
      bg={{ base: "white", _dark: "gray.800" }}
      _hover={{
        borderColor: { base: "gray.400", _dark: "gray.600" },
        boxShadow: "sm",
      }}
      cursor="pointer"
      onClick={() => {
        router.push(`/community/${community.id}`);
      }}
      shadow="md"
    >
      <Stack
        direction={{ base: "column", md: "row" }}
        flexGrow={1}
        align="left"
      >
        <CommunityItemNameIconSection community={community} />
        <CommunityItemButtonMembersSection
          community={community}
          onJoinOrLeaveCommunity={onJoinOrLeaveCommunity}
          isJoined={isJoined}
        />
      </Stack>
    </Flex>
  );
};

export default CommunityItem;
